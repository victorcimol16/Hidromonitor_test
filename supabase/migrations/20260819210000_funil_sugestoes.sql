-- ============================================================================
-- Funil de acesso da página /sugestao + persistência das sugestões
--
-- Postura de segurança: o visitante anônimo NUNCA fala com o banco. A página
-- grava por /api/funil e /api/sugestao, que rodam no servidor com a chave de
-- serviço. Por isso o papel `anon` não recebe nenhuma permissão aqui — abrir o
-- código-fonte da página não dá acesso a nada.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Quem enxerga o painel. Sem linha nesta tabela, ninguém lê nada.
-- ---------------------------------------------------------------------------
CREATE TABLE public.painel_admins (
  email     text PRIMARY KEY,
  criado_em timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.painel_admins ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.painel_admins FROM anon;
GRANT SELECT ON public.painel_admins TO authenticated;
GRANT ALL    ON public.painel_admins TO service_role;

-- O usuário logado só enxerga a própria linha — serve para o painel descobrir
-- se ele tem acesso, sem revelar a lista inteira de administradores.
CREATE POLICY "admin vê a própria linha"
  ON public.painel_admins FOR SELECT TO authenticated
  USING (lower(email) = lower(auth.jwt() ->> 'email'));

-- SECURITY DEFINER para a checagem não cair na própria RLS acima (recursão).
CREATE OR REPLACE FUNCTION public.eh_admin_painel()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.painel_admins
    WHERE lower(email) = lower(auth.jwt() ->> 'email')
  );
$$;

-- ---------------------------------------------------------------------------
-- Etapa A/B/C do funil: uma linha por visita (aba do navegador)
-- ---------------------------------------------------------------------------
CREATE TABLE public.visitas (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- identificação do navegador (nunca do usuário)
  id_sessao      text NOT NULL UNIQUE,  -- sessionStorage: sobrevive ao F5, morre com a aba
  id_dispositivo text,                  -- localStorage: estimativa de pessoa única

  -- etapas do funil (a etapa A é a própria existência da linha)
  iniciou_em     timestamptz,           -- etapa B: focou/digitou em algum campo
  enviou_em      timestamptz,           -- etapa C: enviou a sugestão

  -- campanha
  origem         text,                  -- ?src= do QR code
  utm_campaign   text,
  referrer       text,

  -- aparelho (já classificado no cliente, não o user agent cru)
  tipo_aparelho  text,                  -- celular | tablet | computador
  sistema        text,                  -- Android | iOS | Windows | ...
  navegador      text,                  -- Chrome | Safari | ...
  user_agent     text,

  -- tela
  tela_largura      int,
  tela_altura       int,
  viewport_largura  int,
  viewport_altura   int,
  pixel_ratio       numeric(4,2),

  -- hardware (memoria_gb e conexao só existem em navegadores Chromium)
  cpu_nucleos    int,
  memoria_gb     numeric(5,2),
  conexao        text,

  -- contexto
  idioma         text,
  fuso           text,

  -- local, preenchido pelo servidor a partir dos cabeçalhos da Cloudflare
  ip_mascarado   text,                  -- último trecho zerado: 189.45.12.0
  cidade         text,
  pais           text,

  criado_em      timestamptz NOT NULL DEFAULT now(),
  atualizado_em  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.visitas ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.visitas FROM anon;
GRANT SELECT ON public.visitas TO authenticated;
GRANT ALL    ON public.visitas TO service_role;

CREATE POLICY "somente admin do painel lê visitas"
  ON public.visitas FOR SELECT TO authenticated
  USING (public.eh_admin_painel());

CREATE INDEX visitas_criado_em_idx    ON public.visitas (criado_em DESC);
CREATE INDEX visitas_id_sessao_idx    ON public.visitas (id_sessao);
CREATE INDEX visitas_origem_idx       ON public.visitas (origem);

-- ---------------------------------------------------------------------------
-- Sugestões enviadas
-- ---------------------------------------------------------------------------
CREATE TABLE public.sugestoes (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visita_id uuid REFERENCES public.visitas(id) ON DELETE SET NULL,
  nome      text NOT NULL,
  telefone  text NOT NULL,
  email     text,                       -- opcional
  mensagem  text NOT NULL,
  criado_em timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sugestoes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.sugestoes FROM anon;
GRANT SELECT ON public.sugestoes TO authenticated;
GRANT ALL    ON public.sugestoes TO service_role;

CREATE POLICY "somente admin do painel lê sugestões"
  ON public.sugestoes FOR SELECT TO authenticated
  USING (public.eh_admin_painel());

CREATE INDEX sugestoes_criado_em_idx ON public.sugestoes (criado_em DESC);

-- ============================================================================
-- Visões do funil — o painel apenas lê daqui, sem calcular nada no navegador.
--
-- security_invoker = true é OBRIGATÓRIO: sem isso a view roda com os direitos
-- do dono e devolve dados ignorando a RLS das tabelas de baixo.
-- ============================================================================

CREATE VIEW public.vw_funil_geral WITH (security_invoker = true) AS
SELECT
  count(*)                                                     AS acessos,
  count(DISTINCT id_dispositivo)                               AS pessoas_unicas,
  count(*) FILTER (WHERE iniciou_em IS NOT NULL)               AS iniciaram,
  count(*) FILTER (WHERE enviou_em  IS NOT NULL)               AS enviaram,
  round(100.0 * count(*) FILTER (WHERE iniciou_em IS NOT NULL)
        / NULLIF(count(*), 0), 1)                              AS taxa_acesso_inicio,
  round(100.0 * count(*) FILTER (WHERE enviou_em IS NOT NULL)
        / NULLIF(count(*) FILTER (WHERE iniciou_em IS NOT NULL), 0), 1) AS taxa_inicio_envio,
  round(100.0 * count(*) FILTER (WHERE enviou_em IS NOT NULL)
        / NULLIF(count(*), 0), 1)                              AS taxa_geral
FROM public.visitas;

CREATE VIEW public.vw_funil_aparelho WITH (security_invoker = true) AS
SELECT
  coalesce(tipo_aparelho, 'desconhecido')                      AS tipo_aparelho,
  count(*)                                                     AS acessos,
  count(*) FILTER (WHERE iniciou_em IS NOT NULL)               AS iniciaram,
  count(*) FILTER (WHERE enviou_em  IS NOT NULL)               AS enviaram,
  round(100.0 * count(*) FILTER (WHERE enviou_em IS NOT NULL)
        / NULLIF(count(*), 0), 1)                              AS taxa_geral
FROM public.visitas
GROUP BY 1
ORDER BY acessos DESC;

CREATE VIEW public.vw_funil_sistema WITH (security_invoker = true) AS
SELECT
  coalesce(sistema, 'desconhecido')                            AS sistema,
  count(*)                                                     AS acessos,
  count(*) FILTER (WHERE iniciou_em IS NOT NULL)               AS iniciaram,
  count(*) FILTER (WHERE enviou_em  IS NOT NULL)               AS enviaram,
  round(100.0 * count(*) FILTER (WHERE enviou_em IS NOT NULL)
        / NULLIF(count(*), 0), 1)                              AS taxa_geral
FROM public.visitas
GROUP BY 1
ORDER BY acessos DESC;

CREATE VIEW public.vw_funil_origem WITH (security_invoker = true) AS
SELECT
  coalesce(nullif(origem, ''), 'sem origem')                   AS origem,
  count(*)                                                     AS acessos,
  count(*) FILTER (WHERE iniciou_em IS NOT NULL)               AS iniciaram,
  count(*) FILTER (WHERE enviou_em  IS NOT NULL)               AS enviaram,
  round(100.0 * count(*) FILTER (WHERE enviou_em IS NOT NULL)
        / NULLIF(count(*), 0), 1)                              AS taxa_geral
FROM public.visitas
GROUP BY 1
ORDER BY acessos DESC;

CREATE VIEW public.vw_funil_diario WITH (security_invoker = true) AS
SELECT
  (criado_em AT TIME ZONE 'America/Sao_Paulo')::date           AS dia,
  count(*)                                                     AS acessos,
  count(*) FILTER (WHERE iniciou_em IS NOT NULL)               AS iniciaram,
  count(*) FILTER (WHERE enviou_em  IS NOT NULL)               AS enviaram
FROM public.visitas
GROUP BY 1
ORDER BY dia DESC;

REVOKE ALL ON public.vw_funil_geral, public.vw_funil_aparelho, public.vw_funil_sistema,
              public.vw_funil_origem, public.vw_funil_diario FROM anon;
GRANT SELECT ON public.vw_funil_geral, public.vw_funil_aparelho, public.vw_funil_sistema,
                public.vw_funil_origem, public.vw_funil_diario TO authenticated;

-- ---------------------------------------------------------------------------
-- Libere o seu acesso ao painel trocando o e-mail abaixo e rodando esta linha.
-- Precisa ser um e-mail com conta criada no app (/auth/signup).
-- ---------------------------------------------------------------------------
-- INSERT INTO public.painel_admins (email) VALUES ('kohlrauschvictor@gmail.com');
