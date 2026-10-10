import { createFileRoute } from "@tanstack/react-router";
import { DashboardHomePage } from "@/features/dashboard/DashboardHomePage";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  head: () => ({
    meta: [{ title: "Dashboard — HidroMonitor" }, { name: "robots", content: "noindex" }],
  }),
  component: DashboardHomePage,
});
