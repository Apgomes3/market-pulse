/**
 * useDashboardData — instant load from static /data.json, then background refresh from tRPC (S3)
 * This ensures the page renders immediately, then updates if S3 has newer data.
 */
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import type { DashboardData } from "@/lib/types";

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load static file immediately (synchronous, instant)
  useEffect(() => {
    fetch("/data.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load dashboard data");
        return res.json();
      })
      .then((json: DashboardData) => {
        setData(json);
        setLoading(false);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Background refresh from tRPC (S3) — non-blocking, updates if newer data available
  const trpcQuery = trpc.dashboard.getData.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update data if tRPC returns newer data
  useEffect(() => {
    if (trpcQuery.data?.data) {
      setData((trpcQuery.data.data as unknown) as DashboardData);
    }
  }, [trpcQuery.data]);

  return { data, loading, error };
}
