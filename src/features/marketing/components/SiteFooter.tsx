import type { MouseEvent } from "react";

import { BRAND_COLORS } from "@/lib/brand";
import { SECOES } from "../lib/secoes";
import { scrollToSection } from "../lib/useSmoothScroll";

/**
 * Rodapé: marca e navegação. Os contatos (WhatsApp, Instagram) ficam na seção
 * Contato, logo acima — não se repetem aqui. Horário de atendimento, área
 * atendida e e-mail ficam de fora até serem confirmados.
 */
export function SiteFooter() {
  const irPara = (id: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollToSection(id);
  };

  const link =
    "inline-flex min-h-11 items-center gap-2 whitespace-nowrap text-white/75 transition-colors hover:text-white";

  return (
    <footer className="bg-hm-primary-950 text-white">
      <div className="mx-auto grid max-w-6xl gap-[var(--space-6)] px-6 py-[var(--space-8)] md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:px-10">
        <div>
          <p className="text-xl font-semibold tracking-tight">
            <span style={{ color: BRAND_COLORS.hidroOnDark }}>Hidro</span>
            <span style={{ color: BRAND_COLORS.monitor }}>Monitor</span>
          </p>
          <p className="mt-[var(--space-1)] max-w-[36ch] text-sm leading-relaxed text-white/65">
            Medição individualizada de água para condomínios. Cada unidade paga pela água que usa.
          </p>
        </div>

        <nav aria-labelledby="rodape-pagina">
          <h2 id="rodape-pagina" className="text-sm font-semibold text-white">
            Nesta página
          </h2>
          <ul className="mt-[var(--space-1)] text-sm">
            {SECOES.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} onClick={irPara(s.id)} className={link}>
                  {s.label}
                </a>
              </li>
            ))}
            <li>
              <a href="#contato" onClick={irPara("contato")} className={link}>
                Contato
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/10 py-[var(--space-3)] text-center text-xs text-white/60">
        © {new Date().getFullYear()} HidroMonitor. Todos os direitos reservados.
      </div>
    </footer>
  );
}
