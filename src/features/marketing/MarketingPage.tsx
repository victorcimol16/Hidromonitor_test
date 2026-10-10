import { Hero } from "./components/Hero";
import { Problema } from "./components/Problema";
import { HidrometroShowcase } from "./three/HidrometroShowcase";
import { ComoFunciona } from "./components/ComoFunciona";
import { Beneficios } from "./components/Beneficios";
import { CtaFinal } from "./components/CtaFinal";
import { SiteFooter } from "./components/SiteFooter";
import { useSmoothScroll } from "./lib/useSmoothScroll";

/**
 * Landing do HidroMonitor (reconstrução).
 *
 * Ritmo profundo/claro alternado: Hero (água) → O problema (claro) → A solução
 * (profundo) → Como funciona (claro) → Benefícios (claro tingido) → Chamada
 * final (profundo) → rodapé. Âmbar reservado aos CTAs e à linha do rateio.
 */
export function MarketingPage() {
  useSmoothScroll();

  return (
    <div className="relative min-h-screen overflow-x-clip bg-background">
      <Hero />
      <main>
        <Problema />
        <HidrometroShowcase variant="brass" />
        <ComoFunciona />
        <Beneficios />
        <CtaFinal />
      </main>
      <SiteFooter />
    </div>
  );
}
