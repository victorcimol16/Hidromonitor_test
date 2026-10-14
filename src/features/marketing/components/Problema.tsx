import { useEffect, useRef } from "react";

import { loadGsap } from "../lib/gsap";

/**
 * Capítulo 2 — O problema.
 *
 * Uma ideia: sem medição individual, a conta do prédio é dividida em partes
 * IGUAIS — como se todo apartamento gastasse a mesma água. Um único efeito: o
 * scroll monta o gráfico — barras de consumo real (desiguais) e, por cima, a
 * linha âmbar do rateio igual, expondo quem paga além do que usou.
 *
 * Desktop (≥ 1024px): seção de 220svh com palco fixo (sticky); o gráfico se
 * monta ao longo dela. Abaixo disso: o título rola normalmente e depois o
 * gráfico + as duas frases ficam fixos numa trilha de 200svh enquanto se montam.
 * A trilha e o palco viram `contents` no desktop, onde título, frases e gráfico
 * são posicionados direto na grade (frases sob o título, gráfico à direita).
 * O estado padrão (CSS) é o estado FINAL: sem JS ou em reduced-motion, a
 * composição completa continua legível. Os números são um exemplo, e a figura
 * diz isso na legenda.
 */

// Consumo mensal ILUSTRATIVO (m³) de 5 unidades. Soma = 720 m³.
const UNIDADES = [
  { apto: "101", consumo: 60 },
  { apto: "203", consumo: 95 },
  { apto: "304", consumo: 225 },
  { apto: "402", consumo: 130 },
  { apto: "504", consumo: 210 },
];
const TOTAL_M3 = UNIDADES.reduce((s, u) => s + u.consumo, 0); // 720
const RATEIO_IGUAL = TOTAL_M3 / UNIDADES.length; // 144 m³ por unidade
const MAX = Math.max(...UNIDADES.map((u) => u.consumo)); // 225 (escala)

const alturaPct = (consumo: number) => (consumo / MAX) * 100;
const LINHA_PCT = (RATEIO_IGUAL / MAX) * 100; // ~64%

// Grid compartilhado pelas três faixas (chips / barras / rótulos), para que as
// colunas fiquem perfeitamente alinhadas.
const GRID = "grid grid-cols-5 gap-2 sm:gap-4";

export function Problema() {
  const sectionRef = useRef<HTMLElement>(null);
  const trilhaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const trilha = trilhaRef.current;
    if (!section || !trilha) return;

    let cancelado = false;
    let desfazer: (() => void) | null = null;

    loadGsap().then(({ gsap }) => {
      if (cancelado) return;

      const mm = gsap.matchMedia(section);
      mm.add(
        {
          desktop: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
          mobile: "(max-width: 1023px) and (prefers-reduced-motion: no-preference)",
        },
        (ctx) => {
          const { desktop } = ctx.conditions as { desktop: boolean };

          // Estado inicial (antes do scroll): tudo recuado.
          gsap.set(".js-chip", { opacity: 0, y: 12 });
          gsap.set(".js-bar", { scaleY: 0, transformOrigin: "bottom" });
          gsap.set(".js-label", { opacity: 0, y: 8 });
          gsap.set(".js-line", { scaleX: 0, transformOrigin: "left center" });
          gsap.set(".js-line-label", { opacity: 0 });
          gsap.set(".js-callout", { opacity: 0, y: 16 });

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: desktop ? section : trilha,
              start: "top top",
              end: "bottom bottom",
              scrub: 1,
            },
          });

          tl.to(".js-chip", { opacity: 1, y: 0, stagger: 0.06, duration: 0.3 }, 0.05)
            .to(".js-bar", { scaleY: 1, stagger: 0.07, duration: 0.5 }, 0.2)
            .to(".js-label", { opacity: 1, y: 0, stagger: 0.05, duration: 0.3 }, 0.24)
            .to(".js-line", { scaleX: 1, duration: 0.4 }, 0.55)
            .to(".js-line-label", { opacity: 1, duration: 0.15 }, 0.8)
            .to(".js-callout", { opacity: 1, y: 0, stagger: 0.14, duration: 0.3 }, 0.72);
        },
      );

      desfazer = () => mm.revert();
    });

    return () => {
      cancelado = true;
      desfazer?.();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="o-problema"
      aria-labelledby="problema-titulo"
      className="relative bg-hm-bg text-hm-text lg:h-[220svh]"
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-[var(--space-6)] px-6 py-[var(--space-8)] md:px-10 md:py-[var(--space-12)] lg:sticky lg:top-0 lg:h-[100svh] lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:content-center md:gap-[var(--space-8)] lg:gap-x-[var(--space-12)] lg:gap-y-[var(--space-6)] lg:pb-[var(--space-4)] lg:pt-[calc(var(--space-8)+var(--space-3))]">
        <h2
          id="problema-titulo"
          className="max-w-[18ch] lg:col-start-1 lg:row-start-1 lg:self-end font-display text-[length:var(--text-h2)] font-bold leading-[1.08] tracking-[-0.02em]"
        >
          A conta não é injusta por ser alta. É injusta por ser dividida igual.
        </h2>

        {/* Celular: trilha alta (só com movimento) + palco fixo com gráfico e frases. */}
        <div ref={trilhaRef} className="max-lg:motion-safe:h-[200svh] lg:contents">
          <div className="max-lg:motion-safe:sticky max-lg:motion-safe:top-0 max-lg:motion-safe:flex max-lg:motion-safe:h-[100svh] max-lg:motion-safe:flex-col max-lg:motion-safe:justify-center lg:contents">
            {/* Comparativo: rateio igual (linha âmbar) × consumo real (barras). */}
            <figure className="w-full lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
              {/* Faixa 1 — quanto cada um paga no rateio igual */}
              <div className={`${GRID} mb-[var(--space-1)]`} aria-hidden="true">
                {UNIDADES.map((u) => (
                  <div key={u.apto} className="flex justify-center">
                    <span className="js-chip whitespace-nowrap rounded-full bg-hm-primary-100 px-2 py-0.5 text-[11px] font-semibold text-hm-primary sm:text-xs">
                      {RATEIO_IGUAL} m³
                    </span>
                  </div>
                ))}
              </div>

              {/* Faixa 2 — barras do consumo real + linha âmbar do rateio */}
              <div className="relative h-40 sm:h-56" aria-hidden="true">
                <div className={`${GRID} h-full border-b border-hm-text/15`}>
                  {UNIDADES.map((u) => (
                    <div key={u.apto} className="flex h-full items-end">
                      <div
                        className="js-bar w-full rounded-t-md bg-hm-primary"
                        style={{ height: `${alturaPct(u.consumo)}%` }}
                      />
                    </div>
                  ))}
                </div>

                {/* Linha do rateio igual — o único destaque âmbar da seção. A
                etiqueta é irmã da linha (não filha) para não deformar quando a
                linha escala na horizontal. */}
                <div
                  className="js-line pointer-events-none absolute inset-x-0 border-t-2 border-dashed border-hm-accent"
                  style={{ bottom: `${LINHA_PCT}%` }}
                />
                <span
                  className="js-line-label pointer-events-none absolute left-0 mb-1.5 sm:left-auto sm:right-0 whitespace-nowrap rounded-full bg-hm-accent px-2 py-1 text-[11px] font-semibold text-hm-accent-ink sm:px-3 sm:text-xs"
                  style={{ bottom: `${LINHA_PCT}%` }}
                >
                  {/* Celular: a etiqueta cabe nas duas primeiras colunas (barras baixas). */}
                  todos<span className="max-sm:hidden"> pagam</span>
                  <span className="sm:hidden">:</span> {RATEIO_IGUAL} m³
                </span>
              </div>

              {/* Faixa 3 — rótulos (apartamento + consumo real) */}
              <ul className={`${GRID} mt-[var(--space-1)]`}>
                {UNIDADES.map((u) => (
                  <li key={u.apto} className="js-label text-center leading-tight">
                    {/* Telas estreitas: só "101" / "60 m³" visíveis; o leitor de
                    tela recebe a frase completa. */}
                    <span className="block whitespace-nowrap text-xs font-semibold">
                      <span className="max-sm:sr-only">Apto </span>
                      {u.apto}
                    </span>
                    <span className="block whitespace-nowrap text-[11px] text-hm-text-muted sm:text-xs">
                      <span className="max-sm:sr-only">usou </span>
                      {u.consumo} m³
                    </span>
                  </li>
                ))}
              </ul>

              <figcaption className="mt-[var(--space-3)] text-xs leading-relaxed text-hm-text-muted">
                Exemplo ilustrativo: 5 apartamentos, {TOTAL_M3} m³ no mês, rateio igual de{" "}
                {RATEIO_IGUAL} m³ por unidade.
              </figcaption>
            </figure>

            {/* Sem parágrafo de apoio: o título afirma e os dois casos provam. */}
            <div className="space-y-[var(--space-2)] text-[length:var(--text-lead)] max-lg:mt-[var(--space-4)] lg:col-start-1 lg:row-start-2 lg:self-start">
              <p className="js-callout border-l-2 border-hm-primary pl-[var(--space-2)] leading-[var(--leading-body)]">
                O <strong>apto 101</strong> usou <strong>60 m³</strong>, mas paga por{" "}
                <strong>{RATEIO_IGUAL} m³</strong>.
              </p>
              <p className="js-callout border-l-2 border-hm-text-muted/40 pl-[var(--space-2)] leading-[var(--leading-body)]">
                O <strong>apto 304</strong> usou <strong>225 m³</strong> e paga os mesmos{" "}
                <strong>{RATEIO_IGUAL} m³</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
