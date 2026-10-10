import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { LoginForm } from "@/features/auth/components/LoginForm";

const searchSchema = z.object({
  next: z
    .string()
    .optional()
    .transform((next) => (next?.startsWith("/") && !next.startsWith("//") ? next : undefined)),
});

export const Route = createFileRoute("/auth/login")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Entrar — HidroMonitor" },
      { name: "description", content: "Acesse sua conta HidroMonitor." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { next } = Route.useSearch();
  return <LoginForm next={next} />;
}
