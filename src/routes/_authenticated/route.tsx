import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { FEATURES } from "@/config/features";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // Login desativado (FEATURES.auth = false): libera o acesso sem checar
    // sessão. Reative em src/config/features.ts.
    if (!FEATURES.auth) return { user: null };

    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth/login" });
    return { user: data.user };
  },
  component: () => <Outlet />,
});
