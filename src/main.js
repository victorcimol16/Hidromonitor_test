import "@fontsource/outfit/latin-300.css";
import "@fontsource/outfit/latin-700.css";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-600.css";
import "./styles.css";
import { setupMotion } from "./motion.js";
import { setupTabs, setupWaves } from "./sections.js";

const params = new URLSearchParams(location.search);
const reduced = !document.documentElement.classList.contains("motion");

// Só liga o 3D com GPU de verdade: WebGL por software trava a aba.
// O teste roda num worker para não bloquear a thread principal.
function hasFastWebGL() {
  if (params.get("3d") === "force") return Promise.resolve(true);
  if (params.get("3d") === "off" || typeof OffscreenCanvas === "undefined") return Promise.resolve(false);
  return new Promise((resolve) => {
    const worker = new Worker(new URL("./gpu-worker.js", import.meta.url), { type: "module" });
    const done = (ok) => { worker.terminate(); resolve(ok); };
    const timer = setTimeout(() => done(false), 4000); // demorou = é software
    worker.onmessage = ({ data }) => {
      clearTimeout(timer);
      done(data !== "none" && !/swiftshader|basic render|llvmpipe|software/i.test(data));
    };
    worker.onerror = () => { clearTimeout(timer); done(false); };
    worker.postMessage(0);
  });
}

const meter = { api: null };

if (params.has("poster")) {
  // Modo poster (só para scripts/poster.mjs): renderiza um estado e sinaliza.
  const root = document.documentElement;
  root.classList.add("poster-mode");
  root.style.setProperty("--pw", `${params.get("w") || 1400}px`);
  root.style.setProperty("--ph", `${params.get("h") || 1400}px`);
  const box = document.createElement("div");
  box.className = "poster-box";
  document.body.append(box);
  import("./meter3d.js")
    .then(({ mountMeter }) => {
      const vec = (k) => params.get(k)?.split(",").map(Number);
      return mountMeter(box, { camera: vec("cam"), target: vec("target"), dist: params.has("dist") ? Number(params.get("dist")) : undefined });
    })
    .then((api) => {
      for (const k of ["yaw", "explode", "lift"]) if (params.has(k)) api.state[k] = Number(params.get(k));
      api.render();
      window.__posterReady = true;
    });
} else {
  const visual = document.querySelector(".show-visual");
  if (visual && !reduced) hasFastWebGL().then((fast) => fast && mount3d(visual));
  setupWaves();
  setupTabs();
  setupMotion({ reduced, meter });
}

// O poster já mostra a pose inicial; o 3D (pesado de montar) só carrega na
// primeira interação, para não travar o carregamento da página.
function mount3d(visual) {
  const events = ["pointermove", "pointerdown", "wheel", "touchstart", "keydown", "scroll"];
  const start = async () => {
    events.forEach((e) => removeEventListener(e, start));
    try {
      const { mountMeter } = await import("./meter3d.js");
      meter.api = await mountMeter(visual.querySelector(".canvas-box"));
      visual.classList.add("is-live");
    } catch (err) {
      console.warn("Hidrômetro 3D indisponível, mantendo os posters.", err);
    }
  };
  events.forEach((e) => addEventListener(e, start, { once: true, passive: true }));
}
