export function formatFlowRate(litersPerMinute: number): string {
  return `${litersPerMinute.toLocaleString("pt-BR")} L/min`;
}

export function formatPercent(percent: number): string {
  return `${Math.round(percent)}%`;
}

// Every device starts here until a real sensor integration reports readings.
export const ZERO_DEVICE_METRICS = {
  currentLiters: 0,
  accumulatedLiters: 0,
  flowRateLPerMin: 0,
  reservoirPercent: 0,
  dailyLiters: 0,
  monthlyLiters: 0,
} as const;
