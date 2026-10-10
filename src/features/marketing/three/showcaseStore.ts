/**
 * Ponte entre o scroll (GSAP ScrollTrigger, no DOM) e o loop de render do R3F
 * (useFrame). O ScrollTrigger escreve o progresso aqui; a cena 3D lê e interpola
 * (inércia) a cada frame. É um singleton simples de propósito — há uma única
 * vitrine 3D por vez.
 */
export type ShowcaseProgress = {
  /** 0→1 ao longo de toda a seção da vitrine. */
  overall: number;
};

const state: ShowcaseProgress = { overall: 0 };

export function setShowcaseProgress(v: number) {
  state.overall = v;
}

export function getShowcaseProgress(): ShowcaseProgress {
  return state;
}
