import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Reading } from "../lib/consumption";

export const READINGS_QUERY_KEY = ["readings"] as const;

// Plenty for day/week/month deltas and a recent-trend chart without paging.
const READINGS_FETCH_LIMIT = 200;

async function fetchReadingsAscending(): Promise<Reading[]> {
  const { data, error } = await supabase
    .from("readings")
    .select("id, liters, read_at")
    .order("read_at", { ascending: true })
    .limit(READINGS_FETCH_LIMIT);
  if (error) throw error;
  return data ?? [];
}

/** Fetches the signed-in user's readings (RLS-scoped) and keeps them live via Supabase Realtime. */
export function useReadings() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("readings-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "readings" }, () =>
        queryClient.invalidateQueries({ queryKey: READINGS_QUERY_KEY }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({ queryKey: READINGS_QUERY_KEY, queryFn: fetchReadingsAscending });
}
