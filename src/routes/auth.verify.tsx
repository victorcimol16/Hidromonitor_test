import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { VerifyForm } from "@/features/auth/components/VerifyForm";

const searchSchema = z.object({ email: z.string().email().optional() });

export const Route = createFileRoute("/auth/verify")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [{ title: "Confirmar e-mail — HidroMonitor" }, { name: "robots", content: "noindex" }],
  }),
  component: VerifyPage,
});

function VerifyPage() {
  const { email } = Route.useSearch();
  return <VerifyForm email={email} />;
}
