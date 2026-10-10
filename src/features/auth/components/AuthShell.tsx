import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { LogoMark } from "@/components/brand/Logo";
import { ArrowLeftIcon } from "@/components/icons";
import { BRAND_COLORS } from "@/lib/brand";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  backTo = "/",
  backLabel = "Voltar",
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  backTo?: string;
  backLabel?: string;
}) {
  return (
    <div className="min-h-[100svh] bg-deep text-deep-foreground relative overflow-x-clip">
      {/* Background blur circles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-md flex-col px-6 py-8">
        <Link
          to={backTo}
          className="inline-flex items-center gap-1.5 self-start rounded-md px-2 py-1 text-sm font-medium text-deep-foreground transition-colors hover:bg-deep-foreground/10"
        >
          <ArrowLeftIcon />
          {backLabel}
        </Link>

        <div className="flex-1 flex-col justify-center py-10">
          <div className="rounded-2xl border border-white/10 bg-white p-6 sm:p-8">
            <div className="mb-6 flex flex-col items-center text-center">
              <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
                <LogoMark size={44} />
                <span className="font-semibold tracking-tight" style={{ fontSize: 22 }}>
                  <span style={{ color: BRAND_COLORS.hidroOnLight }}>Hidro</span>
                  <span style={{ color: BRAND_COLORS.monitor }}>Monitor</span>
                </span>
              </Link>
            </div>

            <h1 className="mb-2 font-display text-2xl font-bold text-foreground">{title}</h1>
            {subtitle ? <p className="mb-4 text-sm text-foreground">{subtitle}</p> : null}
            <div className="mb-6">{children}</div>

            {footer ? <div className="text-center text-sm text-foreground">{footer}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
