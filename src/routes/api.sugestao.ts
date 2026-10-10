import { createFileRoute } from "@tanstack/react-router";
import type { SupabaseClient } from "@supabase/supabase-js";
import { texto, respostaOk } from "@/lib/funil/servidor";

/**
 * Etapa C do funil: guarda a sugestão e marca a visita como "enviou".
 *
 * O e-mail de aviso e o link do WhatsApp continuam saindo do navegador, exatamente
 * como antes — este endpoint é um acréscimo, não uma substituição. Se ele falhar,
 * a pessoa não percebe nada e a mensagem chega do mesmo jeito pelos dois canais
 * antigos. Por isso a resposta é sempre 200.
 */

/** Só aceita marcar envio em visita criada dentro desta janela. */
const JANELA_DE_ESCRITA_MS = 12 * 60 * 60 * 1000;

export const Route = createFileRoute("/api/sugestao")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const corpo = (await request.json()) as Record<string, unknown>;

          const nome = texto(corpo.nome, 120);
          const telefone = texto(corpo.telefone, 40);
          const mensagem = texto(corpo.mensagem, 4000);
          const email = texto(corpo.email, 160); // opcional
          const idSessao = texto(corpo.id_sessao, 80);

          // Mesma regra da tela: nome, telefone e mensagem são obrigatórios.
          if (!nome || !telefone || !mensagem) {
            return respostaOk({ gravado: false, motivo: "campos obrigatórios ausentes" });
          }

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const db = supabaseAdmin as unknown as SupabaseClient;

          // Vincula à visita, quando ela existe e ainda está na janela.
          const agora = new Date();
          const limite = new Date(agora.getTime() - JANELA_DE_ESCRITA_MS).toISOString();

          let visitaId: string | null = null;
          if (idSessao) {
            const { data } = await db
              .from("visitas")
              .select("id")
              .eq("id_sessao", idSessao)
              .gt("criado_em", limite)
              .maybeSingle();
            visitaId = (data as { id?: string } | null)?.id ?? null;
          }

          const { error } = await db
            .from("sugestoes")
            .insert({ visita_id: visitaId, nome, telefone, email, mensagem });

          if (error) {
            console.error("[funil] falha ao gravar sugestão", error);
            return respostaOk({ gravado: false });
          }

          if (visitaId) {
            await db
              .from("visitas")
              .update({ enviou_em: agora.toISOString(), atualizado_em: agora.toISOString() })
              .eq("id", visitaId)
              .is("enviou_em", null);
          }

          return respostaOk({ gravado: true });
        } catch (erro) {
          console.error("[funil] erro no endpoint de sugestão", erro);
          return respostaOk({ gravado: false });
        }
      },
    },
  },
});
