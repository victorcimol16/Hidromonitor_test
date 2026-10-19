// Camada de movimento: Lenis + GSAP/ScrollTrigger. O HTML/CSS sem a classe
// `motion` já é a página completa e legível; aqui só conduzimos a sequência.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { POSE } from "./pose.js";

// cede a thread principal entre etapas pesadas (evita uma tarefa longa no carregamento)
const yieldToMain = () => new Promise((r) => setTimeout(r, 0));

function focusTarget(el) {
  if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
}

export async function setupMotion({ reduced, meter }) {
  let lenis = null;
  if (!reduced) {
    gsap.registerPlugin(ScrollTrigger);
    await yieldToMain();
    lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Âncoras internas: rolam (via Lenis quando ativo) e movem o foco.
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href").slice(1);
    const target = id && document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    history.pushState(null, "", `#${id}`);
    // posição absoluta calculada aqui (o Lenis pode estar defasado da rolagem nativa)
    const y = target.getBoundingClientRect().top + window.scrollY;
    if (lenis) lenis.scrollTo(y, { duration: 1.1, force: true });
    else target.scrollIntoView();
    focusTarget(target);
  });

  if (reduced) return;
  await yieldToMain();
  setupShow(meter);
  await yieldToMain();
  setupEntrances();
  await yieldToMain();
  setupBand();
}

// Faixa de nomes: anda com a rolagem (nunca sozinha), da direita para a esquerda.
function setupBand() {
  const track = document.querySelector(".band-track");
  if (!track) return;
  gsap.fromTo(
    track,
    { xPercent: 0 },
    {
      xPercent: -35,
      ease: "none",
      scrollTrigger: { trigger: ".band", start: "top bottom", end: "bottom top", scrub: 0.6 },
    },
  );
}

// Entrada das partes de cada seção: sobem 24px com opacidade, uma vez.
// O CSS já deixa tudo visível; sem JS nada fica escondido.
function setupEntrances() {
  const groups = new Map();
  for (const el of document.querySelectorAll("[data-enter]")) {
    const section = el.closest("section, footer");
    if (!groups.has(section)) groups.set(section, []);
    groups.get(section).push(el);
  }
  for (const [section, els] of groups) {
    // só opacidade (sem visibility): continua alcançável pelo teclado
    gsap.set(els, { opacity: 0, y: 28 });
    let shown = false;
    const reveal = () => {
      if (shown) return;
      shown = true;
      gsap.to(els, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.08 });
    };
    ScrollTrigger.create({ trigger: section, start: "top 78%", once: true, onEnter: reveal });
    section.addEventListener("focusin", reveal, { once: true });
  }
}

// Sequência do hero: apresenta → gira → abre em peças → fecha → conclui.
function setupShow(meter) {
  const show = document.querySelector(".show");
  if (!show) return;

  // estado do 3D conduzido pelo scroll; o ticker aplica com inércia
  const goal = { yaw: POSE.yawStart, explode: 0 };
  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: { trigger: show, start: "top top", end: "bottom bottom", scrub: true },
  });
  const intro = show.querySelectorAll('[data-beat="intro"]');
  const callouts = show.querySelectorAll(".callouts li");

  tl.to(goal, { yaw: POSE.yawEnd, duration: 1 }, 0)
    .to(intro, { autoAlpha: 0, y: -24, duration: 0.1 }, 0.1)
    .to(".giant", { autoAlpha: 0, scale: 0.92, duration: 0.14 }, 0.12)
    .to(goal, { explode: 1, duration: 0.26 }, 0.24)
    .to(".poster-closed", { autoAlpha: 0, duration: 0.12 }, 0.3)
    .to(".poster-open", { autoAlpha: 1, duration: 0.12 }, 0.3)
    .fromTo(callouts, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.05, stagger: 0.02 }, 0.42)
    .to(callouts, { autoAlpha: 0, y: -16, duration: 0.06, stagger: 0.015 }, 0.68)
    .to(goal, { explode: 0, duration: 0.18 }, 0.72)
    .to(".poster-open", { autoAlpha: 0, duration: 0.1 }, 0.76)
    .to(".poster-closed", { autoAlpha: 1, duration: 0.1 }, 0.76)
    .fromTo(".show-outro", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.08 }, 0.88);

  // o 3D só renderiza enquanto a seção está na tela e há movimento
  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(show);
  let moving = true;
  let last = "";
  gsap.ticker.add(() => {
    if (!meter.api || !visible || document.hidden) return;
    const key = `${goal.yaw.toFixed(4)}|${goal.explode.toFixed(4)}`;
    if (!moving && key === last) return;
    last = key;
    moving = meter.api.ease(goal, 0.1);
  });
}
