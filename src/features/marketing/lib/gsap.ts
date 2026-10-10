/**
 * Carregamento sob demanda do GSAP + ScrollTrigger.
 *
 * `import()` dinâmico de propósito: mantém o GSAP fora do bundle do servidor
 * (SSR) e só baixa a biblioteca quando uma seção realmente precisa animar.
 * Chame dentro de um `useEffect` e aguarde o resultado; limpe com `ctx.revert()`.
 */

type GsapBundle = {
  gsap: typeof import("gsap").gsap;
  ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger;
};

// Memoiza: várias seções chamam, mas a biblioteca baixa uma única vez.
let promessa: Promise<GsapBundle> | null = null;

export function loadGsap(): Promise<GsapBundle> {
  if (!promessa) {
    promessa = Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        gsap.registerPlugin(ScrollTrigger);
        return { gsap, ScrollTrigger };
      },
    );
  }
  return promessa;
}
