// Interações das seções: simulador de rateio e abas do painel.

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

// aceita "4.800,00", "4800,5", "4800.50" e "240"
function parseNumber(raw) {
  let t = String(raw).trim().replace(/\s|R\$/g, "");
  if (!t) return NaN;
  if (t.includes(",")) t = t.replace(/\./g, "").replace(",", ".");
  else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, "");
  return /^\d*\.?\d+$/.test(t) ? Number(t) : NaN;
}

export function setupSimulator() {
  const form = document.getElementById("simulador");
  if (!form) return;
  const out = (k) => document.querySelector(`[data-out="${k}"]`);
  const bar = (k) => document.querySelector(`[data-bar="${k}"]`);

  const rules = {
    total: (v) => (v > 0 ? "" : "Informe um valor maior que zero."),
    unidades: (v) => (Number.isInteger(v) && v >= 2 ? "" : "Informe um número inteiro, a partir de 2."),
    predio: (v) => (v > 0 ? "" : "Informe o consumo em m³, maior que zero."),
    unidade: (v, all) =>
      !(v >= 0) ? "Informe o consumo em m³." : v > all.predio ? "Não pode ser maior que o consumo do prédio." : "",
  };

  function update() {
    const values = {};
    for (const name of Object.keys(rules)) values[name] = parseNumber(form.elements[name].value);
    let ok = true;
    for (const [name, rule] of Object.entries(rules)) {
      const msg = rule(values[name], values);
      const input = form.elements[name];
      input.closest(".field").classList.toggle("has-error", Boolean(msg));
      input.setAttribute("aria-invalid", msg ? "true" : "false");
      document.getElementById(`${input.id}-err`).textContent = msg;
      if (msg) ok = false;
    }
    if (!ok) {
      out("diff").textContent = "Corrija os campos marcados para ver o resultado.";
      return;
    }
    const igual = values.total / values.unidades;
    const justo = values.total * (values.unidade / values.predio);
    out("igual").textContent = brl.format(igual);
    out("justo").textContent = brl.format(justo);
    const max = Math.max(igual, justo) || 1;
    bar("igual").style.setProperty("--w", `${(igual / max) * 100}%`);
    bar("justo").style.setProperty("--w", `${(justo / max) * 100}%`);
    const d = igual - justo;
    out("diff").textContent =
      Math.abs(d) < 0.005
        ? "Nesse caso, os dois jeitos dão o mesmo valor."
        : d > 0
          ? `Você pagaria ${brl.format(d)} a menos por mês.`
          : `Você pagaria ${brl.format(-d)} a mais por mês, porque usa mais que a média.`;
  }

  form.addEventListener("input", update);
  form.addEventListener("submit", (e) => { e.preventDefault(); update(); });
  update();
}

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
