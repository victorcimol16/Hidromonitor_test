import { useMemo, useState } from "react";
import { smoothLinePath, areaPathFromLine, toChartPoints } from "../lib/chartPath";

type Range = "7" | "30";

export type DailyPoint = { label: string; liters: number };

const VIEW_W = 720;
const VIEW_H = 240;
const PAD_Y = 24;

export function AggregateConsumptionChart({
  getSeries,
}: {
  /** Retorna o consumo agregado (L) por dia para a janela pedida. Vem dos dispositivos. */
  getSeries: (days: number) => DailyPoint[];
}) {
  const [range, setRange] = useState<Range>("7");
  const [hover, setHover] = useState<number | null>(null);

  const series = useMemo(() => getSeries(range === "7" ? 7 : 30), [getSeries, range]);
  const values = series.map((s) => s.liters);
  const hasData = values.some((v) => v > 0);

  const points = useMemo(
    () => toChartPoints(values, VIEW_W, VIEW_H, PAD_Y),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [range, values.join(",")],
  );
  const linePath = smoothLinePath(points);
  const areaPath = areaPathFromLine(linePath, points, VIEW_H);

  const active = hasData && hover != null ? points[hover] : null;
  const activeData = hasData && hover != null ? series[hover] : null;

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!hasData) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const idx = Math.round(ratio * (series.length - 1));
    setHover(Math.max(0, Math.min(series.length - 1, idx)));
  }

  const labelEvery = range === "7" ? 1 : 5;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-foreground">Consumo agregado</h3>
        <div className="inline-flex rounded-lg bg-muted p-0.5 text-xs font-medium">
          <button
            type="button"
            onClick={() => setRange("7")}
            className={`rounded-md px-3 py-1 transition-colors ${
              range === "7" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            7 dias
          </button>
          <button
            type="button"
            onClick={() => setRange("30")}
            className={`rounded-md px-3 py-1 transition-colors ${
              range === "30" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            30 dias
          </button>
        </div>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="h-52 w-full touch-none"
          preserveAspectRatio="none"
          onMouseMove={handleMove}
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id="aggfill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {hasData ? <path d={areaPath} fill="url(#aggfill)" /> : null}
          <path
            d={linePath}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeOpacity={hasData ? 1 : 0.35}
            vectorEffect="non-scaling-stroke"
          />

          {active ? (
            <>
              <line
                x1={active.x}
                y1={0}
                x2={active.x}
                y2={VIEW_H}
                stroke="var(--primary)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.5"
                vectorEffect="non-scaling-stroke"
              />
              <circle
                cx={active.x}
                cy={active.y}
                r="6"
                fill="var(--card)"
                stroke="var(--primary)"
                strokeWidth="3"
                vectorEffect="non-scaling-stroke"
              />
            </>
          ) : null}
        </svg>

        {!hasData ? (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <p className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              Nenhuma leitura registrada ainda
            </p>
          </div>
        ) : null}

        {active && activeData ? (
          <div
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg border border-border bg-popover px-3 py-1.5 text-xs shadow-md"
            style={{ left: `${(active.x / VIEW_W) * 100}%`, top: `${(active.y / VIEW_H) * 100}%` }}
          >
            <p className="font-semibold text-foreground">{activeData.label}</p>
            <p className="text-muted-foreground">
              Consumo: <span className="font-semibold text-primary">{activeData.liters} L</span>
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex justify-between text-[11px] text-muted-foreground">
        {series.map((s, i) =>
          i % labelEvery === 0 || i === series.length - 1 ? <span key={i}>{s.label}</span> : null,
        )}
      </div>
    </div>
  );
}
