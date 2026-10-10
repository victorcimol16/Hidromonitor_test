import { useEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import {
  flatMaterialFromMesh,
  ghostMaterialFromMesh,
  glassLensMaterial,
  groupForPart,
  isLensPart,
  isShellPart,
  type BodyVariant,
} from "./hidrometroMaterials";
import { getShowcaseProgress } from "./showcaseStore";

const MODEL_URL = "/models/hidrometro.glb";

type PartAnim = {
  mesh: THREE.Mesh;
  base: THREE.Vector3; // posição montada (parent space)
  dir: THREE.Vector3; // direção da explosão
  mag: number; // distância da explosão
};

// Suaviza 0→1 (ease in-out) para rampas de beat.
const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * Hidrômetro animado pelo scroll (Etapa 4). Lê o progresso (0→1) do store e, a
 * cada frame, interpola (inércia) três comportamentos encadeados:
 *   1. Surgir girando (escala + rotação ao emergir do escuro).
 *   2. Girar ~180° e aproximar (a câmera faz dolly).
 *   3. Explodir as peças e voltar a montar.
 */
export function HidrometroShowcaseModel({ variant }: { variant: BodyVariant }) {
  const { scene } = useGLTF(MODEL_URL);
  const group = useRef<THREE.Group>(null);
  const camera = useThree((s) => s.camera);

  const model = useMemo(() => scene.clone(true), [scene]);

  // Textura do mostrador (desenhada em canvas) aplicada num plano 3D no registro.
  const dialTexture = useMemo(() => createDialTexture(), []);
  const dialMat = useRef<THREE.MeshBasicMaterial>(null);

  // Valores interpolados (para inércia).
  const cur = useRef({ rotY: 0, explode: 0, emerge: 0, camZ: 3.9 });

  const parts = useRef<PartAnim[]>([]);

  useEffect(() => {
    const list: PartAnim[] = [];
    const criados: THREE.Material[] = [];
    let wheelIdx = 0;
    model.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      const g = groupForPart(obj.name); // só para a lógica de explosão (rodas)
      // Cor ORIGINAL da peça (fosca); a lente vira vidro transparente e o casco
      // externo vira semitransparente (cutaway) para revelar o mostrador dentro.
      const mat = isLensPart(obj.name)
        ? glassLensMaterial()
        : isShellPart(obj.name)
          ? ghostMaterialFromMesh(obj)
          : flatMaterialFromMesh(obj);
      obj.material = mat;
      criados.push(mat);
      obj.castShadow = true;
      obj.receiveShadow = true;


      // Centro geométrico da peça (coords do modelo, já centralizado na origem).
      obj.geometry.computeBoundingBox();
      const c = new THREE.Vector3();
      obj.geometry.boundingBox!.getCenter(c);

      let dir: THREE.Vector3;
      let mag: number;
      // Corpo de latão (anel do topo + rosca): peça única — sobe em destaque ao
      // abrir, levantando a rosca superior para fora do conjunto.
      if (obj.name === "SOLID_1") {
        dir = new THREE.Vector3(0, 1, 0);
        mag = 0.62;
      } else if (g === "wheels" || c.length() < 0.06) {
        // Peças centrais (rodas do totalizador): desempilham ao longo de Y.
        dir = new THREE.Vector3(0, 1, 0);
        mag = 0.14 + wheelIdx * 0.085;
        wheelIdx += 1;
      } else {
        dir = c.clone().normalize();
        mag = 0.2 + c.length() * 0.55;
      }
      list.push({ mesh: obj, base: obj.position.clone(), dir, mag });
    });
    parts.current = list;
    return () => criados.forEach((m) => m.dispose());
  }, [model]);

  useFrame(() => {
    const p = getShowcaseProgress().overall;

    // Alvos por beat.
    const emergeT = smoothstep(0.0, 0.18, p); // 0→1 ao surgir
    // Giro com ease-out: roda bastante no começo/produto e DESACELERA quase até
    // parar na explosão — assim as peças explodidas ficam legíveis (sem girar).
    const rotYT = (1 - Math.pow(1 - p, 3)) * Math.PI * 1.5; // ~270° total
    // Explosão: expande, SEGURA no pico (respiro) e remonta no fim.
    const expand = smoothstep(0.56, 0.74, p); // abre
    const rejoin = smoothstep(0.9, 1.0, p); // remonta só no finalzinho
    const explodeT = expand * (1 - rejoin);
    // Câmera: longe → perto (produto) → recua na explosão (mantém no quadro).
    const camZT = 3.9 - smoothstep(0.1, 0.5, p) * 1.35 + explodeT * 1.5;

    // Inércia (lerp exponencial) — um pouco mais suave.
    const k = 0.08;
    const c = cur.current;
    c.rotY += (rotYT - c.rotY) * k;
    c.explode += (explodeT - c.explode) * k;
    c.emerge += (emergeT - c.emerge) * k;
    c.camZ += (camZT - c.camZ) * k;

    if (group.current) {
      group.current.rotation.y = c.rotY;
      const s = (0.6 + c.emerge * 0.4) * 1.3; // surge 0.78→1.3
      group.current.scale.setScalar(s);
      group.current.position.y = (1 - c.emerge) * -0.5; // sobe ao surgir
      group.current.visible = c.emerge > 0.001;
    }

    // Explosão das peças.
    for (const pa of parts.current) {
      pa.mesh.position.set(
        pa.base.x + pa.dir.x * pa.mag * c.explode,
        pa.base.y + pa.dir.y * pa.mag * c.explode,
        pa.base.z + pa.dir.z * pa.mag * c.explode,
      );
    }

    // Dolly da câmera (mantém olhando um pouco acima do centro, compensando a
    // explosão que empurra peças para cima).
    camera.position.z += (c.camZ - camera.position.z) * k;
    camera.lookAt(0, 0.08 + c.explode * 0.12, 0);

    // Mostrador: visível montado; some conforme explode (as peças assumem).
    if (dialMat.current) {
      dialMat.current.opacity = c.emerge * (1 - Math.min(1, c.explode * 1.5));
    }
  });

  return (
    <group ref={group} rotation={[0, -0.5, 0]}>
      <primitive object={model} />

      {/* Mostrador como TEXTURA na superfície do registro: plano deitado (face
          para cima) fixo na peça — gira/inclina junto com o modelo e pega a
          perspectiva da câmera isométrica. */}
      <mesh
        position={[-0.01, 0.355, -0.15]}
        rotation={[-Math.PI / 2 - 0.122, 0, 3.054]}
        scale={0.52}
        renderOrder={5}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          ref={dialMat}
          map={dialTexture}
          transparent
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/** Desenha uma face de hidrômetro (odômetro + marca) numa textura de canvas. */
function createDialTexture(): THREE.CanvasTexture {
  const S = 512;
  const cv = document.createElement("canvas");
  cv.width = S;
  cv.height = S;
  const ctx = cv.getContext("2d")!;
  const cx = S / 2;
  const cy = S / 2;

  // Face branca com anel azul-marinho.
  ctx.beginPath();
  ctx.arc(cx, cy, 244, 0, Math.PI * 2);
  ctx.fillStyle = "#0b2a4a";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, 226, 0, Math.PI * 2);
  ctx.fillStyle = "#f4f7fb";
  ctx.fill();

  // Marcas de escala.
  ctx.strokeStyle = "#0b2a4a";
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2;
    const big = i % 5 === 0;
    const r1 = 214;
    const r2 = big ? 190 : 203;
    ctx.lineWidth = big ? 4 : 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
    ctx.stroke();
  }

  // Marca.
  ctx.fillStyle = "#1e4fa6";
  ctx.font = "bold 28px Inter, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("HidroMonitor", cx, cy - 118);

  // Janela do odômetro.
  const ow = 288;
  const oh = 86;
  const ox = cx - ow / 2;
  const oy = cy - oh / 2 + 58; // janela do odômetro mais para baixo na face
  ctx.fillStyle = "#0b1b2e";
  roundRect(ctx, ox, oy, ow, oh, 12);
  ctx.fill();

  const digits = ["0", "1", "4", "5", "3", "4"];
  const reds = [false, false, false, false, true, true];
  const pad = 8;
  const cw = (ow - pad * 2) / digits.length;
  for (let i = 0; i < digits.length; i++) {
    const dx = ox + pad + cw * i;
    ctx.fillStyle = reds[i] ? "#e5392b" : "#ffffff";
    roundRect(ctx, dx + 3, oy + 10, cw - 6, oh - 20, 6);
    ctx.fill();
    ctx.fillStyle = reds[i] ? "#ffffff" : "#0b1b2e";
    ctx.font = "bold 46px 'Space Grotesk', 'Courier New', monospace";
    ctx.fillText(digits[i], dx + cw / 2, oy + oh / 2 + 2);
  }

  // Unidade.
  ctx.fillStyle = "#0b2a4a";
  ctx.font = "bold 34px Inter, Arial, sans-serif";
  ctx.fillText("m³", cx, cy + 116);

  const tex = new THREE.CanvasTexture(cv);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

useGLTF.preload(MODEL_URL);
