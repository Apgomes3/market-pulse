/**
 * useDashboardData — runtime data fetching strategy:
 *
 * Priority order:
 * 1. GitHub raw URL (always fresh — updated by daily automation)
 * 2. tRPC/S3 backend (if GitHub fetch fails)
 * 3. Local static /data.json (final fallback if both above fail)
 *
 * This means the published site NEVER needs a rebuild or republish for daily data updates.
 * The daily automation just pushes to GitHub and the site picks it up automatically.
 */
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import type { DashboardData } from "@/lib/types";

// GitHub raw URL — updated daily by the automation script
const GITHUB_RAW_URL =
  "https://raw.githubusercontent.com/Apgomes3/market-pulse/main/client/public/data.json";

// Local static fallback (baked into the build)
const LOCAL_FALLBACK_URL = "/data.json";

async function fetchWithTimeout(url: string, timeoutMs = 5000): Promise<DashboardData> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<"github" | "s3" | "static">("static");

  // tRPC/S3 query — used as secondary fallback, non-blocking
  const trpcQuery = trpc.dashboard.getData.useQuery(undefined, {
    retry: 1,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    staleTime: 3 * 60 * 1000, // 3 minutes
    enabled: false, // only trigger manually as fallback
  });

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      // Step 1: Try GitHub raw URL (cache-busted with timestamp)
      try {
        const githubUrl = `${GITHUB_RAW_URL}?t=${Date.now()}`;
        const json = await fetchWithTimeout(githubUrl, 6000);
        if (!cancelled) {
          setData(json);
          setDataSource("github");
          setLoading(false);
          setError(null);
          return;
        }
      } catch (githubErr) {
        console.warn("[Data] GitHub fetch failed, trying local fallback:", githubErr);
      }

      // Step 2: Try local static /data.json (baked into build)
      try {
        const json = await fetchWithTimeout(`${LOCAL_FALLBACK_URL}?t=${Date.now()}`, 3000);
        if (!cancelled) {
          setData(json);
          setDataSource("static");
          setLoading(false);
          setError(null);
          return;
        }
      } catch (localErr) {
        console.warn("[Data] Local fallback failed:", localErr);
      }

      // Step 3: All fetches failed
      if (!cancelled) {
        setError("Failed to load dashboard data. Please refresh.");
        setLoading(false);
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, []);

  // If tRPC returns data and we're still on static, upgrade to S3 data
  useEffect(() => {
    if (trpcQuery.data?.data && dataSource === "static") {
      setData(trpcQuery.data.data as unknown as DashboardData);
      setDataSource("s3");
    }
  }, [trpcQuery.data, dataSource]);

  return { data, loading, error, dataSource };
}
