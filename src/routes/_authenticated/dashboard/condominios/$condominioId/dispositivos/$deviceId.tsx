import { createFileRoute } from "@tanstack/react-router";
import { DeviceMetricsPage } from "@/features/dashboard/DeviceMetricsPage";

export const Route = createFileRoute(
  "/_authenticated/dashboard/condominios/$condominioId/dispositivos/$deviceId",
)({
  head: () => ({
    meta: [{ title: "Dispositivo — HidroMonitor" }, { name: "robots", content: "noindex" }],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { condominioId, deviceId } = Route.useParams();
  return <DeviceMetricsPage condominioId={condominioId} deviceId={deviceId} />;
}
