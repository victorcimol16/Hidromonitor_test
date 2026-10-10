import { Link } from "@tanstack/react-router";
import { EditIcon, TrashIcon } from "@/components/icons";
import type { Condominio } from "../lib/mock-data";

export function CondominioCard({
  condominio,
  deviceCount,
  onEdit,
  onRemove,
}: {
  condominio: Condominio;
  deviceCount: number;
  onEdit: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5">
      <Link
        to="/dashboard/condominios/$condominioId"
        params={{ condominioId: condominio.id }}
        className="min-w-0 flex-1"
      >
        <p className="truncate font-display text-lg font-semibold text-foreground hover:text-primary">
          {condominio.name}
        </p>
        {condominio.endereco ? (
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {condominio.endereco}
            {condominio.cidade ? ` — ${condominio.cidade}/${condominio.estado}` : ""}
          </p>
        ) : null}
        <p className="mt-1 text-sm text-muted-foreground">
          {deviceCount} {deviceCount === 1 ? "dispositivo" : "dispositivos"}
        </p>
      </Link>

      <div className="flex shrink-0 gap-1">
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Editar ${condominio.name}`}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <EditIcon />
        </button>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remover ${condominio.name}`}
          className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}
