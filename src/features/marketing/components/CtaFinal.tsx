import { useEffect, useRef } from "react";

import { WHATSAPP_URL } from "@/lib/brand";
import { loadGsap } from "../lib/gsap";
import { prefersReducedMotion } from "../lib/media";

/**
 * Capítulo 6 — Chamada final.
 *
 * Uma ideia: descobrir, hoje e sem compromisso, se o condomínio já está pronto.
 * Um único efeito: o conteúdo sobe ao entrar. O botão âmbar é o único ponto
 * quente da seção.
 */
export function CtaFinal() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (prefersReducedMotion()) return;

    let ctx: { revert: () => void } | null = null;
    let cancelado = false;

    loadGsap().then(({ gsap }) => {
      if (cancelado) return;
      ctx = gsap.context(() => {
        gsap.set(".js-cta", { opacity: 0, y: 26 });
        gsap.to(".js-cta", {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power2.out",
          stagger: 0.12,
          scrollTrigger: { trigger: section, start: "top 75%", once: true },
        });
      }, section);
    });

    return () => {
      cancelado = true;
      ctx?.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-deep py-28 text-deep-foreground md:py-36"
    >
      {/* Brilho âmbar suave atrás do CTA, ancorando o ponto quente da seção. */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,191,82,0.18), transparent 70%)" }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <h2 className="js-cta text-[clamp(2rem,4.2vw,3.5rem)] font-bold leading-[1.08] tracking-[-0.02em]">
          Descubra hoje se o seu condomínio já está pronto.
        </h2>
        <p className="js-cta mx-auto mt-5 max-w-[52ch] text-[clamp(1rem,1.6vw,1.25rem)] leading-relaxed text-deep-foreground/70">
          A verificação é rápida e sem compromisso. Se os hidrômetros já forem
          compatíveis, é só conectar. Se não forem, nossas parcerias resolvem a
          troca para você.
        </p>
        <a
          href={WHATSAPP_URL}
          className="js-cta mt-10 inline-block rounded-full bg-accent px-9 py-4 font-semibold text-accent-foreground shadow-[0_14px_44px_-8px_rgba(255,191,82,0.55)] transition-transform duration-300 hover:scale-105"
        >
          Falar com um especialista no WhatsApp
        </a>
      </div>
    </section>
  );
}
