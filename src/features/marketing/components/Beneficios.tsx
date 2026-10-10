import { useEffect, useRef } from "react";

import { loadGsap } from "../lib/gsap";
import { prefersReducedMotion } from "../lib/media";

/**
 * Capítulo 5 — Benefícios.
 *
 * Uma ideia: medir é só o começo; o valor está em enxergar o consumo e agir.
 * Um único efeito: os cartões sobem em sequência ao entrar na seção.
 */

const BENEFICIOS = [
  {
    titulo: "Aproveita o que já está instalado",
    descricao:
      "Boa parte dos condomínios já tem hidrômetros compatíveis. Quando é o caso, nada precisa ser trocado.",
  },
  {
    titulo: "Consumo real de cada unidade",
    descricao:
      "O rateio deixa de ser estimativa. Cada apartamento passa a ter a própria leitura, com histórico para contestação.",
  },
  {
    titulo: "Vazamento aparece antes da fatura",
    descricao:
      "O sistema avisa quando o consumo foge do padrão, dando tempo de agir antes que o prejuízo chegue ao boleto.",
  },
  {
    titulo: "Fim da leitura manual",
    descricao:
      "Sem visita porta a porta, sem planilha e sem erro de digitação. Os dados chegam sozinhos à plataforma.",
  },
  {
    titulo: "Números prontos para a assembleia",
    descricao:
      "Consumo por bloco e por unidade, organizado e fácil de apresentar para o corpo diretivo e os moradores.",
  },
  {
    titulo: "Feche a água sem sair do lugar",
    descricao:
      "A válvula no ponto de medição corta o fornecimento de uma unidade à distância. Vazamento de madrugada não espera o encanador.",
  },
];

export function Beneficios() {
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
        gsap.set(".js-benef", { opacity: 0, y: 28 });
        gsap.to(".js-benef", {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.09,
          scrollTrigger: { trigger: section, start: "top 72%", once: true },
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
      id="beneficios"
      className="relative bg-secondary/40 py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Benefícios
          </p>
          <h2 className="text-[clamp(1.9rem,3.6vw,3rem)] font-bold leading-[1.1] tracking-[-0.02em] text-foreground">
            O problema não é medir. É enxergar o que foi medido.
          </h2>
          <p className="mt-5 text-[clamp(1rem,1.5vw,1.2rem)] leading-relaxed text-muted-foreground">
            O HidroMonitor coleta, organiza e mostra o consumo de água do
            condomínio — para a gestão parar de trabalhar com achismo.
          </p>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFICIOS.map((b) => (
            <div
              key={b.titulo}
              className="js-benef rounded-2xl border border-border bg-card p-6 transition-transform duration-300 hover:-translate-y-1"
            >
              <h3 className="font-display text-lg font-semibold text-primary">
                {b.titulo}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {b.descricao}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
