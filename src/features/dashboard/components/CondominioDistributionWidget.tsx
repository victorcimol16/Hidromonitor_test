import type { Condominio, Dispositivo } from "../lib/mock-data";
import { WidgetCard } from "./WidgetCard";

export function CondominioDistributionWidget({
  condominios,
  devices,
}: {
  condominios: Condominio[];
  devices: Dispositivo[];
}) {
  const total = devices.length;

  return (
    <WidgetCard title="Distribuição por condomínio">
      {condominios.length === 0 ? (
        <p className="py-6 text-center text-xs text-muted-foreground">
          Nenhum condomínio cadastrado ainda.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {condominios.map((condominio) => {
            const count = devices.filter((d) => d.condominioId === condominio.id).length;
            const percent = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <li key={condominio.id} className="flex items-center gap-3">
                <span className="w-28 shrink-0 truncate text-xs text-muted-foreground">
                  {condominio.name}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${percent}%` }} />
                </div>
                <span className="w-10 shrink-0 text-right text-xs font-semibold text-foreground">
                  {count}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </WidgetCard>
  );
}
