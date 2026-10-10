import { useCallback, useState } from "react";
import { DashboardShell } from "./components/DashboardShell";
import { LiveBadge } from "./components/LiveBadge";
import { SensorStatusBanner } from "./components/SensorStatusBanner";
import { MetricCard } from "./components/MetricCard";
import { AggregateConsumptionChart } from "./components/AggregateConsumptionChart";
import { TopUnitsWidget, type UnitConsumption } from "./components/TopUnitsWidget";
import { DropletIcon, CalendarIcon, MoneyIcon, WarnIcon } from "./components/DashIcons";
import { CondominioCard } from "./components/CondominioCard";
import { EmptyState } from "./components/EmptyState";
import { Modal } from "./components/Modal";
import { CondominioForm } from "./components/CondominioForm";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { SelectField } from "./components/SelectField";
import { DevicesTable } from "./components/DevicesTable";
import { useCondominios, type CondominioInput } from "./hooks/useCondominios";
import { useBlocos } from "./hooks/useBlocos";
import { useDispositivos } from "./hooks/useDispositivos";
import type { Condominio, Dispositivo } from "./lib/mock-data";
import {
  TARIFA_POR_LITRO,
  computeOverviewMetrics,
  buildDailyConsumption,
} from "./lib/aggregate-metrics";

const ALL_CONDOMINIOS = "all";

function fmtM3(liters: number) {
  return (liters / 1000).toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

/**
 * Ranking a partir dos dispositivos realmente cadastrados. Enquanto não houver
 * leituras reais, o consumo de cada dispositivo é 0 L (nenhum dado fabricado).
 */
function buildRanking(devices: Dispositivo[]): UnitConsumption[] {
  return devices
    .map((d) => ({ name: d.name, liters: 0, alert: false }))
    .sort((a, b) => b.liters - a.liters);
}

export function DashboardHomePage() {
  const { condominios, addCondominio, editCondominio, removeCondominio } = useCondominios();
  const { blocos, addBloco, removeByCondominioId: removeBlocosByCondominioId } = useBlocos();
  const { devices, removeByCondominioId: removeDevicesByCondominioId } = useDispositivos();

  const [addOpen, setAddOpen] = useState(false);
  const [editingCondominio, setEditingCondominio] = useState<Condominio | null>(null);
  const [removingCondominio, setRemovingCondominio] = useState<Condominio | null>(null);
  const [filterCondominioId, setFilterCondominioId] = useState<string>(ALL_CONDOMINIOS);

  const filteredDevices =
    filterCondominioId === ALL_CONDOMINIOS
      ? devices
      : devices.filter((d) => d.condominioId === filterCondominioId);

  const selectedCondominio = condominios.find((c) => c.id === filterCondominioId) ?? null;
  const unitCount = filteredDevices.length;
  const ranking = buildRanking(filteredDevices);

  // Tudo abaixo é derivado dos dispositivos cadastrados — sem leituras, tudo é 0.
  const metrics = computeOverviewMetrics(filteredDevices);
  const getSeries = useCallback(
    (days: number) => buildDailyConsumption(filteredDevices, days),
    [filteredDevices],
  );

  const contextLabel = selectedCondominio ? selectedCondominio.name : "Todos os condomínios";

  function handleAddCondominio(input: CondominioInput, blocoNames: string[]) {
    const condominio = addCondominio(input);
    blocoNames.forEach((name) => addBloco({ condominioId: condominio.id, name }));
    setAddOpen(false);
  }

  function handleEditCondominio(input: CondominioInput) {
    if (!editingCondominio) return;
    editCondominio(editingCondominio.id, input);
    setEditingCondominio(null);
  }

  function handleConfirmRemove() {
    if (!removingCondominio) return;
    removeBlocosByCondominioId(removingCondominio.id);
    removeDevicesByCondominioId(removingCondominio.id);
    removeCondominio(removingCondominio.id);
    if (filterCondominioId === removingCondominio.id) setFilterCondominioId(ALL_CONDOMINIOS);
    setRemovingCondominio(null);
  }

  return (
    <>
      <DashboardShell active="overview" onAddDevice={() => setAddOpen(true)}>
        <div>
          {/* Header */}
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                {contextLabel}
                {unitCount > 0 ? ` · ${unitCount} ${unitCount === 1 ? "unidade" : "unidades"}` : ""}
              </p>
              <h1 className="mt-0.5 font-display text-2xl font-bold text-foreground">Visão geral</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {condominios.length > 0 ? (
                <SelectField
                  label="Filtrar por condomínio"
                  hideLabel
                  variant="pill"
                  value={filterCondominioId}
                  onChange={(e) => setFilterCondominioId(e.target.value)}
                >
                  <option value={ALL_CONDOMINIOS}>Todos os condomínios</option>
                  {condominios.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </SelectField>
              ) : null}
              <LiveBadge />
            </div>
          </div>

          <SensorStatusBanner />

          {/* Metric cards */}
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Consumo hoje"
              value={fmtM3(metrics.consumoHojeLiters)}
              unit="m³"
              icon={<DropletIcon />}
              tone="primary"
              subtitle="Soma das leituras de hoje"
            />
            <MetricCard
              label="Consumo do mês"
              value={fmtM3(metrics.consumoMesLiters)}
              unit="m³"
              icon={<CalendarIcon />}
              tone="accent"
              subtitle="Acumulado no mês atual"
            />
            <MetricCard
              label="Custo estimado"
              value={metrics.custoEstimado.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
              icon={<MoneyIcon />}
              tone="accent"
              subtitle={`Tarifa R$ ${TARIFA_POR_LITRO.toLocaleString("pt-BR", { minimumFractionDigits: 3 })}/L`}
            />
            <MetricCard
              label="Unidades em alerta"
              value={String(metrics.unidadesEmAlerta)}
              icon={<WarnIcon />}
              tone="alert"
              subtitle="Ação recomendada"
            />
          </div>

          {/* Chart + ranking */}
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <AggregateConsumptionChart getSeries={getSeries} />
            </div>
            <TopUnitsWidget units={ranking} />
          </div>

          {/* Gestão de condomínios */}
          <div className="mt-8 flex items-center justify-between gap-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Condomínios</h2>
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
            >
              + Adicionar condomínio
            </button>
          </div>

          {condominios.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title="Nenhum condomínio cadastrado"
                message="Crie seu primeiro condomínio para começar a organizar dispositivos por bloco."
                actionLabel="Adicionar condomínio"
                onAction={() => setAddOpen(true)}
              />
            </div>
          ) : (
            <>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {condominios.map((condominio) => (
                  <CondominioCard
                    key={condominio.id}
                    condominio={condominio}
                    deviceCount={devices.filter((d) => d.condominioId === condominio.id).length}
                    onEdit={() => setEditingCondominio(condominio)}
                    onRemove={() => setRemovingCondominio(condominio)}
                  />
                ))}
              </div>

              <h2 className="mb-3 mt-8 font-display text-lg font-semibold text-foreground">
                Desempenho por dispositivo
              </h2>
              <DevicesTable devices={filteredDevices} condominios={condominios} blocos={blocos} />
            </>
          )}
        </div>
      </DashboardShell>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Adicionar condomínio">
        <CondominioForm showBlocos onSubmit={handleAddCondominio} submitLabel="Criar condomínio" />
      </Modal>

      <Modal
        open={editingCondominio !== null}
        onClose={() => setEditingCondominio(null)}
        title="Editar condomínio"
      >
        {editingCondominio ? (
          <CondominioForm
            initialValues={editingCondominio}
            onSubmit={handleEditCondominio}
            submitLabel="Salvar"
          />
        ) : null}
      </Modal>

      <ConfirmDialog
        open={removingCondominio !== null}
        title="Remover condomínio"
        message={`Tem certeza que deseja remover "${removingCondominio?.name}"? Todos os blocos e dispositivos vinculados também serão removidos.`}
        onConfirm={handleConfirmRemove}
        onCancel={() => setRemovingCondominio(null)}
      />
    </>
  );
}
