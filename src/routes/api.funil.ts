import { createFileRoute } from "@tanstack/react-router";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  localDaRequisicao,
  texto,
  inteiro,
  decimal,
  dentreOpcoes,
  respostaOk,
  TIPOS_APARELHO,
} from "@/lib/funil/servidor";

/**
 * Registra as etapas A (acesso) e B (início de preenchimento) do funil.
 *
 * A página de sugestões não fala com o Supabase: ela chama este endpoint, que
 * grava com a chave de serviço. Assim nenhuma credencial vai para o navegador
 * e o papel `anon` continua sem permissão alguma no banco.
 *
 * Este endpoint NUNCA devolve erro ao cliente. Se a gravação falhar, o log fica
 * no servidor e a resposta segue 200 — medir o funil jamais pode atrapalhar
 * quem está tentando mandar uma sugestão.
 */

/** Uma visita só pode ser alterada durante esta janela após ser criada. */
const JANELA_DE_ESCRITA_MS = 12 * 60 * 60 * 1000;

export const Route = createFileRoute("/api/funil")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const corpo = (await request.json()) as Record<string, unknown>;
          const idSessao = texto(corpo.id_sessao, 80);
          if (!idSessao) return respostaOk({ ignorado: "sem id de sessão" });

          // types.ts é gerado pelo Supabase e ainda não conhece estas tabelas,
          // então usamos o cliente sem tipagem aqui.
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const db = supabaseAdmin as unknown as SupabaseClient;

          if (corpo.acao === "interacao") {
            // Etapa B: só marca a primeira vez, e só em visita recente. O limite
            // é calculado aqui porque o PostgREST compara com o valor literal —
            // uma expressão SQL como `now() - interval '12h'` não é avaliada.
            const agora = new Date();
            const limite = new Date(agora.getTime() - JANELA_DE_ESCRITA_MS).toISOString();

            await db
              .from("visitas")
              .update({ iniciou_em: agora.toISOString(), atualizado_em: agora.toISOString() })
              .eq("id_sessao", idSessao)
              .is("iniciou_em", null)
              .gt("criado_em", limite);
            return respostaOk();
          }

          // Etapa A: uma linha por aba. Recarregar a página reaproveita a linha
          // existente porque id_sessao é único e o conflito é ignorado.
          const local = localDaRequisicao(request);

          await db.from("visitas").upsert(
            {
              id_sessao: idSessao,
              id_dispositivo: texto(corpo.id_dispositivo, 80),

              origem: texto(corpo.origem, 60),
              utm_campaign: texto(corpo.utm_campaign, 120),
              referrer: texto(corpo.referrer, 300),

              tipo_aparelho: dentreOpcoes(corpo.tipo_aparelho, TIPOS_APARELHO),
              sistema: texto(corpo.sistema, 40),
              navegador: texto(corpo.navegador, 40),
              user_agent: texto(corpo.user_agent, 400),

              tela_largura: inteiro(corpo.tela_largura, 0, 20000),
              tela_altura: inteiro(corpo.tela_altura, 0, 20000),
              viewport_largura: inteiro(corpo.viewport_largura, 0, 20000),
              viewport_altura: inteiro(corpo.viewport_altura, 0, 20000),
              pixel_ratio: decimal(corpo.pixel_ratio, 0, 10),

              cpu_nucleos: inteiro(corpo.cpu_nucleos, 0, 512),
              memoria_gb: decimal(corpo.memoria_gb, 0, 1024),
              conexao: texto(corpo.conexao, 20),

              idioma: texto(corpo.idioma, 20),
              fuso: texto(corpo.fuso, 60),

              ...local,
            },
            { onConflict: "id_sessao", ignoreDuplicates: true },
          );

          return respostaOk();
        } catch (erro) {
          console.error("[funil] falha ao registrar visita", erro);
          return respostaOk({ registrado: false });
        }
      },
    },
  },
});
