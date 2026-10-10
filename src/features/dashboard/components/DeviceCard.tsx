import { Link } from "@tanstack/react-router";
import { EditIcon, TrashIcon } from "@/components/icons";
import type { Dispositivo } from "../lib/mock-data";

export function DeviceCard({
  device,
  onEdit,
  onRemove,
}: {
  device: Dispositivo;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const isOnline = device.status === "online";

  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-border bg-card p-5">
      <Link
        to="/dashboard/condominios/$condominioId/dispositivos/$deviceId"
        params={{ condominioId: device.condominioId, deviceId: device.id }}
        className="min-w-0 flex-1"
      >
        <p className="truncate font-display text-base font-semibold text-foreground hover:text-primary">
          {device.name}
        </p>
        <span
          className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            isOnline ? "bg-secondary text-primary" : "bg-muted text-muted-foreground"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${isOnline ? "bg-primary" : "bg-muted-foreground"}`}
          />
          {isOnline ? "Online" : "Offline"}
        </span>
      </Link>

      <div className="flex shrink-0 gap-1">
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Editar ${device.name}`}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <EditIcon />
        </button>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remover ${device.name}`}
          className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}
