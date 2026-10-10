import type { Tables } from "@/integrations/supabase/types";

export type Reading = Pick<Tables<"readings">, "id" | "liters" | "read_at">;

export type ConsumptionSummary = {
  latestLiters: number | null;
  todayLiters: number | null;
  weekLiters: number | null;
  monthLiters: number | null;
};

/** `readings` must be sorted ascending by `read_at`. Returns the last reading at or before `cutoff`. */
function lastReadingBefore(readings: Reading[], cutoff: Date): Reading | undefined {
  let candidate: Reading | undefined;
  for (const reading of readings) {
    if (new Date(reading.read_at) <= cutoff) candidate = reading;
    else break;
  }
  return candidate;
}

/**
 * A hidrômetro reports a cumulative total, like an odometer — so "consumption in
 * a period" is (latest reading − last reading at or before the period start).
 * Returns null when there's no reading old enough to anchor the delta, so the UI
 * can show "insufficient data" instead of a misleading number.
 */
export function summarizeConsumption(readingsAscending: Reading[], now: Date): ConsumptionSummary {
  if (readingsAscending.length === 0) {
    return { latestLiters: null, todayLiters: null, weekLiters: null, monthLiters: null };
  }

  const latest = readingsAscending[readingsAscending.length - 1];
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday.getTime() - 6 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(startOfToday.getTime() - 29 * 24 * 60 * 60 * 1000);

  const deltaSince = (cutoff: Date) => {
    const baseline = lastReadingBefore(readingsAscending, cutoff);
    if (!baseline || baseline.id === latest.id) return null;
    return Math.max(0, latest.liters - baseline.liters);
  };

  return {
    latestLiters: latest.liters,
    todayLiters: deltaSince(startOfToday),
    weekLiters: deltaSince(startOfWeek),
    monthLiters: deltaSince(startOfMonth),
  };
}

export function formatLiters(liters: number): string {
  return `${Math.round(liters).toLocaleString("pt-BR")} L`;
}

export function formatCubicMeters(liters: number): string {
  return `${(liters / 1000).toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} m³`;
}
