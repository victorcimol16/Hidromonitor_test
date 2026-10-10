export type UnitConsumption = {
  name: string;
  liters: number;
  /** Over threshold → highlighted as an alert (red bar). */
  alert?: boolean;
};

export function TopUnitsWidget({ units }: { units: UnitConsumption[] }) {
  const max = Math.max(1, ...units.map((u) => u.liters));

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">Maiores consumos hoje</h3>
      </div>
      <p className="mb-4 text-xs text-muted-foreground">Ranking por unidade</p>

      {units.length === 0 ? (
        <p className="py-6 text-center text-xs text-muted-foreground">
          Nenhum dispositivo cadastrado ainda.
        </p>
      ) : (
        <ul className="space-y-3.5">
          {units.map((unit) => (
            <li key={unit.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="truncate text-foreground">{unit.name}</span>
                <span className="shrink-0 font-semibold text-muted-foreground">{unit.liters} L</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${unit.alert ? "bg-destructive" : "bg-primary"}`}
                  style={{ width: `${Math.round((unit.liters / max) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
