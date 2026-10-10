import { createFileRoute } from "@tanstack/react-router";
// Página estática de "Dúvidas e Sugestões" — servida na mesma origem do app,
// na URL /sugestao. O HTML é importado como texto; a logo fica em
// public/sugestao/logo-simbolo.png (referenciada de forma absoluta no HTML).
import suggestionsHtml from "@/features/suggestions/index.html?raw";

export const Route = createFileRoute("/sugestao")({
  server: {
    handlers: {
      GET: () =>
        new Response(suggestionsHtml, {
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
    },
  },
});
