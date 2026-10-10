import { createFileRoute } from "@tanstack/react-router";
import { SignupForm } from "@/features/auth/components/SignupForm";

export const Route = createFileRoute("/auth/signup")({
  head: () => ({
    meta: [
      { title: "Criar conta — HidroMonitor" },
      { name: "description", content: "Crie sua conta HidroMonitor." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SignupForm,
});
