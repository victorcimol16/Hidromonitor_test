import { createFileRoute } from "@tanstack/react-router";
import { AlertsPage } from "@/features/dashboard/AlertsPage";

export const Route = createFileRoute("/_authenticated/dashboard/alertas")({
  head: () => ({
    meta: [{ title: "Alertas — HidroMonitor" }, { name: "robots", content: "noindex" }],
  }),
  component: AlertsPage,
});
