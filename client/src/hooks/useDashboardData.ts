/**
 * useDashboardData — smart data loading strategy:
 * 1. Show static /data.json immediately (instant render, no blank page)
 * 2. Fetch live data from tRPC/S3 in background
 * 3. If S3 data is newer (different reportDate), replace static data
 * 4. S3 is always the source of truth for daily updates
 */
import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import type { DashboardData } from "@/lib/types";

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<"static" | "live">("static");
  const staticLoaded = useRef(false);

  // Step 1: Load static file immediately for instant render
  useEffect(() => {
    fetch("/data.json?v=" + Date.now()) // cache-bust
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load dashboard data");
        return res.json();
      })
      .then((json: DashboardData) => {
        if (!staticLoaded.current) {
          staticLoaded.current = true;
          setData(json);
          setLoading(false);
          setDataSource("static");
        }
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Step 2: Fetch live data from tRPC (S3) — non-blocking background refresh
  const trpcQuery = trpc.dashboard.getData.useQuery(undefined, {
    retry: 1,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });

  // Step 3: When tRPC data arrives, always prefer it over static (it's the live source)
  useEffect(() => {
    if (trpcQuery.data?.data) {
      const liveData = trpcQuery.data.data as unknown as DashboardData;
      setData(liveData);
      setDataSource("live");
      setLoading(false);
      setError(null);
    }
  }, [trpcQuery.data]);

  return { data, loading, error, dataSource };
}
