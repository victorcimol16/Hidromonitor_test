import type { ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { LogoMark } from "@/components/brand/Logo";
import { BRAND_COLORS } from "@/lib/brand";
import { FEATURES } from "@/config/features";
import { useSignOut } from "@/features/auth/hooks/useSignOut";
import { OverviewIcon, AlertIcon, AddDeviceIcon, SettingsIcon } from "./DashIcons";

export type NavKey = "overview" | "alerts" | "add" | "settings";

function itemClasses(active?: boolean) {
  return `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
    active
      ? "bg-primary/10 text-primary font-semibold"
      : "text-muted-foreground hover:bg-muted hover:text-foreground"
  }`;
}

function NavLink({
  to,
  icon,
  label,
  active,
  onNavigate,
}: {
  to: string;
  icon: ReactNode;
  label: string;
  active?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link to={to} onClick={onNavigate} className={itemClasses(active)}>
      <span className="grid h-5 w-5 shrink-0 place-items-center">{icon}</span>
      {label}
    </Link>
  );
}

function NavButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className={itemClasses(active)}>
      <span className="grid h-5 w-5 shrink-0 place-items-center">{icon}</span>
      {label}
    </button>
  );
}

export function DashboardSidebar({
  active = "overview",
  onAddDevice,
  onNavigate,
}: {
  active?: NavKey;
  onAddDevice?: () => void;
  /** Chamado quando um item é acionado — usado para fechar o drawer no mobile. */
  onNavigate?: () => void;
}) {
  const navigate = useNavigate();
  const signOut = useSignOut();

  function handleSignOut() {
    onNavigate?.();
    signOut.mutate(undefined, { onSuccess: () => navigate({ to: "/" }) });
  }

  return (
    <div className="flex h-full w-full flex-col gap-6 border-border bg-card px-4 py-6 md:border-r">
      <Link to="/dashboard" onClick={onNavigate} className="flex items-center gap-2.5 px-2">
        <LogoMark size={32} />
        <span className="font-semibold tracking-tight" style={{ fontFamily: "var(--font-sans)" }}>
          <span style={{ color: BRAND_COLORS.hidroOnLight }}>Hidro</span>
          <span style={{ color: BRAND_COLORS.monitor }}>Monitor</span>
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        <NavLink
          to="/dashboard"
          icon={<OverviewIcon />}
          label="Visão geral"
          active={active === "overview"}
          onNavigate={onNavigate}
        />
        {FEATURES.alerts ? (
          <NavLink
            to="/dashboard/alertas"
            icon={<AlertIcon />}
            label="Alertas"
            active={active === "alerts"}
            onNavigate={onNavigate}
          />
        ) : null}
        {onAddDevice ? (
          <NavButton
            icon={<AddDeviceIcon />}
            label="Adicionar dispositivo"
            active={active === "add"}
            onClick={() => {
              onNavigate?.();
              onAddDevice();
            }}
          />
        ) : (
          <NavLink
            to="/dashboard"
            icon={<AddDeviceIcon />}
            label="Adicionar dispositivo"
            active={active === "add"}
            onNavigate={onNavigate}
          />
        )}
        {FEATURES.settings ? (
          <NavLink
            to="/dashboard/configuracoes"
            icon={<SettingsIcon />}
            label="Configurações"
            active={active === "settings"}
            onNavigate={onNavigate}
          />
        ) : null}
      </nav>

      <button
        onClick={handleSignOut}
        disabled={signOut.isPending}
        className="rounded-xl px-3 py-2.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-60"
      >
        Sair
      </button>
    </div>
  );
}
