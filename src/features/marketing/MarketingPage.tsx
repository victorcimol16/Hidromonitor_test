import { Hero } from "./components/Hero";
import { Nav } from "./components/Nav";
import { Problema } from "./components/Problema";
import { HidrometroShowcase } from "./three/HidrometroShowcase";
import { ComoFunciona } from "./components/ComoFunciona";
import { Comparativo } from "./components/Comparativo";
import { Contato } from "./components/Contato";
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
    <div className="landing relative min-h-screen overflow-x-clip bg-background">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:font-semibold focus:text-hm-primary-900"
      >
        Pular para o conteúdo
      </a>
      <header>
        <Nav />
      </header>
      <main id="conteudo">
        <Hero />
        <Problema />
        <HidrometroShowcase />
        <Comparativo />
        <ComoFunciona />
        <Contato />
      </main>
      <SiteFooter />
    </div>
  );
}
