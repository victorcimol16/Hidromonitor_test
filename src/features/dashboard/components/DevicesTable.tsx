import { useState } from "react";
import { formatLiters } from "../lib/consumption";
import type { Bloco, Condominio, Dispositivo } from "../lib/mock-data";

type SortKey = "name" | "condominio" | "status";

function SortHeader({
  label,
  sortableKey,
  activeKey,
  ascending,
  onToggle,
}: {
  label: string;
  sortableKey: SortKey;
  activeKey: SortKey;
  ascending: boolean;
  onToggle: (key: SortKey) => void;
}) {
  const active = activeKey === sortableKey;
  return (
    <button
      type="button"
      onClick={() => onToggle(sortableKey)}
      className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wide ${
        active ? "text-foreground" : "text-muted-foreground"
      }`}
    >
      {label}
      {active ? <span aria-hidden="true">{ascending ? "↑" : "↓"}</span> : null}
    </button>
  );
}

export function DevicesTable({
  devices,
  condominios,
  blocos,
}: {
  devices: Dispositivo[];
  condominios: Condominio[];
  blocos: Bloco[];
}) {
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortAsc, setSortAsc] = useState(true);

  function toggleSort(key: SortKey) {
    if (key === sortKey) setSortAsc((prev) => !prev);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  function condominioName(id: string) {
    return condominios.find((c) => c.id === id)?.name ?? "—";
  }

  function blocoName(id: string | null) {
    if (!id) return "Sem bloco";
    return blocos.find((b) => b.id === id)?.name ?? "—";
  }

  if (devices.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Nenhum dispositivo cadastrado ainda.
      </div>
    );
  }

  const sorted = [...devices].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "name") cmp = a.name.localeCompare(b.name);
    else if (sortKey === "condominio") {
      cmp = condominioName(a.condominioId).localeCompare(condominioName(b.condominioId));
    } else if (sortKey === "status") cmp = a.status.localeCompare(b.status);
    return sortAsc ? cmp : -cmp;
  });

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-3">
              <SortHeader
                label="Dispositivo"
                sortableKey="name"
                activeKey={sortKey}
                ascending={sortAsc}
                onToggle={toggleSort}
              />
            </th>
            <th className="px-4 py-3">
              <SortHeader
                label="Condomínio"
                sortableKey="condominio"
                activeKey={sortKey}
                ascending={sortAsc}
                onToggle={toggleSort}
              />
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Bloco
            </th>
            <th className="px-4 py-3">
              <SortHeader
                label="Status"
                sortableKey="status"
                activeKey={sortKey}
                ascending={sortAsc}
                onToggle={toggleSort}
              />
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Hoje
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Mês
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((device) => (
            <tr key={device.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3 font-semibold text-foreground">{device.name}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {condominioName(device.condominioId)}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{blocoName(device.blocoId)}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    device.status === "online"
                      ? "bg-secondary text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      device.status === "online" ? "bg-primary" : "bg-muted-foreground"
                    }`}
                  />
                  {device.status === "online" ? "Online" : "Offline"}
                </span>
              </td>
              <td className="px-4 py-3 text-right text-muted-foreground">{formatLiters(0)}</td>
              <td className="px-4 py-3 text-right text-muted-foreground">{formatLiters(0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
