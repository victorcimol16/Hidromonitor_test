import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { LogoMark } from "@/components/brand/Logo";
import { BRAND_COLORS } from "@/lib/brand";
import { DashboardSidebar, type NavKey } from "./DashboardSidebar";

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function DashboardShell({
  active,
  onAddDevice,
  children,
}: {
  active: NavKey;
  onAddDevice?: () => void;
  children: ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-[100svh] w-full max-w-full overflow-x-hidden bg-background text-foreground">
      {/* Sidebar fixa — desktop */}
      <div className="sticky top-0 hidden h-[100svh] w-64 shrink-0 md:block">
        <DashboardSidebar active={active} onAddDevice={onAddDevice} />
      </div>

      {/* Drawer — mobile */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="absolute left-0 top-0 h-full w-64 max-w-[80%] shadow-xl">
            <DashboardSidebar
              active={active}
              onAddDevice={onAddDevice}
              onNavigate={() => setDrawerOpen(false)}
            />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar — mobile */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card/95 px-4 py-3 backdrop-blur md:hidden">
          <Link to="/dashboard" className="flex items-center gap-2">
            <LogoMark size={28} />
            <span className="font-semibold tracking-tight" style={{ fontFamily: "var(--font-sans)" }}>
              <span style={{ color: BRAND_COLORS.hidroOnLight }}>Hidro</span>
              <span style={{ color: BRAND_COLORS.monitor }}>Monitor</span>
            </span>
          </Link>
          <button
            type="button"
            aria-label="Abrir menu"
            onClick={() => setDrawerOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-lg text-foreground hover:bg-muted"
          >
            <MenuIcon />
          </button>
        </header>

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-5 md:px-8 md:py-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>

      {/* Botão flutuante para fechar drawer é tratado acima */}
      {drawerOpen ? (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setDrawerOpen(false)}
          className="fixed right-4 top-3 z-[60] grid h-9 w-9 place-items-center rounded-lg bg-card text-foreground shadow md:hidden"
        >
          <CloseIcon />
        </button>
      ) : null}
    </div>
  );
}
