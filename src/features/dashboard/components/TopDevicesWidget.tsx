import { formatLiters } from "../lib/consumption";
import type { Dispositivo } from "../lib/mock-data";
import { WidgetCard } from "./WidgetCard";

export function TopDevicesWidget({ devices }: { devices: Dispositivo[] }) {
  const top = devices.slice(0, 5);

  return (
    <WidgetCard title="Top dispositivos por consumo">
      {top.length === 0 ? (
        <p className="py-6 text-center text-xs text-muted-foreground">
          Nenhum dispositivo cadastrado ainda.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {top.map((device) => (
            <li key={device.id} className="flex items-center gap-3">
              <span className="w-24 shrink-0 truncate text-xs text-muted-foreground">
                {device.name}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: "0%" }} />
              </div>
              <span className="w-14 shrink-0 text-right text-xs font-semibold text-foreground">
                {formatLiters(0)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </WidgetCard>
  );
}
