// Hidrômetro 3D real (GLB convertido do STEP, materiais já no arquivo).
// Carregado sob demanda; renderiza só quando o estado muda.
import {
  ACESFilmicToneMapping,
  Box3,
  Group,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { POSE, EXPLODE, DIST } from "./pose.js";

const MODEL_URL = "/models/hidrometro.glb";
MeshoptDecoder.useWorkers?.(2); // decodifica a malha fora da thread principal

export async function mountMeter(container, opts = {}) {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  container.appendChild(renderer.domElement);

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  const camera = new PerspectiveCamera(POSE.fov, 1, 0.1, 60);
  const camDir = new Vector3(...(opts.camera || POSE.camera)).normalize();
  const target = new Vector3(...(opts.target || POSE.target));

  const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(MODEL_URL);
  const model = gltf.scene;
  const parts = [];
  model.traverse((o) => {
    if (o.isMesh && o.material.transparent) o.material.depthWrite = false;
    if (EXPLODE[o.name]) parts.push({ obj: o, base: o.position.clone(), off: new Vector3(...EXPLODE[o.name]) });
  });
  // centra pelo corpo (sem a tampa aberta), para o giro ficar no eixo do medidor
  const box = new Box3();
  model.traverse((o) => { if (o.isMesh && o.name !== "Tampa") box.expandByObject(o); });
  const center = box.getCenter(new Vector3());
  model.position.sub(center);

  const turntable = new Group();
  turntable.scale.setScalar(POSE.scale);
  turntable.add(model);
  scene.add(turntable);

  // compila os shaders sem bloquear (KHR_parallel_shader_compile quando houver)
  if (renderer.compileAsync) await renderer.compileAsync(scene, camera);

  let aspect = 1;
  const state = { yaw: POSE.yawStart, explode: 0, lift: 0 };

  function apply() {
    turntable.rotation.y = state.yaw;
    const e = state.explode;
    for (const p of parts) p.obj.position.copy(p.base).addScaledVector(p.off, e);
    // a vista explodida cresce para cima: recua a câmera e sobe o alvo
    const dist = opts.dist ?? DIST.closed + (DIST.open - DIST.closed) * e;
    const t = target.clone().add(new Vector3(0, 0.42 * e + state.lift, 0));
    camera.position.copy(t).addScaledVector(camDir, dist);
    camera.lookAt(t);
    // em telas estreitas, recua para o medidor caber na largura (8% maior que o encaixe exato, sem cortar a tampa)
    camera.zoom = aspect < 1 ? Math.min(1, Math.max(aspect * 1.08, 0.55)) : 1;
    camera.updateProjectionMatrix();
  }

  function render() {
    apply();
    renderer.render(scene, camera);
  }

  function resize() {
    const { clientWidth: w, clientHeight: h } = container;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    aspect = w / h;
    camera.aspect = aspect;
    render();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  return {
    state,
    render,
    // move o estado em direção ao alvo com inércia; devolve true enquanto se move
    ease(goal, k = 0.1) {
      let moving = false;
      for (const key of Object.keys(goal)) {
        const d = goal[key] - state[key];
        if (Math.abs(d) > 0.0004) { state[key] += d * k; moving = true; } else state[key] = goal[key];
      }
      render();
      return moving;
    },
  };
}
