import { DashboardShell } from "./components/DashboardShell";
import { AlertIcon, WarnIcon, DropletIcon } from "./components/DashIcons";
import { useDispositivos } from "./hooks/useDispositivos";

type AlertItem = {
  id: string;
  deviceName: string;
  message: string;
  severity: "alta" | "media";
};

// Alertas são derivados dos dispositivos cadastrados. Sem leituras reais,
// nenhum alerta é disparado — a tela mostra o estado vazio.
function buildAlerts(): AlertItem[] {
  return [];
}

const SEVERITY_STYLES: Record<AlertItem["severity"], string> = {
  alta: "bg-destructive/10 text-destructive",
  media: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
};

export function AlertsPage() {
  const { devices } = useDispositivos();
  const alerts = buildAlerts();

  return (
    <DashboardShell active="alerts">
      <div className="mb-5">
        <p className="text-sm text-muted-foreground">Monitoramento</p>
        <h1 className="mt-0.5 font-display text-2xl font-bold text-foreground">Alertas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Avisos automáticos quando um dispositivo ultrapassa o limite de consumo.
        </p>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Alertas ativos
            </p>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-destructive/10 text-destructive">
              <span className="h-[18px] w-[18px]">
                <WarnIcon />
              </span>
            </span>
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-foreground">{alerts.length}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Dispositivos monitorados
            </p>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
              <span className="h-[18px] w-[18px]">
                <DropletIcon />
              </span>
            </span>
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-foreground">{devices.length}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Limite por dia
            </p>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent/15 text-accent">
              <span className="h-[18px] w-[18px]">
                <AlertIcon />
              </span>
            </span>
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-foreground">
            500<span className="ml-1 text-base font-semibold text-muted-foreground">L</span>
          </p>
        </div>
      </div>

      {/* Lista de alertas */}
      <div className="mt-5 rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Ocorrências recentes</h2>

        {alerts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
              <span className="h-6 w-6">
                <AlertIcon />
              </span>
            </span>
            <div>
              <p className="font-semibold text-foreground">Nenhum alerta no momento</p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                Quando um dispositivo cadastrado ultrapassar o limite de consumo, o alerta aparece
                aqui automaticamente.
              </p>
            </div>
          </div>
        ) : (
          <ul className="space-y-3">
            {alerts.map((alert) => (
              <li
                key={alert.id}
                className="flex items-center gap-3 rounded-xl border border-border p-3"
              >
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${SEVERITY_STYLES[alert.severity]}`}
                >
                  <span className="h-[18px] w-[18px]">
                    <WarnIcon />
                  </span>
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{alert.deviceName}</p>
                  <p className="truncate text-xs text-muted-foreground">{alert.message}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardShell>
  );
}
