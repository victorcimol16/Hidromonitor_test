import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";

import { ALVO, CAMERA_INICIAL } from "./cena";
import { HidrometroShowcaseModel } from "./HidrometroShowcaseModel";

/**
 * Canvas da vitrine 3D (lazy-loaded). Fundo transparente: a cor vem da seção.
 *
 * Câmera e luzes são as MESMAS usadas para renderizar o poster estático
 * (/models/hidrometro-saga-poster.webp). Se mudar algo aqui, gere o poster de
 * novo, senão a troca poster → 3D fica visível.
 *
 * `ativo` liga/desliga o loop de render (seção fora da tela = zero trabalho).
 */
export default function ShowcaseCanvas({
  mobile = false,
  ativo = true,
  onReady,
}: {
  mobile?: boolean;
  ativo?: boolean;
  onReady?: () => void;
}) {
  return (
    <Canvas
      frameloop={ativo ? "always" : "never"}
      dpr={mobile ? [1, 1.5] : [1, 1.75]}
      camera={{ position: CAMERA_INICIAL, fov: 28 }}
      onCreated={({ camera }) => camera.lookAt(...ALVO)}
      gl={{
        antialias: true,
        alpha: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.25,
      }}
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <hemisphereLight args={["#e6eeff", "#1a2f55", 1.8]} />
      <directionalLight position={[3, 5, 4]} intensity={3.0} />
      {/* Contorno azul-claro: separa as peças pretas do fundo azul profundo. */}
      <directionalLight position={[-4, 3, -3]} intensity={3.2} color="#b8d4ff" />
      <directionalLight position={[-2, 1, 5]} intensity={0.9} />

      <Suspense fallback={null}>
        <HidrometroShowcaseModel onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
