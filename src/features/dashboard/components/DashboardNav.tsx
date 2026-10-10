import { Link, useNavigate } from "@tanstack/react-router";
import { LogoMark } from "@/components/brand/Logo";
import { BRAND_COLORS } from "@/lib/brand";
import { useSignOut } from "@/features/auth/hooks/useSignOut";

export function DashboardNav() {
  const navigate = useNavigate();
  const signOut = useSignOut();

  function handleSignOut() {
    signOut.mutate(undefined, { onSuccess: () => navigate({ to: "/" }) });
  }

  return (
    <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
      <Link to="/dashboard" className="flex items-center gap-2.5">
        <LogoMark size={36} />
        <span className="font-semibold tracking-tight" style={{ fontFamily: "var(--font-sans)" }}>
          <span style={{ color: BRAND_COLORS.hidroOnDark }}>Hidro</span>
          <span style={{ color: BRAND_COLORS.monitor }}>Monitor</span>
        </span>
      </Link>
      <button
        onClick={handleSignOut}
        disabled={signOut.isPending}
        className="text-sm font-semibold text-foreground/80 hover:text-[#1E4FA6] disabled:opacity-60"
      >
        Sair
      </button>
    </nav>
  );
}
