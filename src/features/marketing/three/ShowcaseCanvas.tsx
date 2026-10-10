import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import * as THREE from "three";

import { HidrometroShowcaseModel } from "./HidrometroShowcaseModel";
import { type BodyVariant } from "./hidrometroMaterials";

/**
 * Canvas da vitrine 3D (lazy-loaded). Mesma luz de estúdio da StudioScene, mas
 * sem OrbitControls — a câmera e o modelo são conduzidos pelo scroll
 * (HidrometroShowcaseModel). `mobile` reduz sombras e resolução.
 */
export default function ShowcaseCanvas({
  variant = "brass",
  mobile = false,
}: {
  variant?: BodyVariant;
  mobile?: boolean;
}) {
  return (
    <Canvas
      shadows={!mobile}
      dpr={mobile ? [1, 1.3] : [1, 1.75]}
      camera={{ position: [2.5, 2.3, 3.9], fov: 31 }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
        preserveDrawingBuffer: true,
      }}
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <color attach="background" args={["#000000"]} />

      <Suspense fallback={null}>
        <HidrometroShowcaseModel variant={variant} />

        {/* Iluminação branca e EVEN (sem environment, sem luz colorida): deixa
            as cores chapadas vibrantes, com só um leve gradiente para dar forma. */}
        <directionalLight
          position={[4, 6, 3]}
          intensity={1.5}
          castShadow={!mobile}
          shadow-mapSize={mobile ? 512 : 1024}
          shadow-bias={-0.0004}
        >
          <orthographicCamera attach="shadow-camera" args={[-2, 2, 2, -2, 0.1, 20]} />
        </directionalLight>
        {/* Fills brancos ao redor para envolver a forma uniformemente. */}
        <pointLight position={[0, 1, 5]} intensity={1.6} color="#ffffff" />
        <pointLight position={[-4, 2, 1]} intensity={1.0} color="#ffffff" />
        <pointLight position={[3, -1, 2]} intensity={0.8} color="#ffffff" />
        {/* Luz interna, junto ao registro, para acender o mostrador por dentro
            do corpo de vidro (distance curto p/ não lavar a cena toda). */}
        <pointLight position={[0, 0.25, 0.1]} intensity={2.2} distance={1.6} color="#ffffff" />
        <ambientLight intensity={0.7} />

        <ContactShadows
          position={[0, -0.85, 0]}
          opacity={0.55}
          scale={6}
          blur={2.6}
          far={3}
          resolution={mobile ? 384 : 640}
          color="#000000"
        />
      </Suspense>
    </Canvas>
  );
}
