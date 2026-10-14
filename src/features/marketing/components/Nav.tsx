import type { MouseEvent } from "react";
import { Link } from "@tanstack/react-router";

import { LogoMark } from "@/components/brand/Logo";
import { BRAND_COLORS } from "@/lib/brand";
import { SECOES } from "../lib/secoes";
import { scrollToSection } from "../lib/useSmoothScroll";

/**
 * Barra editorial: faz parte do topo da página e rola junto com ela (não é
 * fixa). Fundo branco sólido, fio fino embaixo, links em texto. Sem vidro, sem
 * pílula, sem trocar de cor e sem sumir/aparecer — nenhum código de scroll.
 *
 * Links das seções só a partir de `md`; no celular ficam a marca e "Contato"
 * (sem menu escondido, então não há menu móvel a manter). As seções também
 * estão no rodapé.
 */
export function Nav() {
  const irPara = (id: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollToSection(id);
  };

  return (
    <nav aria-label="Principal" className="border-b border-hm-text/15 bg-hm-bg">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-[var(--space-3)] px-6 md:px-10">
        <Link
          to="/"
          className="flex min-h-11 items-center gap-2 text-base font-semibold tracking-tight"
        >
          <LogoMark size={26} />
          <span>
            <span style={{ color: BRAND_COLORS.hidroOnLight }}>Hidro</span>
            <span style={{ color: "#008bcc" }}>Monitor</span>
          </span>
        </Link>

        <div className="flex items-center gap-[var(--space-4)]">
          <ul className="hidden items-center gap-[var(--space-3)] md:flex">
            {SECOES.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={irPara(s.id)}
                  className="inline-flex min-h-11 items-center text-sm text-hm-text-muted transition-colors hover:text-hm-text"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#contato"
            onClick={irPara("contato")}
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-hm-primary-900 underline-offset-4 hover:underline"
          >
            Contato <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
