import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Termos de Uso — HidroMonitor" },
      { name: "description", content: "Termos de uso do HidroMonitor." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <Link to="/auth/signup" className="text-sm text-muted-foreground hover:text-primary">
          ← Voltar
        </Link>
        <h1 className="mt-6 font-display text-4xl font-bold">Termos de Uso</h1>
        <p className="mt-2 text-sm text-muted-foreground">Última atualização: julho de 2026</p>

        <div className="prose mt-8 space-y-6 text-sm leading-relaxed text-foreground/80">
          <section>
            <h2 className="font-display text-xl font-semibold text-foreground">1. Aceitação</h2>
            <p className="mt-2">
              Ao criar uma conta no HidroMonitor, você concorda com estes termos. Se não concordar,
              não utilize o serviço.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground">
              2. Uso do serviço
            </h2>
            <p className="mt-2">
              O HidroMonitor oferece um painel de monitoramento de consumo de água associado ao
              hidrômetro adquirido. Você é responsável por manter suas credenciais em sigilo.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground">3. Privacidade</h2>
            <p className="mt-2">
              Coletamos apenas os dados necessários para operar o serviço: e-mail e leituras do
              hidrômetro. Não vendemos nem compartilhamos dados pessoais com terceiros para fins
              publicitários.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground">
              4. Garantia do produto
            </h2>
            <p className="mt-2">
              O hidrômetro possui garantia de fábrica conforme a nota fiscal. Defeitos por mau uso
              não estão cobertos.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground">5. Alterações</h2>
            <p className="mt-2">
              Podemos atualizar estes termos periodicamente. Alterações relevantes serão comunicadas
              por e-mail.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground">6. Contato</h2>
            <p className="mt-2">
              Dúvidas? Fale conosco no WhatsApp ou pelo Instagram indicados no rodapé do site.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
