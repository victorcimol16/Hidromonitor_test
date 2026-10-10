import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "./DashIcons";

type Tone = "primary" | "accent" | "alert";

const TONE_STYLES: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/15 text-accent",
  alert: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
};

export function MetricCard({
  label,
  value,
  unit,
  icon,
  tone = "primary",
  delta,
  subtitle,
}: {
  label: string;
  value: string;
  unit?: string;
  icon: ReactNode;
  tone?: Tone;
  /** Positive = consumption up (bad, red); negative = down (good, green). */
  delta?: number;
  subtitle?: string;
}) {
  const showDelta = typeof delta === "number";
  const isDown = showDelta && (delta as number) <= 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${TONE_STYLES[tone]}`}>
          <span className="h-[18px] w-[18px]">{icon}</span>
        </span>
      </div>

      <p className="mt-3 font-display text-2xl font-bold text-foreground">
        {value}
        {unit ? <span className="ml-1 text-base font-semibold text-muted-foreground">{unit}</span> : null}
      </p>

      {showDelta ? (
        <p
          className={`mt-1.5 inline-flex items-center gap-1 text-xs font-medium ${
            isDown ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
          }`}
        >
          <span className="h-3.5 w-3.5">
            {isDown ? <ArrowDownRight /> : <ArrowUpRight />}
          </span>
          {Math.abs(delta as number).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% vs. período anterior
        </p>
      ) : subtitle ? (
        <p className="mt-1.5 text-xs text-muted-foreground">{subtitle}</p>
      ) : null}
    </div>
  );
}
