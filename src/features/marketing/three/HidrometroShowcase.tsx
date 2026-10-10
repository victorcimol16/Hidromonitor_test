import { Suspense, lazy, useEffect, useRef, useState } from "react";

import { loadGsap } from "../lib/gsap";
import { hasFastWebGL, isMobileViewport, prefersReducedMotion } from "../lib/media";
import { setShowcaseProgress } from "./showcaseStore";
import type { BodyVariant } from "./hidrometroMaterials";

const ShowcaseCanvas = lazy(() => import("./ShowcaseCanvas"));

const POSTER = "/models/hidrometro-poster.jpg";

// Legendas que apontam as partes durante o beat "produto" (progresso 0→1).
const CAPTIONS = [
  {
    eyebrow: "01",
    title: "A água entra",
    desc: "Toda a água da unidade passa pelo medidor — pelas conexões de entrada e saída.",
    at: [0.3, 0.46],
    side: "left",
  },
  {
    eyebrow: "02",
    title: "A água vira número",
    desc: "Cada litro que passa é registrado no mostrador, sob a lente de vidro.",
    at: [0.42, 0.58],
    side: "right",
  },
  {
    eyebrow: "03",
    title: "Cada m³ é contado",
    desc: "O totalizador soma, gota a gota, o consumo real daquela unidade.",
    at: [0.54, 0.68],
    side: "left",
  },
] as const;

/**
 * Vitrine 3D do hidrômetro (Etapa 4) — protagonista em estilo AirPods.
 *
 * Seção alta com um palco fixo (sticky). O GSAP ScrollTrigger (scrub) escreve o
 * progresso no store; a cena 3D (lazy) interpola rotação, câmera e explosão.
 * Fallbacks: poster estático enquanto o 3D carrega; em reduced-motion mostra só
 * o poster. Mobile reduz sombras/resolução.
 */
export function HidrometroShowcase({ variant = "brass" }: { variant?: BodyVariant }) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLDivElement>(null);
  const capRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Tamanho medido do palco em px (evita o canvas R3F nascer 300×150).
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [reduced, setReduced] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    // Em reduced-motion OU WebGL por software (sem GPU), usamos só o poster —
    // a cena animada ficaria a poucos fps.
    setReduced(prefersReducedMotion() || !hasFastWebGL());
    setMobile(isMobileViewport());
    const el = stageRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) setSize({ w: r.width, h: r.height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reduced) return;

    let ctx: { revert: () => void } | null = null;
    let cancelado = false;

    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (cancelado) return;
      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) => {
            const p = self.progress;
            setShowcaseProgress(p);

            // Overlays por beat (opacidade via refs, sem re-render).
            if (heroRef.current) {
              heroRef.current.style.opacity = String(1 - smooth(0.02, 0.16, p));
            }
            if (closeRef.current) {
              closeRef.current.style.opacity = String(smooth(0.82, 0.92, p));
            }
            CAPTIONS.forEach((c, i) => {
              const node = capRefs.current[i];
              if (!node) return;
              const o =
                smooth(c.at[0], c.at[0] + 0.04, p) * (1 - smooth(c.at[1] - 0.04, c.at[1], p));
              node.style.opacity = String(o);
              node.style.transform = `translateY(${(1 - o) * 10}px)`;
            });
          },
        });
      }, section);
    });

    return () => {
      cancelado = true;
      ctx?.revert();
    };
  }, [reduced, size]);

  return (
    <section
      ref={sectionRef}
      id="o-produto"
      className="relative bg-black text-white"
      style={{ height: reduced ? "100svh" : "420vh" }}
    >
      {/* Palco fixo */}
      <div ref={stageRef} className="sticky top-0 h-[100svh] w-full overflow-hidden">
        {/* Poster de fundo (sempre presente; o canvas entra por cima). */}
        <img
          src={POSTER}
          alt="Hidrômetro HidroMonitor"
          className="absolute inset-0 h-full w-full object-contain opacity-80"
        />

        {!reduced && size && (
          <Suspense fallback={null}>
            <div className="absolute inset-0" style={{ width: size.w, height: size.h }}>
              <ShowcaseCanvas variant={variant} mobile={mobile} />
            </div>
          </Suspense>
        )}

        {/* Overlay: título do hero (some ao rolar) */}
        <div
          ref={heroRef}
          className="pointer-events-none absolute inset-x-0 top-[12%] z-10 text-center"
        >
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-accent">
            A solução
          </p>
          <h2 className="mx-auto max-w-[18ch] font-display text-[clamp(2rem,5vw,4rem)] font-bold leading-[1.05] tracking-[-0.02em]">
            Um medidor para cada unidade.
          </h2>
        </div>

        {/* Legendas das partes */}
        {CAPTIONS.map((c, i) => (
          <div
            key={c.eyebrow}
            ref={(n) => {
              capRefs.current[i] = n;
            }}
            className={`pointer-events-none absolute z-10 bottom-[8%] left-5 right-5 text-center md:bottom-auto md:top-1/2 md:max-w-[17rem] ${
              c.side === "left"
                ? "md:left-[14%] md:right-auto md:text-left"
                : "md:right-[14%] md:left-auto md:text-right"
            }`}
            style={{ opacity: 0 }}
          >
            <div
              className={`flex items-center justify-center gap-2 ${
                c.side === "left" ? "md:justify-start" : "md:justify-end"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 shrink-0"
                fill={`url(#drop-${c.eyebrow})`}
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id={`drop-${c.eyebrow}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8fe0ff" />
                    <stop offset="100%" stopColor="#1e6fff" />
                  </linearGradient>
                </defs>
                <path d="M12 2.5s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11z" />
                <ellipse cx="9.6" cy="12.4" rx="1.5" ry="2.1" fill="#ffffff" opacity="0.55" />
              </svg>
              <span className="font-display text-sm font-bold text-accent">{c.eyebrow}</span>
            </div>
            <h3 className="mt-1 font-display text-lg font-semibold md:text-xl">{c.title}</h3>
            <p className="mx-auto mt-1.5 max-w-[34ch] text-sm leading-relaxed text-white/65">
              {c.desc}
            </p>
          </div>
        ))}

        {/* Overlay de fechamento (após a explosão/remontagem) */}
        <div
          ref={closeRef}
          className="pointer-events-none absolute inset-x-0 bottom-[12%] z-10 text-center"
          style={{ opacity: 0 }}
        >
          <h2 className="mx-auto max-w-[20ch] font-display text-[clamp(1.6rem,3.6vw,2.75rem)] font-bold leading-[1.1] tracking-[-0.02em]">
            Cada peça, no lugar certo.
          </h2>
        </div>

        {/* Em reduced-motion: legenda estática simples sobre o poster. */}
        {reduced && (
          <div className="absolute inset-x-0 bottom-[10%] z-10 px-6 text-center">
            <h2 className="mx-auto max-w-[20ch] font-display text-2xl font-bold">
              O hidrômetro que mede o consumo de cada unidade.
            </h2>
          </div>
        )}
      </div>
    </section>
  );
}

// Smoothstep util (0→1 com ease).
function smooth(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}
