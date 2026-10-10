import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthShell } from "./AuthShell";
import { AuthButton } from "./AuthButton";
import { OtpInput } from "./OtpInput";
import { useResendOtp, useVerifyOtp } from "../hooks/useVerifyOtp";

const EMPTY_CODE = ["", "", "", "", "", ""];

export function VerifyForm({ email }: { email?: string }) {
  const navigate = useNavigate();
  const verifyOtp = useVerifyOtp();
  const resendOtp = useResendOtp();
  const [digits, setDigits] = useState<string[]>(EMPTY_CODE);
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  const code = digits.join("");

  function submit(fullCode: string) {
    if (!email) {
      setError("Sessão de verificação expirada. Refaça o cadastro.");
      return;
    }
    setError(null);
    verifyOtp.mutate(
      { email, token: fullCode },
      {
        onSuccess: () => navigate({ to: "/dashboard" }),
        onError: () => {
          setError("Código inválido ou expirado.");
          setDigits(EMPTY_CODE);
        },
      },
    );
  }

  useEffect(() => {
    if (code.length !== 6 || verifyOtp.isPending) return;
    submit(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  function resend() {
    if (!email) return;
    setError(null);
    setResent(false);
    resendOtp.mutate(email, {
      onSuccess: () => setResent(true),
      onError: (err) => setError(err.message),
    });
  }

  return (
    <AuthShell
      title="Confirme seu e-mail"
      subtitle={email ? `Digite o código de 6 dígitos enviado para ${email}` : ""}
      backTo="/auth/signup"
      backLabel="Voltar"
    >
      <div className="space-y-5">
        <OtpInput digits={digits} onDigitsChange={setDigits} disabled={verifyOtp.isPending} />

        {error ? (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">{error}</p>
        ) : null}
        {resent ? (
          <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
            Novo código enviado.
          </p>
        ) : null}
        {verifyOtp.isPending ? (
          <p className="text-center text-sm text-muted-foreground">Verificando...</p>
        ) : (
          <AuthButton type="button" onClick={() => submit(code)} disabled={code.length !== 6}>
            Confirmar
          </AuthButton>
        )}

        <button
          type="button"
          onClick={resend}
          className="mx-auto block text-sm text-muted-foreground hover:text-[#1E4FA6]"
        >
          Reenviar código
        </button>
      </div>
    </AuthShell>
  );
}
