import { test, expect } from "@playwright/test";

function watchConsole(page) {
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("response", (r) => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  return errors;
}

// rola até uma fração da seção (0..1) e espera o scrub assentar
async function scrollShow(page, frac) {
  await page.evaluate((f) => {
    const s = document.querySelector(".show");
    const top = s.getBoundingClientRect().top + scrollY;
    window.scrollTo(0, top + (s.offsetHeight - innerHeight) * f);
  }, frac);
  await page.waitForTimeout(900);
}

test("carrega sem erros e sem scroll horizontal", async ({ page }) => {
  const errors = watchConsole(page);
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  for (const f of [0.3, 0.6, 1]) await scrollShow(page, f);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  expect(errors).toEqual([]);
});

const SECTIONS = ["problema", "como-funciona", "beneficios", "conformidade", "painel", "duvidas", "contato"];

test("screenshots de cada seção (após a entrada animar)", async ({ page }, info) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  for (const [i, id] of SECTIONS.entries()) {
    const el = page.locator(`#${id}`);
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1900);
    // toda entrada animada terminou visível
    const hidden = await el.locator("[data-enter]").evaluateAll((els) => els.filter((e) => getComputedStyle(e).opacity !== "1").length);
    expect(hidden, `elementos invisíveis em #${id}`).toBe(0);
    await el.screenshot({ path: `shots/${info.project.name}-${String(i + 4).padStart(2, "0")}-${id}.png` });
  }
  const foot = page.locator(".foot");
  await foot.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await foot.screenshot({ path: `shots/${info.project.name}-11-rodape.png` });
});

test("abas do painel: clique e setas do teclado", async ({ page }) => {
  await page.goto("/");
  await page.locator("#tab-alerta").click();
  await expect(page.locator("#tela-alerta")).toBeVisible();
  await expect(page.locator("#tela-hoje")).toBeHidden();
  await expect(page.locator("[data-fact-out]")).toContainText("madrugada");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#tab-rateio")).toBeFocused();
  await expect(page.locator("#tab-rateio")).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#tab-hoje")).toBeFocused();
});

test("FAQ abre e fecha pelo teclado", async ({ page }) => {
  await page.goto("/");
  const first = page.locator(".faq summary").first();
  await first.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".faq details").first()).toHaveAttribute("open", "");
  await page.keyboard.press("Enter");
  await expect(page.locator(".faq details").first()).not.toHaveAttribute("open", "");
});

test("âncoras do rodapé levam à seção e movem o foco", async ({ page }) => {
  await page.goto("/");
  await page.locator('.foot a[href="#painel"]').click();
  await page.waitForTimeout(1500);
  await expect(page.locator("#painel")).toBeFocused();
  await expect(page.locator("#painel")).toBeInViewport();
});

test("faixa da conformidade anda com a rolagem, não sozinha", async ({ page }) => {
  await page.goto("/");
  const band = page.locator(".band");
  await band.scrollIntoViewIfNeeded();
  await page.waitForTimeout(3000); // Lenis + scrub assentam
  const a = await page.locator(".band-track").evaluate((e) => getComputedStyle(e).transform);
  await page.waitForTimeout(1200);
  const b = await page.locator(".band-track").evaluate((e) => getComputedStyle(e).transform);
  expect(b).toBe(a); // parada sem rolar
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(1200);
  const c = await page.locator(".band-track").evaluate((e) => getComputedStyle(e).transform);
  expect(c).not.toBe(b); // andou com a rolagem
});

test("um único h1 e headings em ordem", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveCount(1);
  const levels = await page.$$eval("h1,h2,h3,h4", (hs) => hs.map((h) => +h.tagName[1]));
  for (let i = 1; i < levels.length; i++) expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
});

test("sequência do hero: screenshots por etapa e animação dispara", async ({ page }, info) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const p = info.project.name;
  await page.screenshot({ path: `shots/${p}-01-hero.png` });
  await scrollShow(page, 0.55);
  await page.screenshot({ path: `shots/${p}-02-hero-aberto.png` });
  // na etapa aberta, as legendas aparecem e a introdução some
  await expect(page.locator(".callouts li").first()).toHaveCSS("opacity", "1");
  await expect(page.locator(".show-intro")).toHaveCSS("visibility", "hidden");
  await scrollShow(page, 0.97);
  await page.screenshot({ path: `shots/${p}-03-hero-fim.png` });
  await expect(page.locator(".show-outro")).toHaveCSS("opacity", "1");
});

test("links: nenhum vazio; externos abrem em nova aba com rel seguro", async ({ page }) => {
  await page.goto("/");
  const links = await page.$$eval("a", (as) => as.map((a) => ({ href: a.getAttribute("href"), target: a.target, rel: a.rel })));
  for (const l of links) {
    expect(l.href && l.href !== "#").toBeTruthy();
    if (/^https?:/.test(l.href)) { expect(l.target).toBe("_blank"); expect(l.rel).toContain("noopener"); }
  }
  const wa = await page.locator(".show-cta").getAttribute("href");
  expect(wa).toMatch(/^https:\/\/wa\.me\/5554992681225\?text=/);
});

test("teclado: pular para o conteúdo, marca e CTA em ordem", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator(".top .brand")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator(".top-cta")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator(".show-cta")).toBeFocused();
});

test("movimento reduzido: sem Lenis, sem sequência, tudo visível", async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  expect(await page.evaluate(() => document.documentElement.className)).not.toContain("motion");
  await expect(page.locator(".poster-closed")).toBeVisible();
  await expect(page.locator(".callouts li").first()).toBeVisible();
  await expect(page.locator(".show-outro")).toBeVisible();
  await expect(page.locator(".canvas-box canvas")).toHaveCount(0);
  // faixa parada: nada a desloca sem a camada de movimento
  expect(await page.locator(".band-track").evaluate((e) => getComputedStyle(e).transform)).toBe("none");
  await page.screenshot({ path: `shots/${info.project.name}-90-reduzido.png`, fullPage: true });
});

test("sem scroll horizontal de 360 a 1920px", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "roda uma vez");
  for (const width of [360, 412, 768, 1024, 1280, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(400);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `largura ${width}`).toBeLessThanOrEqual(0);
  }
});

test("3D real monta na primeira interação (forçado, sem GPU)", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "WebGL por software é lento; roda uma vez");
  test.setTimeout(120_000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("/?3d=force");
  await page.waitForLoadState("networkidle");
  await expect(page.locator(".canvas-box canvas")).toHaveCount(0); // nada antes de interagir
  await page.mouse.move(300, 300);
  await expect(page.locator(".show-visual")).toHaveClass(/is-live/, { timeout: 90_000 });
  await expect(page.locator(".canvas-box canvas")).toHaveCount(1);
  await page.screenshot({ path: "shots/desktop-12-hero-3d-real.png" });
  // com o 3D ativo nenhum poster estático pode aparecer atrás, em nenhuma etapa
  await page.evaluate(() => { const s = document.querySelector(".show"); window.scrollTo(0, s.offsetTop + (s.offsetHeight - innerHeight) * 0.5); });
  await page.waitForTimeout(2500);
  await expect(page.locator(".poster-open")).toBeHidden();
  await expect(page.locator(".poster-closed")).toBeHidden();
  await page.screenshot({ path: "shots/desktop-13-hero-3d-aberto.png" });
  expect(errors).toEqual([]);
});
