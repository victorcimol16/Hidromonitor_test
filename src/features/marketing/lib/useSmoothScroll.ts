import { useEffect } from "react";
import type Lenis from "lenis";

import { loadGsap } from "./gsap";
import { prefersReducedMotion } from "./media";

/** Instância ativa do Lenis (null no SSR, em reduced-motion ou antes de carregar). */
let lenisAtivo: Lenis | null = null;

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
      ([{ default: LenisCtor }, { gsap, ScrollTrigger }]) => {
        if (cancelado) return;

        const lenis = new LenisCtor({ lerp: 0.08, smoothWheel: true });
        lenisAtivo = lenis;

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
          lenisAtivo = null;
        };
      },
    );

    return () => {
      cancelado = true;
      destruir?.();
    };
  }, []);
}

/**
 * Leva o leitor até a seção `id` e move o foco para ela (teclado e leitor de
 * tela continuam a partir dali). Usa o Lenis quando ativo; senão, a rolagem
 * nativa — instantânea em reduced-motion.
 */
export function scrollToSection(id: string) {
  const alvo = document.getElementById(id);
  if (!alvo) return;

  const focar = () => {
    if (!alvo.hasAttribute("tabindex")) alvo.setAttribute("tabindex", "-1");
    alvo.focus({ preventScroll: true });
  };

  if (lenisAtivo) {
    lenisAtivo.scrollTo(alvo, { onComplete: focar });
  } else {
    alvo.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
    focar();
  }
  history.replaceState(null, "", `#${id}`);
}
