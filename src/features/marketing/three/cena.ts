/**
 * Pose da vitrine 3D, compartilhada pelo canvas, pelo modelo e (manualmente)
 * pelo render do poster estático. Se mudar câmera/rotação inicial, gere o
 * poster de novo.
 */

export const MODEL_URL = "/models/hidrometro-saga.glb";

export const ROT_INICIO = 1.2;
export const ROT_FIM = -0.25;
export const DIST_INICIO = 7.0;
export const DIST_FIM = 6.5;
/** Câmera: altura proporcional à distância (mesmo ângulo de cima) e alvo. */
export const ALTURA_POR_DIST = 0.478;
export const ALVO: [number, number, number] = [0.45, -0.05, 0];
export const CAMERA_INICIAL: [number, number, number] = [
  ALVO[0],
  DIST_INICIO * ALTURA_POR_DIST,
  DIST_INICIO,
];
