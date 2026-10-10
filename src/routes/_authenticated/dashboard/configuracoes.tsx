import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/features/dashboard/SettingsPage";

export const Route = createFileRoute("/_authenticated/dashboard/configuracoes")({
  head: () => ({
    meta: [{ title: "Configurações — HidroMonitor" }, { name: "robots", content: "noindex" }],
  }),
  component: SettingsPage,
});
