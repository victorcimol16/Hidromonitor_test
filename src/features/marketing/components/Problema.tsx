import { useEffect, useRef } from "react";

import { loadGsap } from "../lib/gsap";
import { prefersReducedMotion } from "../lib/media";

/**
 * Capítulo 2 — O problema.
 *
 * Uma ideia: sem medição individual, a conta do prédio é dividida em partes
 * IGUAIS — como se todo apartamento gastasse a mesma água. Um único efeito: o
 * scroll revela as barras de consumo REAL (desiguais) e a linha âmbar do
 * rateio igual cruzando todas, expondo quem paga além do que usou.
 *
 * Palco fixo via `position: sticky` numa seção alta; um timeline do GSAP com
 * `scrub` atrela cada etapa à rolagem. O estado padrão (CSS) é o estado FINAL
 * visível — o JS só recua para o início e anima. Assim, sem JS ou em
 * reduced-motion, a composição completa continua legível.
 */

// Consumo mensal fictício (m³) de 5 unidades. Soma = 720 m³.
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
const GRID = "grid grid-cols-5 gap-1.5 sm:gap-6";

export function Problema() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    // Reduced-motion: mantém o estado final estático (CSS), sem animar.
    if (prefersReducedMotion()) return;

    let ctx: { revert: () => void } | null = null;
    let cancelado = false;

    loadGsap().then(({ gsap }) => {
      if (cancelado) return;

      ctx = gsap.context(() => {
        // Estado inicial (antes do scroll): tudo recuado.
        gsap.set(".js-chip", { opacity: 0, y: 12 });
        gsap.set(".js-bar", { scaleY: 0, transformOrigin: "bottom" });
        gsap.set(".js-label", { opacity: 0, y: 8 });
        gsap.set(".js-line", { scaleX: 0, transformOrigin: "left center" });
        gsap.set(".js-callout", { opacity: 0, y: 14 });

        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
          },
        });

        tl.to(".js-chip", { opacity: 1, y: 0, stagger: 0.06, duration: 0.3 }, 0.05)
          .to(".js-bar", { scaleY: 1, stagger: 0.07, duration: 0.5 }, 0.2)
          .to(".js-label", { opacity: 1, y: 0, stagger: 0.05, duration: 0.3 }, 0.24)
          .to(".js-line", { scaleX: 1, duration: 0.4 }, 0.55)
          .to(".js-callout", { opacity: 1, y: 0, stagger: 0.14, duration: 0.3 }, 0.72);
      }, stage);
    });

    return () => {
      cancelado = true;
      ctx?.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="o-problema"
      className="relative bg-background"
      // Seção alta: dá curso de scroll para o palco fixo animar.
      style={{ minHeight: "230vh" }}
    >
      <div
        ref={stageRef}
        className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-6 pt-16"
      >
        <div className="mx-auto w-full max-w-3xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            O problema
          </p>
          <h2 className="mx-auto max-w-[24ch] text-[clamp(1.6rem,3.4vw,2.6rem)] font-bold leading-[1.12] tracking-[-0.02em] text-foreground">
            A conta não é injusta por ser alta. É injusta por ser dividida igual.
          </h2>
          <p className="mx-auto mt-4 max-w-[52ch] text-[clamp(0.98rem,1.4vw,1.15rem)] leading-relaxed text-muted-foreground">
            Sem medição individual, o consumo do prédio é rateado em partes
            iguais — como se todo apartamento gastasse a mesma água.
          </p>
        </div>

        {/* Comparativo: rateio igual (linha âmbar) × consumo real (barras azuis) */}
        <div className="mt-8 w-full max-w-3xl">
          {/* Faixa 1 — chips do rateio igual */}
          <div className={`${GRID} mb-3`}>
            {UNIDADES.map((u) => (
              <div key={u.apto} className="flex justify-center">
                <span className="js-chip rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-primary">
                  {RATEIO_IGUAL} m³
                </span>
              </div>
            ))}
          </div>

          {/* Faixa 2 — trilhos das barras + linha âmbar sobreposta */}
          <div className="relative h-32 sm:h-44">
            <div className={`${GRID} h-full`}>
              {UNIDADES.map((u) => (
                <div key={u.apto} className="flex h-full items-end">
                  <div
                    className="js-bar w-full rounded-t-xl"
                    style={{
                      height: `${alturaPct(u.consumo)}%`,
                      background:
                        "linear-gradient(to top, var(--primary), color-mix(in oklch, var(--primary), white 22%))",
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Linha do rateio igual — o único destaque âmbar da seção.
                Cruza toda a faixa no % do rateio e é desenhada da esquerda p/ a
                direita conforme o scroll. */}
            <div
              className="js-line pointer-events-none absolute inset-x-0 border-t-2 border-dashed"
              style={{ bottom: `${LINHA_PCT}%`, borderColor: "var(--accent)" }}
            >
              <span className="absolute -top-3 right-0 translate-y-[-50%] rounded-full bg-accent px-3 py-1 text-[10px] font-semibold text-accent-foreground">
                todos pagam igual · {RATEIO_IGUAL} m³
              </span>
            </div>
          </div>

          {/* Faixa 3 — rótulos (apartamento + consumo real) */}
          <div className={`${GRID} mt-3`}>
            {UNIDADES.map((u) => (
              <div key={u.apto} className="js-label text-center">
                <p className="text-xs font-semibold text-foreground">Apto {u.apto}</p>
                <p className="text-[11px] text-muted-foreground">usou {u.consumo} m³</p>
              </div>
            ))}
          </div>
        </div>

        {/* Destaques da injustiça (âmbar fica reservado à linha do rateio) */}
        <div className="mt-8 flex w-full max-w-3xl flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
          <p className="js-callout rounded-xl border border-primary/25 bg-primary/5 px-4 py-2.5 text-sm text-foreground">
            <span className="font-semibold text-primary">Apto 101</span> usou{" "}
            <strong>60 m³</strong>, mas paga por <strong>144 m³</strong>.
          </p>
          <p className="js-callout rounded-xl border border-border bg-muted/50 px-4 py-2.5 text-sm text-foreground">
            <span className="font-semibold text-foreground">Apto 304</span> usou{" "}
            <strong>225 m³</strong> e paga os mesmos <strong>144 m³</strong>.
          </p>
        </div>
      </div>
    </section>
  );
}
