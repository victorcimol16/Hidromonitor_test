// Interações das seções: abas do painel e ondas decorativas.

export function setupTabs() {
  const list = document.querySelector('.painel [role="tablist"]');
  if (!list) return;
  const tabs = [...list.querySelectorAll('[role="tab"]')];
  const fact = document.querySelector("[data-fact-out]");

  function select(tab, focus) {
    for (const t of tabs) {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute("aria-controls"));
      panel.hidden = !on;
      if (on) panel.animate?.([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: 300, easing: "ease-out" });
    }
    if (fact) fact.textContent = tab.dataset.fact;
    if (focus) tab.focus();
  }

  list.addEventListener("click", (e) => {
    const tab = e.target.closest('[role="tab"]');
    if (tab) select(tab, false);
  });
  list.addEventListener("keydown", (e) => {
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    const next = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    select(tabs[(next + tabs.length) % tabs.length], true);
  });
}

// Ondas decorativas: cada camada desenha dois períodos idênticos e desliza
// meio caminho (-50%) em loop, então a emenda nunca aparece.
const WAVE = {
  // [y da crista, y do vale, ondas por tela] num viewBox de 2400 × 100 (duas telas)
  path([top, bottom, perScreen], fill) {
    const mid = (top + bottom) / 2;
    const w = 1200 / perScreen; // largura de uma onda
    let d = `M0,${mid}`;
    for (let x = 0; x < 2400; x += w) {
      d += ` C${x + w / 6},${top} ${x + w / 3},${top} ${x + w / 2},${mid} S${x + (5 * w) / 6},${bottom} ${x + w},${mid}`;
    }
    return d + (fill ? " L2400,100 L0,100 Z" : "");
  },
  layers: {
    lines: [[20, 80, 2], [35, 65, 3], [8, 92, 1]],
    fill: [[0, 80, 2], [20, 95, 3]],
  },
};

export function setupWaves() {
  for (const el of document.querySelectorAll("[data-wave]")) {
    const kind = el.dataset.wave;
    const fill = kind !== "lines";
    el.innerHTML = WAVE.layers[fill ? "fill" : "lines"]
      .map((layer, i) => `<svg class="wave-layer wave-layer-${i + 1}" viewBox="0 0 2400 100" preserveAspectRatio="none" focusable="false"><path d="${WAVE.path(layer, fill)}" /></svg>`)
      .join("");
  }
}
