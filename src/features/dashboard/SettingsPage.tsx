import { useState } from "react";
import { DashboardShell } from "./components/DashboardShell";
import { useSettings } from "./hooks/useSettings";

function SettingCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {description ? <p className="mt-1 text-xs text-muted-foreground">{description}</p> : null}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-2">
      <span className="text-sm text-foreground">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`flex h-6 w-11 shrink-0 items-center rounded-full px-0.5 transition-colors ${
          checked ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`h-5 w-5 rounded-full bg-white shadow transition-all ${
            checked ? "ml-auto" : ""
          }`}
        />
      </button>
    </label>
  );
}

export function SettingsPage() {
  const { settings, save } = useSettings();
  const [tarifa, setTarifa] = useState(settings.tarifa);
  const [limite, setLimite] = useState(settings.limite);
  const [notifEmail, setNotifEmail] = useState(settings.notifEmail);
  const [notifPush, setNotifPush] = useState(settings.notifPush);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    save({ tarifa, limite, notifEmail, notifPush });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const fieldClass =
    "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <DashboardShell active="settings">
      <div className="mb-5">
        <p className="text-sm text-muted-foreground">Preferências</p>
        <h1 className="mt-0.5 font-display text-2xl font-bold text-foreground">Configurações</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ajuste tarifa, limites e notificações do seu monitoramento.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SettingCard
          title="Tarifa de água"
          description="Valor usado para estimar o custo de consumo."
        >
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            R$ por litro
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">R$</span>
            <input
              inputMode="decimal"
              value={tarifa}
              onChange={(e) => setTarifa(e.target.value)}
              className={fieldClass}
            />
            <span className="text-sm text-muted-foreground">/L</span>
          </div>
        </SettingCard>

        <SettingCard
          title="Limite de alerta"
          description="Consumo diário por dispositivo que dispara um alerta."
        >
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Litros por dia
          </label>
          <div className="flex items-center gap-2">
            <input
              inputMode="numeric"
              value={limite}
              onChange={(e) => setLimite(e.target.value)}
              className={fieldClass}
            />
            <span className="text-sm text-muted-foreground">L</span>
          </div>
        </SettingCard>

        <SettingCard title="Notificações" description="Como você quer ser avisado sobre alertas.">
          <div className="divide-y divide-border">
            <Toggle checked={notifEmail} onChange={setNotifEmail} label="Receber por e-mail" />
            <Toggle checked={notifPush} onChange={setNotifPush} label="Notificações push" />
          </div>
        </SettingCard>

        <SettingCard title="Unidade de medida" description="Como o consumo é exibido no painel.">
          <div className="flex gap-2">
            <span className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
              m³
            </span>
            <span className="rounded-full bg-muted px-4 py-2 text-sm font-medium text-muted-foreground">
              Litros
            </span>
          </div>
        </SettingCard>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
        >
          Salvar alterações
        </button>
        {saved ? (
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            Alterações salvas ✓
          </span>
        ) : null}
      </div>
    </DashboardShell>
  );
}
