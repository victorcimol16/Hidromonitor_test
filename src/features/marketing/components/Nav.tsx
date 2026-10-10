import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

import { LogoMark } from "@/components/brand/Logo";
import { BRAND_COLORS, WHATSAPP_URL } from "@/lib/brand";

/**
 * Barra fixa, discreta. Adapta-se ao fundo: vidro translúcido com texto claro
 * sobre o hero escuro; ao rolar para as seções claras, vira uma barra sólida
 * clara com texto escuro (padrão de páginas premium). Assim o contraste se
 * mantém em toda a página.
 */
export function Nav() {
  const [solid, setSolid] = useState(false);
  // Esconde a nav enquanto a vitrine imersiva do hidrômetro está em tela.
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        // Vira sólida quando o hero (quase 100svh) sai de baixo da nav.
        setSolid(window.scrollY > window.innerHeight - 90);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Observa a seção "A solução" (#o-produto): enquanto ela estiver visível, a
  // nav recolhe para cima; some até o usuário descer para fora da seção.
  useEffect(() => {
    const target = document.getElementById("o-produto");
    if (!target) return;
    const io = new IntersectionObserver(
      ([entry]) => setHidden(entry.isIntersecting),
      { threshold: 0, rootMargin: "-72px 0px 0px 0px" },
    );
    io.observe(target);
    return () => io.disconnect();
  }, []);

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-out ${
        hidden ? "pointer-events-none -translate-y-[140%] opacity-0" : "translate-y-0 opacity-100"
      }`}
      aria-hidden={hidden}
    >
      <div
        className={`mx-auto mt-3 flex w-[min(72rem,calc(100%-1.5rem))] items-center justify-between rounded-full border px-5 py-3 backdrop-blur-xl transition-colors duration-300 ${
          solid
            ? "border-border bg-background/90 shadow-[0_8px_30px_rgba(0,20,45,0.08)]"
            : "border-white/15 bg-white/10"
        }`}
      >
        <Link
          to="/"
          className="flex items-center gap-2.5 font-display text-xl font-semibold tracking-tight"
        >
          <LogoMark size={34} />
          <span style={{ fontFamily: "var(--font-sans)" }}>
            <span style={{ color: solid ? BRAND_COLORS.hidroOnLight : BRAND_COLORS.hidroOnDark }}>
              Hidro
            </span>
            <span style={{ color: solid ? "#008bcc" : BRAND_COLORS.monitor }}>Monitor</span>
          </span>
        </Link>
        <a
          href={WHATSAPP_URL}
          className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold transition-colors sm:px-5 ${
            solid
              ? "bg-[#1E4FA6] text-white hover:bg-[#1a4494]"
              : "border border-white/25 text-deep-foreground hover:bg-white/10"
          }`}
        >
          Contato
        </a>
      </div>
    </nav>
  );
}
