import { InstagramIcon, WhatsAppIcon } from "@/components/icons";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL, WHATSAPP_DISPLAY, WHATSAPP_URL } from "@/lib/brand";

/**
 * Capítulo 6 — Contato (fechamento editorial).
 *
 * Uma ideia: falar com a HidroMonitor agora. Mesmo vocabulário do hero: fundo
 * claro, título em dois pesos e os contatos diretos como linhas grandes,
 * separadas por fios. Sem formulário: não há backend para leads, e um
 * formulário que só abre o WhatsApp era um passo a mais sem ganho real.
 *
 * O link do WhatsApp já leva a mensagem inicial escrita; a pessoa só completa
 * e envia. Sem animação.
 */

const WHATSAPP_AVALIACAO = `${WHATSAPP_URL}?text=${encodeURIComponent(
  "Olá! Quero avaliar a medição individual de água no meu condomínio.",
)}`;

const CANAIS = [
  {
    nome: "WhatsApp",
    valor: WHATSAPP_DISPLAY,
    href: WHATSAPP_AVALIACAO,
    Icone: WhatsAppIcon,
  },
  {
    nome: "Instagram",
    valor: `@${INSTAGRAM_HANDLE}`,
    href: INSTAGRAM_URL,
    Icone: InstagramIcon,
  },
];

export function Contato() {
  return (
    <section
      id="contato"
      aria-labelledby="contato-titulo"
      className="border-t border-hm-text/15 bg-hm-bg py-[var(--space-8)] text-hm-text md:py-[var(--space-12)] lg:py-[var(--space-16)]"
    >
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <h2
          id="contato-titulo"
          className="font-display text-[clamp(2.25rem,1rem+4.2vw,4.75rem)] leading-[1] tracking-[-0.03em] text-hm-primary-900"
        >
          <span className="block font-light">Vamos ver se o seu condomínio</span>
          <span className="block font-bold">já está pronto?</span>
        </h2>

        <ul className="mt-[var(--space-8)] border-t border-hm-text/15">
          {CANAIS.map(({ nome, valor, href, Icone }) => (
            <li key={nome} className="border-b border-hm-text/15">
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group grid min-h-[72px] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-[var(--space-3)] gap-y-1 py-[var(--space-3)] md:py-[var(--space-2)] transition-colors hover:text-hm-primary md:grid-cols-[12rem_minmax(0,1fr)_auto]"
              >
                <span className="flex items-center gap-[var(--space-1)] text-sm text-hm-text-muted max-md:col-start-1">
                  <Icone />
                  {nome}
                </span>
                <span className="font-display max-md:col-start-1 md:truncate text-[clamp(1.25rem,0.9rem+1.6vw,2rem)] font-semibold tracking-[-0.01em]">
                  {valor}
                </span>
                <span
                  className="text-xl transition-transform max-md:col-start-2 max-md:row-span-2 max-md:row-start-1 group-hover:translate-x-1 motion-reduce:transition-none"
                  aria-hidden="true"
                >
                  →
                </span>
                <span className="sr-only"> (abre em nova aba)</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
