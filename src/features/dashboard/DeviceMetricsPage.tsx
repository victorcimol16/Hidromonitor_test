import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeftIcon, EditIcon, TrashIcon } from "@/components/icons";
import { DashboardNav } from "./components/DashboardNav";
import { StatTile } from "./components/StatTile";
import { ConsumptionChart } from "./components/ConsumptionChart";
import { Modal } from "./components/Modal";
import { DeviceForm } from "./components/DeviceForm";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { useCondominios } from "./hooks/useCondominios";
import { useBlocos } from "./hooks/useBlocos";
import { useDispositivos } from "./hooks/useDispositivos";
import { formatLiters } from "./lib/consumption";
import { formatFlowRate, formatPercent, ZERO_DEVICE_METRICS } from "./lib/device-metrics";

export function DeviceMetricsPage({
  condominioId,
  deviceId,
}: {
  condominioId: string;
  deviceId: string;
}) {
  const navigate = useNavigate();
  const { condominios } = useCondominios();
  const { blocos } = useBlocos();
  const { devices, editDevice, removeDevice } = useDispositivos();
  const [editOpen, setEditOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);

  const condominio = condominios.find((c) => c.id === condominioId);
  const device = devices.find((d) => d.id === deviceId);
  const condominioBlocos = blocos.filter((b) => b.condominioId === condominioId);
  const bloco = device?.blocoId ? blocos.find((b) => b.id === device.blocoId) : undefined;

  if (!condominio || !device) {
    return (
      <div className="min-h-[100svh] bg-background text-foreground">
        <DashboardNav />
        <main className="mx-auto max-w-2xl px-6 py-10 text-center">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Dispositivo não encontrado
          </h1>
          <Link to="/dashboard" className="mt-4 inline-block text-sm font-semibold text-primary">
            ← Voltar para o dashboard
          </Link>
        </main>
      </div>
    );
  }

  const isOnline = device.status === "online";

  return (
    <div className="min-h-[100svh] bg-background text-foreground">
      <DashboardNav />

      <main className="mx-auto max-w-2xl px-6 py-10">
        <Link
          to="/dashboard/condominios/$condominioId"
          params={{ condominioId }}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon width={16} height={16} />
          {condominio.name}
        </Link>

        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">{device.name}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  isOnline ? "bg-secondary text-primary" : "bg-muted text-muted-foreground"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${isOnline ? "bg-primary" : "bg-muted-foreground"}`}
                />
                {isOnline ? "Online" : "Offline"}
              </span>
              {bloco ? (
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                  {bloco.name}
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              aria-label="Editar dispositivo"
              className="rounded-lg border border-border p-2.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <EditIcon />
            </button>
            <button
              type="button"
              onClick={() => setRemoveOpen(true)}
              aria-label="Remover dispositivo"
              className="rounded-lg border border-border p-2.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <TrashIcon />
            </button>
          </div>
        </div>

        <div className="w-full rounded-3xl border border-border bg-card p-6 text-card-foreground shadow-2xl">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatTile
              label="Consumo de água"
              value={ZERO_DEVICE_METRICS.currentLiters}
              formatter={formatLiters}
            />
            <StatTile
              label="Consumo acumulado"
              value={ZERO_DEVICE_METRICS.accumulatedLiters}
              formatter={formatLiters}
            />
            <StatTile
              label="Vazão"
              value={ZERO_DEVICE_METRICS.flowRateLPerMin}
              formatter={formatFlowRate}
            />
            <StatTile
              label="Reservatório"
              value={ZERO_DEVICE_METRICS.reservoirPercent}
              formatter={formatPercent}
            />
            <StatTile
              label="Consumo diário"
              value={ZERO_DEVICE_METRICS.dailyLiters}
              formatter={formatLiters}
            />
            <StatTile
              label="Consumo mensal"
              value={ZERO_DEVICE_METRICS.monthlyLiters}
              formatter={formatLiters}
            />
          </div>

          <ConsumptionChart readings={[]} />
        </div>
      </main>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Editar dispositivo">
        <DeviceForm
          initialName={device.name}
          initialBlocoId={device.blocoId}
          blocos={condominioBlocos}
          onSubmit={(input) => {
            editDevice(device.id, { ...input, condominioId });
            setEditOpen(false);
          }}
          submitLabel="Salvar"
        />
      </Modal>

      <ConfirmDialog
        open={removeOpen}
        title="Remover dispositivo"
        message={`Tem certeza que deseja remover "${device.name}"? Essa ação não pode ser desfeita.`}
        onConfirm={() => {
          removeDevice(device.id);
          navigate({ to: "/dashboard/condominios/$condominioId", params: { condominioId } });
        }}
        onCancel={() => setRemoveOpen(false)}
      />
    </div>
  );
}
