import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "./AuthShell";
import { AuthInput } from "./AuthInput";
import { AuthButton } from "./AuthButton";
import { PasswordField } from "./PasswordField";
import { useSignup } from "../hooks/useSignup";

export function SignupForm() {
  const navigate = useNavigate();
  const signup = useSignup();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accept, setAccept] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError(null);
    if (!accept) {
      setValidationError("Você precisa aceitar os termos de uso.");
      return;
    }
    if (password.length < 6) {
      setValidationError("A senha deve ter ao menos 6 caracteres.");
      return;
    }
    signup.mutate(
      { email, password },
      {
        onSuccess: () => navigate({ to: "/auth/verify", search: { email } }),
      },
    );
  }

  const error = validationError ?? signup.error?.message ?? null;

  return (
    <AuthShell
      title="Criar conta"
      subtitle="Monitore seu consumo em tempo real."
      footer={
        <>
          Já tem conta?{" "}
          <Link to="/auth/login" className="font-semibold text-[#1E4FA6] hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <AuthInput
          label="E-mail"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@email.com"
        />

        <PasswordField
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          minLength={6}
          placeholder="Mínimo 6 caracteres"
        />

        <label className="flex items-start gap-3 text-sm text-foreground">
          <input
            type="checkbox"
            checked={accept}
            onChange={(e) => setAccept(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[#1E4FA6]"
          />
          <span>
            Li e aceito os{" "}
            <Link to="/terms" className="font-semibold text-[#1E4FA6] hover:underline">
              termos de uso
            </Link>
            .
          </span>
        </label>

        {error ? (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">{error}</p>
        ) : null}

        <AuthButton type="submit" disabled={signup.isPending}>
          {signup.isPending ? "Enviando código..." : "Criar conta"}
        </AuthButton>

        <p className="text-center text-xs text-foreground/50">
          Enviaremos um código de confirmação para o seu e-mail.
        </p>
      </form>
    </AuthShell>
  );
}
