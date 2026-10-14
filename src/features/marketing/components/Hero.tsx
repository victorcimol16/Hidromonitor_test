import { useRef, type MouseEvent } from "react";

import { WaterScrub } from "../water/WaterScrub";
import { scrollToSection } from "../lib/useSmoothScroll";

/**
 * Capítulo 1 — Hero (editorial).
 *
 * Uma ideia: cada unidade paga pela água que usa. Fundo claro e tipografia como
 * protagonista: o título usa dois pesos (leve + negrito) da mesma família. A
 * filmagem real da água fica num quadro recortado, como uma foto em página de
 * revista, e é o único efeito: avança e recua com a rolagem enquanto o hero sai
 * da tela. Nada de texto sobre o vídeo, então não há véu nem problema de
 * contraste. Embaixo, uma linha de fatos concretos.
 *
 * Altura: uma tela menos a barra de navegação (57px, estática acima do hero).
 * O texto não anima: está legível desde o primeiro quadro, sem depender de JS.
 */

const FATOS = [
  "Medidores certificados pelo Inmetro",
  "Leitura automática por saída de pulso",
  "Medição individualizada prevista na Lei 13.312/2016",
];

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  const irParaContato = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollToSection("contato");
  };

  return (
    <section
      ref={sectionRef}
      id="inicio"
      aria-labelledby="hero-titulo"
      className="flex min-h-[calc(100svh-57px)] flex-col bg-hm-bg text-hm-text"
    >
      <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-[var(--space-6)] px-6 pb-[var(--space-6)] pt-[var(--space-6)] md:px-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-[var(--space-8)]">
        <div>
          <h1
            id="hero-titulo"
            className="font-display text-[clamp(2.75rem,1rem+5.6vw,6.25rem)] leading-[0.98] tracking-[-0.035em] text-hm-primary-900"
          >
            <span className="block font-light">Cada unidade paga</span>
            <span className="block font-bold">pela água que usa.</span>
          </h1>

          <p className="mt-[var(--space-4)] max-w-[40ch] text-[length:var(--text-lead)] leading-[1.5] text-hm-text-muted">
            Medição individual de água para condomínios, com os hidrômetros do prédio ou medidores
            novos.
          </p>

          <a
            href="#contato"
            onClick={irParaContato}
            className="mt-[var(--space-6)] inline-flex min-h-12 items-center gap-[var(--space-2)] rounded-sm bg-hm-primary-900 px-[var(--space-3)] font-semibold text-white transition-colors hover:bg-hm-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-hm-primary"
          >
            Avaliar meu condomínio
            <span aria-hidden="true">→</span>
          </a>
        </div>

        {/* Quadro da água: retrato no desktop, paisagem no celular. */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm lg:aspect-[4/5] lg:max-h-[68svh] lg:justify-self-end">
          <WaterScrub triggerRef={sectionRef} />
        </div>
      </div>

      <ul className="mx-auto grid w-full max-w-6xl border-t border-hm-text/15 px-6 text-sm text-hm-text-muted md:grid-cols-3 md:px-10">
        {FATOS.map((f, i) => (
          <li
            key={f}
            className={`py-[var(--space-2)] md:py-[var(--space-3)] ${
              i > 0
                ? "border-t border-hm-text/10 md:border-l md:border-t-0 md:pl-[var(--space-3)]"
                : ""
            }`}
          >
            {f}
          </li>
        ))}
      </ul>
    </section>
  );
}
