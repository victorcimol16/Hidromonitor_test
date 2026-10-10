import { createFileRoute } from "@tanstack/react-router";
import { CondominioPage } from "@/features/dashboard/CondominioPage";

export const Route = createFileRoute("/_authenticated/dashboard/condominios/$condominioId/")({
  head: () => ({
    meta: [{ title: "Condomínio — HidroMonitor" }, { name: "robots", content: "noindex" }],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { condominioId } = Route.useParams();
  return <CondominioPage condominioId={condominioId} />;
}
