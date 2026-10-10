import { WaterDropGaugeIcon } from "@/components/icons";

export function DashboardEmptyState() {
  return (
    <div className="rounded-3xl border border-border bg-card p-8 text-center text-card-foreground shadow-2xl">
      <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-secondary">
        <WaterDropGaugeIcon width={32} height={32} />
      </div>
      <h1 className="font-display text-2xl font-bold text-foreground">Nenhuma leitura ainda</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Assim que seu hidrômetro conectado enviar a primeira leitura, seu consumo aparecerá aqui.
      </p>
    </div>
  );
}
