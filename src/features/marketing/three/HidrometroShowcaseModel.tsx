import { useEffect, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import type * as THREE from "three";

import {
  ALTURA_POR_DIST,
  ALVO,
  DIST_FIM,
  DIST_INICIO,
  MODEL_URL,
  ROT_FIM,
  ROT_INICIO,
} from "./cena";
import { getShowcaseProgress } from "./showcaseStore";

/**
 * Hidrômetro residencial DN ¾″, convertido do STEP original (Inventor) para GLB:
 * Y para cima, giro no eixo do corpo, cores do CAD, malha comprimida (meshopt).
 *
 * Um único movimento ("mesa giratória"): conforme o scroll, o modelo gira de
 * ROT_INICIO a ROT_FIM (~83°) e a câmera se aproxima de DIST_INICIO a DIST_FIM,
 * com inércia. O mostrador fica visível o tempo todo e a tampa aberta não sai do
 * quadro em nenhum ponto. A pose inicial é a do poster estático
 * (/models/hidrometro-saga-poster.webp), para a troca poster → 3D não dar salto.
 */

const INERCIA = 0.08;

export function HidrometroShowcaseModel({ onReady }: { onReady?: () => void }) {
  // Sem Draco (o arquivo usa meshopt, cujo decoder já vem no bundle).
  const { scene } = useGLTF(MODEL_URL, false, true);
  const camera = useThree((s) => s.camera);
  const group = useRef<THREE.Group>(null);
  const atual = useRef(0); // progresso interpolado (0→1)

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  useFrame(() => {
    atual.current += (getShowcaseProgress().overall - atual.current) * INERCIA;
    const p = atual.current;

    if (group.current) group.current.rotation.y = ROT_INICIO + (ROT_FIM - ROT_INICIO) * p;

    const dist = DIST_INICIO + (DIST_FIM - DIST_INICIO) * p;
    camera.position.set(ALVO[0], dist * ALTURA_POR_DIST, dist);
    camera.lookAt(...ALVO);
  });

  return (
    <group ref={group} rotation={[0, ROT_INICIO, 0]}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload(MODEL_URL, false, true);
