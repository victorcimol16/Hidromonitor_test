import { useEffect } from "react";

import { loadGsap } from "./gsap";
import { prefersReducedMotion } from "./media";

/**
 * Rolagem suave (Lenis) na página inteira, sincronizada com o GSAP.
 *
 * - Roda só no cliente (dentro de `useEffect`), seguro no SSR.
 * - Lenis e GSAP são importados dinamicamente: ficam fora do bundle do servidor.
 * - Respeita `prefers-reduced-motion`: desliga e deixa a rolagem nativa.
 * - Um único rAF para tudo (o ticker do GSAP conduz o `raf` do Lenis), que é
 *   o casamento recomendado entre Lenis e ScrollTrigger.
 *
 * Chame uma vez, no componente raiz da landing.
 */
export function useSmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    let destruir: (() => void) | null = null;
    let cancelado = false;

    Promise.all([import("lenis"), loadGsap()]).then(
      ([{ default: Lenis }, { gsap, ScrollTrigger }]) => {
        if (cancelado) return;

        const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });

        // A cada scroll do Lenis, o ScrollTrigger reavalia os gatilhos.
        lenis.on("scroll", ScrollTrigger.update);

        // Um único loop: o ticker do GSAP conduz o rAF do Lenis.
        // (GSAP entrega o tempo em segundos; o Lenis espera milissegundos.)
        const aoTick = (tempo: number) => lenis.raf(tempo * 1000);
        gsap.ticker.add(aoTick);
        gsap.ticker.lagSmoothing(0);

        destruir = () => {
          gsap.ticker.remove(aoTick);
          lenis.destroy();
        };
      },
    );

    return () => {
      cancelado = true;
      destruir?.();
    };
  }, []);
}
