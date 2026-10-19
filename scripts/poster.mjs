// Gera os posters do hidrômetro com a mesma pose/câmera do canvas (src/pose.js).
// Uso: npm run dev (porta 5173) e depois: node scripts/poster.mjs
import { chromium } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { POSE } from "../src/pose.js";

const FFMPEG = process.env.FFMPEG || "ffmpeg";
const ONLY = process.argv[2];
const SHOTS = [
  { name: "hidrometro-fechado", yaw: POSE.yawStart, explode: 0 },
  { name: "hidrometro-aberto", yaw: POSE.yawStart + 0.9, explode: 1 },
  // medidor inteiro visto de cima, dentro do círculo de "Benefícios"
  { name: "hidrometro-cima", yaw: 1.77, explode: 0, w: 1200, h: 1200, extra: "&cam=0.15,3,1.9&target=0,0.1,-0.12&dist=5.2" },
];
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
for (const s of SHOTS.filter((x) => !ONLY || x.name === ONLY)) {
  const w = s.w || 1400, h = s.h || 1400;
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto(`http://localhost:5173/?poster=1&3d=force&yaw=${s.yaw}&explode=${s.explode}&w=${w}&h=${h}${s.extra || ""}`);
  await page.waitForFunction(() => window.__posterReady === true, null, { timeout: 180000 });
  const png = `assets-src/${s.name}.png`;
  await page.locator(".poster-box canvas").screenshot({ path: png, omitBackground: true });
  execFileSync(FFMPEG, ["-loglevel", "error", "-y", "-i", png, "-c:v", "libwebp", "-quality", "80", `public/models/${s.name}.webp`]);
  console.log("ok", s.name);
  await page.close();
}
await browser.close();
