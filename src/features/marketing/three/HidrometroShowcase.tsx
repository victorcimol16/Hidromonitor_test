import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";

import { loadGsap } from "../lib/gsap";
import { hasFastWebGL, isMobileViewport, prefersReducedMotion } from "../lib/media";
import { setShowcaseProgress } from "./showcaseStore";

const ShowcaseCanvas = lazy(() => import("./ShowcaseCanvas"));

// Ficha do medidor: substitui o parágrafo de apoio. A primeira linha cobre o
// hidrômetro que já existe; as demais, o medidor que a HidroMonitor instala
// quando o existente não é compatível (dados da marca).
const ESPECIFICACOES = [
  {
    termo: "Hidrômetro atual",
    descricao: "Se for compatível, continua no lugar e passa a ser lido pela plataforma.",
  },
  {
    termo: "Medidor novo",
    descricao: "Multijato, certificado pelo Inmetro. Instalado quando o atual não é compatível.",
  },
  {
    termo: "Saída de pulso",
    descricao:
      "Um sinal elétrico a cada volume medido. É por ela que a leitura chega à plataforma.",
  },
  {
    termo: "Lei 13.312/2016",
    descricao: "Torna obrigatória a medição individualizada em condomínios novos.",
  },
];

/**
 * Capítulo 3 — O medidor.
 *
 * Uma ideia: cada apartamento tem o próprio hidrômetro, e a leitura sai dele
 * sozinha. Um único efeito: o modelo 3D (convertido do STEP real) gira devagar
 * com o scroll. Desktop (≥ 1024px): seção de 180svh com palco fixo. Abaixo
 * disso: sem palco fixo; o modelo gira enquanto atravessa a tela.
 *
 * Carregamento: o poster estático (mesma pose e luz do 3D) aparece primeiro. O
 * three.js + modelo (~1 MB) só baixam quando a seção chega perto da tela, e o
 * canvas entra por cima em fade quando o modelo está pronto. Em reduced-motion
 * ou sem GPU de verdade, fica só o poster. Fora da tela, o render para.
 */
export function HidrometroShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // `false` até o cliente decidir; no SSR e sem JS fica só o poster.
  const [usar3D, setUsar3D] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [perto, setPerto] = useState(false); // já chegou perto (baixa o 3D)
  const [visivel, setVisivel] = useState(false); // está na tela (renderiza)
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    setUsar3D(!prefersReducedMotion() && hasFastWebGL());
    setMobile(isMobileViewport());
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !usar3D) return;
    const ioPerto = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setPerto(true);
          ioPerto.disconnect();
        }
      },
      { rootMargin: "100% 0px" },
    );
    const ioVisivel = new IntersectionObserver(([e]) => setVisivel(e.isIntersecting));
    ioPerto.observe(stage);
    ioVisivel.observe(stage);
    return () => {
      ioPerto.disconnect();
      ioVisivel.disconnect();
    };
  }, [usar3D]);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage || !usar3D) return;

    let cancelado = false;
    let desfazer: (() => void) | null = null;

    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (cancelado) return;
      const mm = gsap.matchMedia();
      mm.add(
        {
          desktop: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
          mobile: "(max-width: 1023px) and (prefers-reduced-motion: no-preference)",
        },
        (ctx) => {
          const { desktop } = ctx.conditions as { desktop: boolean };
          const st = ScrollTrigger.create({
            ...(desktop
              ? { trigger: section, start: "top top", end: "bottom bottom" }
              : { trigger: stage, start: "top bottom", end: "bottom top" }),
            onUpdate: (self) => setShowcaseProgress(self.progress),
          });
          setShowcaseProgress(st.progress);
          return () => st.kill();
        },
      );
      desfazer = () => mm.revert();
    });

    return () => {
      cancelado = true;
      desfazer?.();
    };
  }, [usar3D]);

  const aoFicarPronto = useCallback(() => setPronto(true), []);

  return (
    <section
      ref={sectionRef}
      id="o-medidor"
      aria-labelledby="medidor-titulo"
      className="relative bg-hm-primary-900 text-white lg:h-[180svh]"
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-[var(--space-6)] px-6 py-[var(--space-8)] md:px-10 md:py-[var(--space-12)] lg:sticky lg:top-0 lg:h-[100svh] lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-[var(--space-6)] lg:py-0">
        {/* Celular: título → modelo → ficha (o wrapper do texto vira `contents`
            para o título e a ficha entrarem na grade um de cada lado do modelo). */}
        <figure className="order-2 lg:order-none">
          <div
            ref={stageRef}
            className="relative mx-auto aspect-square w-full max-w-[min(620px,74svh)] max-sm:max-w-[340px]"
          >
            {/* Estúdio (CSS, vale para poster e 3D): luz suave atrás e sombra
                de contato no chão, para o modelo não "flutuar" no azul. */}
            <div
              className="pointer-events-none absolute inset-[6%]"
              style={{
                background:
                  "radial-gradient(closest-side at 46% 46%, rgb(91 155 255 / 0.2), transparent)",
              }}
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute bottom-[16%] left-[14%] right-[24%] h-[9%]"
              style={{
                background: "radial-gradient(closest-side, rgb(0 10 25 / 0.55), transparent)",
              }}
              aria-hidden="true"
            />
            <picture>
              <source media="(max-width: 767px)" srcSet="/models/hidrometro-saga-poster-640.webp" />
              <img
                src="/models/hidrometro-saga-poster.webp"
                alt="Hidrômetro residencial com a tampa aberta, mostrando o mostrador sob o visor."
                width={1200}
                height={1200}
                loading="lazy"
                decoding="async"
                className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${
                  pronto ? "opacity-0" : "opacity-100"
                }`}
              />
            </picture>

            {usar3D && perto && (
              <div
                className={`absolute inset-0 transition-opacity duration-700 ${
                  pronto ? "opacity-100" : "opacity-0"
                }`}
                aria-hidden="true"
              >
                <Suspense fallback={null}>
                  <ShowcaseCanvas mobile={mobile} ativo={visivel} onReady={aoFicarPronto} />
                </Suspense>
              </div>
            )}
          </div>
          <figcaption className="mt-[var(--space-2)] text-center text-xs text-white/60">
            Modelo 3D ilustrativo de hidrômetro residencial DN ¾″.
          </figcaption>
        </figure>

        <div className="max-lg:contents">
          <h2
            id="medidor-titulo"
            className="max-w-[18ch] max-lg:order-1 font-display text-[clamp(2rem,1.25rem+2.4vw,3.25rem)] lg:[@media(max-height:720px)]:text-[2.5rem] font-bold leading-[1.08] tracking-[-0.02em]"
          >
            Um hidrômetro por apartamento.
          </h2>
          <dl className="max-w-[48ch] border-t max-lg:order-3 lg:mt-[var(--space-6)] border-white/15 lg:[@media(max-height:720px)]:mt-[var(--space-4)]">
            {ESPECIFICACOES.map((e) => (
              <div
                key={e.termo}
                className="grid grid-cols-[10rem_minmax(0,1fr)] gap-[var(--space-2)] border-b border-white/15 py-[var(--space-2)] max-sm:grid-cols-1 max-sm:gap-1"
              >
                <dt className="font-semibold text-white">{e.termo}</dt>
                <dd className="leading-snug text-white/75">{e.descricao}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
