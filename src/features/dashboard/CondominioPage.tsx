import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeftIcon, EditIcon, TrashIcon } from "@/components/icons";
import { AuthInput } from "@/features/auth/components/AuthInput";
import { AuthButton } from "@/features/auth/components/AuthButton";
import { DashboardNav } from "./components/DashboardNav";
import { DeviceCard } from "./components/DeviceCard";
import { EmptyState } from "./components/EmptyState";
import { Modal } from "./components/Modal";
import { DeviceForm } from "./components/DeviceForm";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { useCondominios } from "./hooks/useCondominios";
import { useBlocos } from "./hooks/useBlocos";
import { useDispositivos } from "./hooks/useDispositivos";
import type { Bloco, Dispositivo } from "./lib/mock-data";

export function CondominioPage({ condominioId }: { condominioId: string }) {
  const { condominios } = useCondominios();
  const { blocos, addBloco, renameBloco, removeBloco } = useBlocos();
  const { devices, addDevice, editDevice, removeDevice, unassignBloco } = useDispositivos();

  const [addDeviceOpen, setAddDeviceOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Dispositivo | null>(null);
  const [removingDevice, setRemovingDevice] = useState<Dispositivo | null>(null);

  const [addBlocoOpen, setAddBlocoOpen] = useState(false);
  const [newBlocoName, setNewBlocoName] = useState("");
  const [editingBloco, setEditingBloco] = useState<Bloco | null>(null);
  const [editingBlocoName, setEditingBlocoName] = useState("");
  const [removingBloco, setRemovingBloco] = useState<Bloco | null>(null);

  const condominio = condominios.find((c) => c.id === condominioId);
  const condominioBlocos = blocos.filter((b) => b.condominioId === condominioId);
  const condominioDevices = devices.filter((d) => d.condominioId === condominioId);
  const unassignedDevices = condominioDevices.filter((d) => !d.blocoId);

  if (!condominio) {
    return (
      <div className="min-h-[100svh] bg-background text-foreground">
        <DashboardNav />
        <main className="mx-auto max-w-2xl px-6 py-10 text-center">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Condomínio não encontrado
          </h1>
          <Link to="/dashboard" className="mt-4 inline-block text-sm font-semibold text-primary">
            ← Voltar para o dashboard
          </Link>
        </main>
      </div>
    );
  }

  function handleAddDevice(input: { name: string; blocoId: string | null }) {
    addDevice({ ...input, condominioId });
    setAddDeviceOpen(false);
  }

  function handleEditDevice(input: { name: string; blocoId: string | null }) {
    if (!editingDevice) return;
    editDevice(editingDevice.id, { ...input, condominioId });
    setEditingDevice(null);
  }

  function handleAddBloco(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newBlocoName.trim();
    if (!trimmed) return;
    addBloco({ condominioId, name: trimmed });
    setNewBlocoName("");
    setAddBlocoOpen(false);
  }

  function handleRenameBloco(e: React.FormEvent) {
    e.preventDefault();
    if (!editingBloco) return;
    const trimmed = editingBlocoName.trim();
    if (!trimmed) return;
    renameBloco(editingBloco.id, trimmed);
    setEditingBloco(null);
  }

  function handleConfirmRemoveBloco() {
    if (!removingBloco) return;
    unassignBloco(removingBloco.id);
    removeBloco(removingBloco.id);
    setRemovingBloco(null);
  }

  return (
    <div className="min-h-[100svh] bg-background text-foreground">
      <DashboardNav />

      <main className="mx-auto max-w-4xl px-6 py-10">
        <Link
          to="/dashboard"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon width={16} height={16} />
          Todos os condomínios
        </Link>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">{condominio.name}</h1>
            {condominio.endereco ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {condominio.endereco}
                {condominio.cidade ? ` — ${condominio.cidade}/${condominio.estado}` : ""}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setAddBlocoOpen(true)}
              className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
            >
              + Bloco
            </button>
            {condominioDevices.length > 0 ? (
              <button
                type="button"
                onClick={() => setAddDeviceOpen(true)}
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
              >
                + Dispositivo
              </button>
            ) : null}
          </div>
        </div>

        {condominioDevices.length === 0 ? (
          <EmptyState
            title="Nenhum dispositivo neste condomínio"
            message="Adicione o primeiro hidrômetro para começar a acompanhar o consumo."
            actionLabel="Adicionar dispositivo"
            onAction={() => setAddDeviceOpen(true)}
          />
        ) : (
          <div className="space-y-6">
            {condominioBlocos.map((bloco) => {
              const blocoDevices = condominioDevices.filter((d) => d.blocoId === bloco.id);
              return (
                <section key={bloco.id}>
                  <div className="mb-2 flex items-center justify-between">
                    <h2 className="font-display text-base font-semibold text-foreground">
                      {bloco.name}
                    </h2>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingBloco(bloco);
                          setEditingBlocoName(bloco.name);
                        }}
                        aria-label={`Renomear ${bloco.name}`}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <EditIcon width={16} height={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setRemovingBloco(bloco)}
                        aria-label={`Remover ${bloco.name}`}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <TrashIcon width={16} height={16} />
                      </button>
                    </div>
                  </div>
                  {blocoDevices.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                      Nenhum dispositivo neste bloco.
                    </p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {blocoDevices.map((device) => (
                        <DeviceCard
                          key={device.id}
                          device={device}
                          onEdit={() => setEditingDevice(device)}
                          onRemove={() => setRemovingDevice(device)}
                        />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}

            {unassignedDevices.length > 0 ? (
              <section>
                <h2 className="mb-2 font-display text-base font-semibold text-foreground">
                  Sem bloco
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {unassignedDevices.map((device) => (
                    <DeviceCard
                      key={device.id}
                      device={device}
                      onEdit={() => setEditingDevice(device)}
                      onRemove={() => setRemovingDevice(device)}
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        )}
      </main>

      <Modal
        open={addDeviceOpen}
        onClose={() => setAddDeviceOpen(false)}
        title="Adicionar dispositivo"
      >
        <DeviceForm blocos={condominioBlocos} onSubmit={handleAddDevice} submitLabel="Adicionar" />
      </Modal>

      <Modal
        open={editingDevice !== null}
        onClose={() => setEditingDevice(null)}
        title="Editar dispositivo"
      >
        {editingDevice ? (
          <DeviceForm
            initialName={editingDevice.name}
            initialBlocoId={editingDevice.blocoId}
            blocos={condominioBlocos}
            onSubmit={handleEditDevice}
            submitLabel="Salvar"
          />
        ) : null}
      </Modal>

      <ConfirmDialog
        open={removingDevice !== null}
        title="Remover dispositivo"
        message={`Tem certeza que deseja remover "${removingDevice?.name}"? Essa ação não pode ser desfeita.`}
        onConfirm={() => {
          if (removingDevice) removeDevice(removingDevice.id);
          setRemovingDevice(null);
        }}
        onCancel={() => setRemovingDevice(null)}
      />

      <Modal open={addBlocoOpen} onClose={() => setAddBlocoOpen(false)} title="Adicionar bloco">
        <form onSubmit={handleAddBloco} className="space-y-4">
          <AuthInput
            label="Nome do bloco"
            value={newBlocoName}
            onChange={(e) => setNewBlocoName(e.target.value)}
            placeholder="Ex.: Bloco C"
            required
          />
          <AuthButton type="submit">Adicionar</AuthButton>
        </form>
      </Modal>

      <Modal
        open={editingBloco !== null}
        onClose={() => setEditingBloco(null)}
        title="Renomear bloco"
      >
        <form onSubmit={handleRenameBloco} className="space-y-4">
          <AuthInput
            label="Nome do bloco"
            value={editingBlocoName}
            onChange={(e) => setEditingBlocoName(e.target.value)}
            required
          />
          <AuthButton type="submit">Salvar</AuthButton>
        </form>
      </Modal>

      <ConfirmDialog
        open={removingBloco !== null}
        title="Remover bloco"
        message={`Os dispositivos de "${removingBloco?.name}" ficarão sem bloco atribuído. Tem certeza?`}
        onConfirm={handleConfirmRemoveBloco}
        onCancel={() => setRemovingBloco(null)}
      />
    </div>
  );
}
