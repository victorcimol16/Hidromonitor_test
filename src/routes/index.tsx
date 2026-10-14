import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/features/marketing/MarketingPage";
import { INSTAGRAM_URL, WHATSAPP_NUMBER } from "@/lib/brand";

const TITULO = "HidroMonitor — Medição individualizada de água para condomínios";
const DESCRICAO =
  "Cada unidade paga pela água que usa. Medição individual com os hidrômetros do prédio ou medidores certificados pelo Inmetro, com leitura automática.";

// Dados estruturados só com dados reais (src/lib/brand.ts). Sem `url`/`logo`
// absolutos até o domínio de produção estar definido.
const ORGANIZACAO = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "HidroMonitor",
  sameAs: [INSTAGRAM_URL],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: `+${WHATSAPP_NUMBER}`,
    contactType: "sales",
    availableLanguage: "pt-BR",
  },
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITULO },
      { name: "description", content: DESCRICAO },
      { property: "og:title", content: TITULO },
      { property: "og:description", content: DESCRICAO },
      { name: "twitter:title", content: TITULO },
      { name: "twitter:description", content: DESCRICAO },
    ],
    links: [
      // Poster do quadro de água do hero (ver WaterScrub): recorte quadrado no
      // celular, paisagem a partir de 768px — mesmos `media` do <picture>.
      {
        rel: "preload",
        as: "image",
        href: "/video/agua-poster-mobile-720.webp",
        type: "image/webp",
        media: "(max-width: 767px)",
        fetchPriority: "high",
      },
      {
        rel: "preload",
        as: "image",
        href: "/video/agua-poster-960.webp",
        type: "image/webp",
        media: "(min-width: 768px)",
        fetchPriority: "high",
      },
    ],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(ORGANIZACAO) }],
  }),
  component: MarketingPage,
});
