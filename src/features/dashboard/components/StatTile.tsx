export function StatTile({
  label,
  value,
  formatter,
}: {
  label: string;
  value: number | null;
  formatter: (liters: number) => string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-muted/40 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold text-foreground">
        {value === null ? "—" : formatter(value)}
      </p>
    </div>
  );
}
