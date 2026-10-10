import { useEffect, useRef, type RefObject } from "react";

import { loadGsap } from "../lib/gsap";
import { prefersReducedMotion } from "../lib/media";

/**
 * Água real controlada pelo scroll (filmagem, nunca shader).
 *
 * O vídeo avança e recua conforme a rolagem da seção-gatilho. Nunca escrevemos
 * `video.currentTime` direto a cada evento de scroll: o ScrollTrigger só atualiza
 * um ALVO, e um loop no ticker do GSAP interpola o tempo atual até esse alvo —
 * é isso que dá a sensação de a água se mover junto com o dedo, suave nos dois
 * sentidos.
 *
 * Sobre o vídeo fica um gradiente do azul profundo da marca, que unifica a cor
 * da filmagem com a identidade e garante contraste para os textos por cima.
 *
 * Fallback: enquanto o arquivo não existe/carrega, aparece o poster (primeiro
 * frame) sobre o azul profundo — então a seção nunca fica "vazia". Em
 * `prefers-reduced-motion`, o vídeo não faz scrub: fica no poster estático.
 */

type WaterScrubProps = {
  /** Seção cujo progresso de scroll controla o tempo do vídeo. */
  triggerRef: RefObject<HTMLElement | null>;
  src?: string;
  poster?: string;
  /** ScrollTrigger start/end (padrão: cobre a entrada e saída da seção). */
  start?: string;
  end?: string;
  /** Intensidade da interpolação (0–1). Menor = mais inércia/suavidade. */
  lerp?: number;
  /** Renderiza o gradiente da marca por cima do vídeo (padrão). Passe `false`
   *  quando a seção fornecer o próprio tratamento de cor/contraste. */
  overlay?: boolean;
  className?: string;
};

export function WaterScrub({
  triggerRef,
  src = "/video/agua.mp4",
  poster = "/video/agua-poster.jpg",
  start = "top top",
  end = "bottom top",
  lerp = 0.1,
  overlay = true,
  className = "",
}: WaterScrubProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const trigger = triggerRef.current;
    if (!video || !trigger) return;

    // Menos movimento: sem scrub. O poster/primeiro frame estático basta.
    if (prefersReducedMotion()) return;

    let cancelado = false;
    let cleanup: (() => void) | null = null;

    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (cancelado) return;

      let target = 0; // tempo-alvo (s), vindo do progresso do scroll
      let current = 0; // tempo interpolado efetivamente aplicado
      let hidden = document.hidden;

      const st = ScrollTrigger.create({
        trigger,
        start,
        end,
        onUpdate: (self) => {
          const dur = video.duration || 0;
          if (dur) target = self.progress * dur;
        },
      });

      // Loop de interpolação: aproxima `current` de `target` e aplica no vídeo.
      // Só escreve currentTime quando a diferença é perceptível (evita trabalho
      // à toa) e pausa quando a aba está oculta.
      const tick = () => {
        if (hidden) return;
        current += (target - current) * lerp;
        if (Math.abs(video.currentTime - current) > 0.01) {
          video.currentTime = current;
        }
      };
      gsap.ticker.add(tick);

      const onVisibility = () => {
        hidden = document.hidden;
      };
      document.addEventListener("visibilitychange", onVisibility);

      // Garante que o ScrollTrigger recalcule quando a metadata (duração) chega.
      const onMeta = () => ScrollTrigger.refresh();
      video.addEventListener("loadedmetadata", onMeta);

      cleanup = () => {
        gsap.ticker.remove(tick);
        document.removeEventListener("visibilitychange", onVisibility);
        video.removeEventListener("loadedmetadata", onMeta);
        st.kill();
      };
    });

    return () => {
      cancelado = true;
      cleanup?.();
    };
  }, [triggerRef, start, end, lerp]);

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      // Azul profundo por baixo: se o vídeo faltar/carregar, a área continua
      // sendo a cor da marca, nunca branco.
      style={{ backgroundColor: "var(--deep)" }}
      aria-hidden="true"
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src={src}
        poster={poster}
        muted
        playsInline
        preload="auto"
        // sem autoplay e sem controls de propósito: o scroll conduz o tempo.
      />
      {/* Gradiente da marca: escurece topo (nav) e base (texto), deixa o meio
          respirar. Unifica a cor da filmagem com o azul profundo. */}
      {overlay && (
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, color-mix(in oklch, var(--deep), transparent 15%) 0%, color-mix(in oklch, var(--deep), transparent 55%) 38%, color-mix(in oklch, var(--deep), transparent 45%) 60%, var(--deep) 100%)",
          }}
        />
      )}
    </div>
  );
}
