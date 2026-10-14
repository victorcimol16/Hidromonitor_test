import { useEffect, useRef } from "react";

import { loadGsap } from "../lib/gsap";

/**
 * Capítulo 5 — Como funciona.
 *
 * Uma ideia: do hidrômetro à tela, em quatro passos. Processo vira sequência
 * numerada. Um único efeito: a linha que liga os passos se preenche conforme o
 * scroll (scrub). O título fica fixo ao lado no desktop (sticky de CSS, sem
 * pin). Estado padrão (CSS) = linha cheia: sem JS ou em reduced-motion a seção
 * está completa.
 */

const PASSOS = [
  {
    titulo: "Avaliamos os hidrômetros do prédio",
    descricao:
      "Você nos diz onde fica o condomínio e verificamos se os hidrômetros já instalados são compatíveis. Sem compromisso.",
  },
  {
    titulo: "Conectamos ou instalamos",
    descricao:
      "Os compatíveis são conectados. Os que não forem dão lugar a medidores multijato certificados pelo Inmetro, com saída de pulso.",
  },
  {
    titulo: "A leitura chega sozinha",
    descricao:
      "Cada pulso do medidor vira consumo na plataforma, por unidade e por bloco. Sem visita porta a porta e sem planilha.",
  },
  {
    titulo: "Você acompanha e divide com justiça",
    descricao:
      "Consumo de cada apartamento, alertas quando algo foge do padrão e histórico completo, no computador ou no celular.",
  },
];

export function ComoFunciona() {
  const listaRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const lista = listaRef.current;
    if (!lista) return;

    let cancelado = false;
    let desfazer: (() => void) | null = null;

    loadGsap().then(({ gsap }) => {
      if (cancelado) return;
      const mm = gsap.matchMedia(lista);
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".js-linha",
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            transformOrigin: "top center",
            scrollTrigger: { trigger: lista, start: "top 65%", end: "bottom 65%", scrub: 1 },
          },
        );
      });
      desfazer = () => mm.revert();
    });

    return () => {
      cancelado = true;
      desfazer?.();
    };
  }, []);

  return (
    <section
      id="como-funciona"
      aria-labelledby="como-funciona-titulo"
      className="bg-hm-primary-100/60 py-[var(--space-12)] text-hm-text md:py-[var(--space-16)]"
    >
      <div className="mx-auto grid max-w-6xl gap-[var(--space-8)] px-6 md:px-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-[var(--space-12)]">
        <div className="lg:sticky lg:top-[var(--space-16)] lg:self-start">
          <h2
            id="como-funciona-titulo"
            className="max-w-[16ch] font-display text-[length:var(--text-h2)] font-bold leading-[1.08] tracking-[-0.02em]"
          >
            Do hidrômetro à tela, em quatro passos.
          </h2>
        </div>

        <ol ref={listaRef} className="relative">
          {/* Trilho + preenchimento: centrados nos marcadores (40px → 19px). */}
          <span
            className="absolute bottom-6 left-[19px] top-6 w-0.5 bg-hm-text/10"
            aria-hidden="true"
          />
          <span
            className="js-linha absolute bottom-6 left-[19px] top-6 w-0.5 origin-top bg-hm-primary"
            aria-hidden="true"
          />

          {PASSOS.map((p, i) => (
            <li
              key={p.titulo}
              className="relative grid grid-cols-[40px_minmax(0,1fr)] gap-x-[var(--space-3)] pb-[var(--space-6)] last:pb-0"
            >
              <span
                className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-hm-primary bg-white font-display text-sm font-bold text-hm-primary"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <div className="pt-1.5">
                <h3 className="font-display text-xl font-semibold leading-snug">
                  <span className="sr-only">Passo {i + 1}: </span>
                  {p.titulo}
                </h3>
                <p className="mt-[var(--space-1)] max-w-[48ch] leading-[var(--leading-body)] text-hm-text-muted">
                  {p.descricao}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
