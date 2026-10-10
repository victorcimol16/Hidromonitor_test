import { areaPathFromLine, smoothLinePath, toChartPoints } from "../lib/chartPath";
import type { Reading } from "../lib/consumption";

const CHART_WIDTH = 320;
const CHART_HEIGHT = 90;
const CHART_PADDING_Y = 10;
const MAX_POINTS = 12;

export function ConsumptionChart({ readings }: { readings: Reading[] }) {
  if (readings.length < 2) {
    return (
      <div className="mt-4 grid h-24 place-items-center rounded-2xl border border-border bg-muted/30 p-4 text-center text-xs text-muted-foreground">
        Leituras insuficientes para exibir o gráfico.
      </div>
    );
  }

  const recent = readings.slice(-MAX_POINTS);
  const points = toChartPoints(
    recent.map((r) => r.liters),
    CHART_WIDTH,
    CHART_HEIGHT - 2,
    CHART_PADDING_Y,
  );
  const linePath = smoothLinePath(points);
  const areaPath = areaPathFromLine(linePath, points, CHART_HEIGHT);

  return (
    <div className="mt-4 rounded-2xl border border-border bg-muted/30 p-4">
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        className="h-24 w-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="dashfill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#dashfill)" />
        <path
          d={linePath}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3.5"
            fill="var(--card)"
            stroke="var(--primary)"
            strokeWidth="2"
          />
        ))}
      </svg>
    </div>
  );
}
