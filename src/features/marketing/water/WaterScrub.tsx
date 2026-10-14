import { useEffect, useRef, type RefObject } from "react";

import { loadGsap } from "../lib/gsap";
import { isMobileViewport } from "../lib/media";

/**
 * Água real controlada pelo scroll (filmagem, nunca shader).
 *
 * O vídeo avança e recua conforme a rolagem da seção-gatilho. Nunca escrevemos
 * `video.currentTime` direto a cada evento de scroll: o ScrollTrigger só atualiza
 * um ALVO, e um loop no ticker do GSAP interpola o tempo atual até esse alvo.
 *
 * Mídia: /video/agua-960.mp4 (960 px, 20 fps, todos os quadros-chave `-g 1`
 * para o scrub não travar). A água ocupa um quadro de no máximo ~600 px de
 * largura, então 960 px basta também em telas de alta densidade. No celular
 * (< 768px) a água é quadrada e vai de borda a borda: usa um recorte quadrado
 * próprio, /video/agua-mobile-720.mp4 (~3,7 MB), com poster no mesmo corte.
 *
 * Celular: o Safari do iPhone não carrega nem desenha quadros de um vídeo que
 * nunca tocou (ignora `preload`), então "destravamos" com play() + pause() logo
 * ao carregar e, se o navegador recusar (modo de economia), no primeiro toque.
 * E só pedimos uma nova posição quando a anterior terminou (`video.seeking`):
 * empilhar seeks faz o decodificador do celular nunca alcançar e a imagem congela.
 *
 * O poster é um <img> de verdade por trás do vídeo. O vídeo só recebe `src` no
 * cliente, quando há movimento permitido: em `prefers-reduced-motion`, ou se o
 * vídeo falhar, o poster fica sozinho e a seção continua completa.
 *
 * Preenche o elemento pai (absolute inset-0); o pai define tamanho e recorte.
 */

const VIDEO = "/video/agua-960.mp4";
const VIDEO_MOBILE = "/video/agua-mobile-720.mp4";
const POSTER = "/video/agua-poster-960.webp";
const POSTER_MOBILE = "/video/agua-poster-mobile-720.webp";

type WaterScrubProps = {
  /** Seção cujo progresso de scroll controla o tempo do vídeo. */
  triggerRef: RefObject<HTMLElement | null>;
  /** Intensidade da interpolação (0–1). Menor = mais inércia/suavidade. */
  lerp?: number;
};

export function WaterScrub({ triggerRef, lerp = 0.1 }: WaterScrubProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const trigger = triggerRef.current;
    if (!video || !trigger) return;

    let cancelado = false;
    let desfazer: (() => void) | null = null;

    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (cancelado) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const arquivo = isMobileViewport() ? VIDEO_MOBILE : VIDEO;
        if (!video.src.endsWith(arquivo)) {
          video.src = arquivo;
          video.load();
        }

        let destravado = false;
        const destravar = () => {
          if (destravado) return;
          const tocando = video.play();
          if (!tocando) return;
          tocando
            .then(() => {
              video.pause();
              destravado = true;
              window.removeEventListener("touchstart", destravar);
            })
            .catch(() => {
              // Autoplay recusado: tenta de novo no primeiro toque (gesto do usuário).
            });
        };
        destravar();
        window.addEventListener("touchstart", destravar, { passive: true });

        let target = 0; // tempo-alvo (s), vindo do progresso do scroll
        let current = 0; // tempo interpolado efetivamente aplicado
        let oculta = document.hidden;

        // Do topo da página até o hero sair da tela.
        const st = ScrollTrigger.create({
          trigger,
          start: "top top",
          end: "bottom top",
          onUpdate: (self) => {
            const dur = video.duration || 0;
            // Para um pouco antes do fim: o último quadro às vezes não decodifica.
            if (dur) target = self.progress * (dur - 0.05);
          },
        });

        const tick = () => {
          if (oculta || video.readyState < 1) return;
          current += (target - current) * lerp;
          if (!video.seeking && Math.abs(video.currentTime - current) > 0.01) {
            video.currentTime = current;
          }
        };
        gsap.ticker.add(tick);

        const aoMudarVisibilidade = () => {
          oculta = document.hidden;
        };
        document.addEventListener("visibilitychange", aoMudarVisibilidade);

        // Vídeo pronto para mostrar quadros: revela por cima do poster.
        const aoCarregar = () => {
          video.dataset.pronto = "true";
          st.refresh();
        };
        video.addEventListener("loadeddata", aoCarregar);

        return () => {
          gsap.ticker.remove(tick);
          window.removeEventListener("touchstart", destravar);
          document.removeEventListener("visibilitychange", aoMudarVisibilidade);
          video.removeEventListener("loadeddata", aoCarregar);
          st.kill();
        };
      });

      desfazer = () => mm.revert();
    });

    return () => {
      cancelado = true;
      desfazer?.();
    };
  }, [triggerRef, lerp]);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden bg-hm-primary-900"
      aria-hidden="true"
    >
      <picture>
        <source media="(max-width: 767px)" srcSet={POSTER_MOBILE} width={720} height={720} />
        <img
          src={POSTER}
          alt=""
          width={960}
          height={540}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </picture>
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 data-[pronto=true]:opacity-100"
        muted
        playsInline
        preload="auto"
        // sem autoplay e sem controls de propósito: o scroll conduz o tempo.
      />
    </div>
  );
}
