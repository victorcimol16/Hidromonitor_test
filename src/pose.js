// Pose, câmera e vista explodida compartilhadas entre o canvas e os posters.
// Mudou algo aqui? Gere os posters de novo (node scripts/poster.mjs).
export const POSE = {
  fov: 28,
  camera: [0, 1.05, 4.6], // direção da câmera; a distância vem de DIST
  target: [0, 0.02, 0],
  scale: 1.25,
  yawStart: 0.75,
  yawEnd: 0.75 + Math.PI * 2 - 0.5,
};

// Deslocamento de cada peça na vista explodida (unidades do modelo, Y para cima).
// Peças fora da lista ficam paradas.
export const EXPLODE = {
  Corpo: [0, -0.32, 0],
  Filtro_de_impurezas: [0, -0.32, 0.38],
  M6x_1: [-0.22, -0.32, 0],
  Topo_do_Hidrometro: [0, 0.1, 0],
  Corpo_interno: [0, 0.34, 0],
  Roda_1: [0, 0.52, 0], Roda_2: [0, 0.52, 0], Roda_3: [0, 0.52, 0], Roda_4: [0, 0.52, 0],
  Roda_5: [0, 0.52, 0], Roda_6: [0, 0.52, 0], Roda_7: [0, 0.52, 0],
  Adesivo: [0, 0.7, 0],
  Ponteiro: [0, 0.74, 0],
  Limiar: [0, 0.74, 0],
  Visor: [0, 0.9, 0],
  Espelho: [0, 1.04, 0],
  Tampa: [0.12, 1.2, 0],
};

// distância da câmera: montada x explodida
export const DIST = { closed: 4.7, open: 7.4 };
