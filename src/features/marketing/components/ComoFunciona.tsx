import { useEffect, useRef } from "react";

import { loadGsap } from "../lib/gsap";
import { prefersReducedMotion } from "../lib/media";

/**
 * Capítulo 4 — Como funciona (3 passos).
 *
 * Uma ideia: da primeira conversa ao consumo na tela são três passos simples.
 * Um único efeito: os passos sobem e aparecem em sequência ao entrar na seção.
 */

const PASSOS = [
  {
    titulo: "Verificamos o seu condomínio",
    descricao:
      "Você nos diz onde fica e conferimos se os hidrômetros já estão prontos para conectar. Resposta rápida e sem compromisso.",
  },
  {
    titulo: "Conectamos o sistema",
    descricao:
      "A integração é feita em pouco tempo, sem quebra-quebra e sem interromper o abastecimento. Os dados seguem direto para a plataforma.",
  },
  {
    titulo: "Você acompanha pela plataforma",
    descricao:
      "Consumo por bloco e por unidade, alertas quando algo foge do padrão e histórico completo — no computador ou no celular.",
  },
];

export function ComoFunciona() {
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
        gsap.set(".js-passo", { opacity: 0, y: 32 });
        gsap.to(".js-passo", {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power2.out",
          stagger: 0.14,
          scrollTrigger: { trigger: section, start: "top 70%", once: true },
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
      id="como-funciona"
      className="relative bg-background py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Como funciona
          </p>
          <h2 className="text-[clamp(1.9rem,3.6vw,3rem)] font-bold leading-[1.1] tracking-[-0.02em] text-foreground">
            Simples assim: plugou, já tem os dados.
          </h2>
          <p className="mt-5 text-[clamp(1rem,1.5vw,1.2rem)] leading-relaxed text-muted-foreground">
            Três passos entre a primeira conversa e o consumo do condomínio na
            tela.
          </p>
        </div>

        <ol className="mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
          {PASSOS.map((passo, i) => (
            <li key={passo.titulo} className="js-passo">
              <span className="font-display text-[clamp(2.75rem,5vw,3.75rem)] font-bold leading-none text-primary/25">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-display text-xl font-semibold text-foreground">
                {passo.titulo}
              </h3>
              <p className="mt-2 max-w-[42ch] text-[0.95rem] leading-relaxed text-muted-foreground">
                {passo.descricao}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
