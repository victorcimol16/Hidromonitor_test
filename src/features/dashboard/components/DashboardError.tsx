export function DashboardError() {
  return (
    <div className="rounded-3xl border border-border bg-card p-8 text-center text-card-foreground shadow-2xl">
      <h1 className="font-display text-2xl font-bold text-foreground">
        Não foi possível carregar suas leituras
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">Tente novamente em instantes.</p>
    </div>
  );
}
