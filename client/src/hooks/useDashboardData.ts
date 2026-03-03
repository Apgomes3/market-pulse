/**
 * useDashboardData — fetches dashboard data from tRPC (S3) with fallback to static /data.json
 */
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import type { DashboardData } from "@/lib/types";

export function useDashboardData() {
  const [staticData, setStaticData] = useState<DashboardData | null>(null);
  const [staticLoading, setStaticLoading] = useState(true);
  const [staticError, setStaticError] = useState<string | null>(null);

  // Try tRPC first (S3 data)
  const trpcQuery = trpc.dashboard.getData.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Fallback: load from static /data.json if tRPC returns null
  useEffect(() => {
    if (!trpcQuery.isLoading && (!trpcQuery.data?.data)) {
      fetch("/data.json")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load dashboard data");
          return res.json();
        })
        .then((json: DashboardData) => {
          setStaticData(json);
          setStaticLoading(false);
        })
        .catch((err) => {
          setStaticError(err.message);
          setStaticLoading(false);
        });
    } else if (!trpcQuery.isLoading) {
      setStaticLoading(false);
    }
  }, [trpcQuery.isLoading, trpcQuery.data]);

  const data = (trpcQuery.data?.data as DashboardData | null) ?? staticData;
  const loading = trpcQuery.isLoading || (staticLoading && !trpcQuery.data?.data);
  const error = trpcQuery.error?.message ?? staticError;

  return { data, loading, error };
}
