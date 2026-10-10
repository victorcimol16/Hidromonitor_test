import { useEffect, useRef } from "react";

import { WHATSAPP_URL } from "@/lib/brand";
import { Nav } from "./Nav";
import { WaterScrub } from "../water/WaterScrub";
import { AmbientDepth } from "../water/AmbientDepth";
import { loadGsap } from "../lib/gsap";
import { prefersReducedMotion } from "../lib/media";

/**
 * Capítulo 1 — Hero ("profundidade submersa").
 *
 * Uma ideia: a água do condomínio passa a ser medida por quem a usa. O
 * elemento-assinatura é a sensação de estar sob a água: vídeo real ao fundo
 * (scrub no scroll) + raios de luz, brilho de sol, bolhas subindo e uma faixa
 * de superfície (ver AmbientDepth). O texto faz uma entrada curta e o CTA âmbar
 * é o único ponto quente.
 */
export function Hero() {
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    if (prefersReducedMotion()) return;

    let ctx: { revert: () => void } | null = null;
    let cancelado = false;

    loadGsap().then(({ gsap }) => {
      if (cancelado) return;
      ctx = gsap.context(() => {
        gsap.from(".js-hero", {
          y: 26,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.12,
          delay: 0.15,
        });
      }, header);
    });

    return () => {
      cancelado = true;
      ctx?.revert();
    };
  }, []);

  return (
    <header
      ref={headerRef}
      className="relative flex min-h-[100svh] flex-col overflow-hidden text-deep-foreground"
      style={{ backgroundColor: "var(--deep)" }}
    >
      {/* Vídeo de água real ao fundo — o scroll do hero controla o tempo.
          overlay=false: o tratamento de cor fica a cargo das camadas abaixo. */}
      <WaterScrub triggerRef={headerRef} overlay={false} />

      {/* Véu da marca: topo translúcido (deixa a luz/superfície e a filmagem
          aparecerem), base no azul profundo para a transição e o contraste. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, color-mix(in oklch, var(--deep), transparent 30%) 46%, var(--deep) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Atmosfera submersa: raios, sol, bolhas, superfície. */}
      <AmbientDepth />

      {/* Escurecimento sutil só no topo, para o logo/nav manterem contraste
          sobre a água clara do horizonte. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-32"
        style={{
          background:
            "linear-gradient(to bottom, color-mix(in oklch, var(--deep), transparent 28%) 0%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      {/* Scrim radial atrás do texto, para contraste AA sobre a cena. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 50% 54%, color-mix(in oklch, var(--deep), transparent 30%) 0%, transparent 72%)",
        }}
        aria-hidden="true"
      />

      <Nav />

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 pt-24 pb-16 text-center">
        <p className="js-hero mb-6 text-xs font-semibold uppercase tracking-[0.22em] text-deep-foreground/60">
          Para síndicos e administradoras
        </p>

        <h1 className="js-hero text-[clamp(2.5rem,6.2vw,5.5rem)] font-bold leading-[1.03] tracking-[-0.02em] [text-shadow:0_2px_30px_rgba(0,20,45,0.45)]">
          Cada unidade paga
          <br />
          pela água que usa.
        </h1>

        <p className="js-hero mt-6 max-w-[46ch] text-[clamp(1.05rem,1.8vw,1.3rem)] leading-relaxed text-deep-foreground/75">
          Medição individual de consumo para condomínios — usando os hidrômetros
          que o seu prédio já tem.
        </p>

        <div className="js-hero mt-9 flex flex-wrap items-center justify-center gap-3">
          <a
            href={WHATSAPP_URL}
            className="rounded-full bg-accent px-8 py-3.5 font-semibold text-accent-foreground shadow-[0_12px_40px_-8px_rgba(255,191,82,0.55)] transition-transform duration-300 hover:scale-105"
          >
            Verificar meu condomínio
          </a>
          <a
            href="#o-problema"
            className="rounded-full border border-deep-foreground/25 px-8 py-3.5 font-semibold text-deep-foreground backdrop-blur-sm transition-colors duration-300 hover:bg-white/10"
          >
            Como funciona
          </a>
        </div>
      </div>

      {/* Indicação sutil de rolagem — fora do fluxo, fixa no rodapé do hero,
          para não competir por espaço vertical com o conteúdo central. */}
      <div
        className="js-hero pointer-events-none absolute inset-x-0 bottom-7 z-10 flex flex-col items-center gap-2 text-deep-foreground/50"
        aria-hidden="true"
      >
        <span className="text-[0.7rem] uppercase tracking-[0.2em]">Role</span>
        <span className="h-9 w-px bg-deep-foreground/40 animate-[scroll-cue_2s_ease-in-out_infinite] motion-reduce:animate-none" />
      </div>
    </header>
  );
}
