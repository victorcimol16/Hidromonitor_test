import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/**
 * Painel do funil da página /sugestao.
 *
 * A checagem de acesso é feita aqui, e não pela rota _authenticated: aquele
 * grupo respeita FEATURES.auth, que hoje está `false` e deixa qualquer um
 * passar. A trava que vale mesmo é a RLS do banco — esta tela só decide o que
 * mostrar; quem não estiver em `painel_admins` não recebe linha nenhuma, nem
 * que chame a API por fora.
 */

type FunilGeral = {
  acessos: number;
  pessoas_unicas: number;
  iniciaram: number;
  enviaram: number;
  taxa_acesso_inicio: number | null;
  taxa_inicio_envio: number | null;
  taxa_geral: number | null;
};

type LinhaRecorte = {
  acessos: number;
  iniciaram: number;
  enviaram: number;
  taxa_geral: number | null;
  tipo_aparelho?: string;
  sistema?: string;
  origem?: string;
};

type Sugestao = {
  id: string;
  nome: string;
  telefone: string;
  email: string | null;
  mensagem: string;
  criado_em: string;
};

type Estado = "carregando" | "sem-sessao" | "sem-permissao" | "pronto" | "erro";

/** types.ts é gerado pelo Supabase e ainda não conhece as tabelas do funil. */
const db = supabase as unknown as SupabaseClient;

function porcento(valor: number | null | undefined): string {
  return valor == null ? "—" : `${valor}%`;
}

/** CSV com separador ";" e BOM — o que o Excel em português espera. */
function baixarCsv(nomeArquivo: string, cabecalho: string[], linhas: (string | number | null)[][]) {
  const celula = (v: string | number | null) => {
    const bruto = v == null ? "" : String(v);
    return /[";\n]/.test(bruto) ? `"${bruto.split('"').join('""')}"` : bruto;
  };
  const conteudo = [cabecalho, ...linhas].map((l) => l.map(celula).join(";")).join("\r\n");
  const blob = new Blob(["﻿" + conteudo], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  a.click();
  URL.revokeObjectURL(url);
}

function Numero({ rotulo, valor, nota }: { rotulo: string; valor: number; nota?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-sm text-muted-foreground">{rotulo}</p>
      <p className="mt-1 font-display text-3xl font-bold text-foreground">
        {valor.toLocaleString("pt-BR")}
      </p>
      {nota ? <p className="mt-1 text-xs text-muted-foreground">{nota}</p> : null}
    </div>
  );
}

/** Tabela com barra proporcional em CSS puro — sem biblioteca de gráfico. */
function TabelaRecorte({
  titulo,
  campo,
  linhas,
}: {
  titulo: string;
  campo: "tipo_aparelho" | "sistema" | "origem";
  linhas: LinhaRecorte[];
}) {
  const maximo = Math.max(1, ...linhas.map((l) => l.acessos));

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="font-display text-lg font-semibold text-foreground">{titulo}</h2>
      {linhas.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Nenhum acesso registrado ainda.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {linhas.map((linha) => (
            <li key={String(linha[campo])}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate font-medium text-foreground">{linha[campo]}</span>
                <span className="shrink-0 text-muted-foreground">
                  {linha.acessos} acessos · {linha.enviaram} envios ·{" "}
                  <strong className="text-foreground">{porcento(linha.taxa_geral)}</strong>
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.round((linha.acessos / maximo) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Aviso({
  titulo,
  texto,
  children,
}: {
  titulo: string;
  texto: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <h1 className="font-display text-xl font-bold text-foreground">{titulo}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{texto}</p>
        {children}
      </div>
    </div>
  );
}

function PainelFunil() {
  const [estado, setEstado] = useState<Estado>("carregando");
  const [geral, setGeral] = useState<FunilGeral | null>(null);
  const [aparelhos, setAparelhos] = useState<LinhaRecorte[]>([]);
  const [sistemas, setSistemas] = useState<LinhaRecorte[]>([]);
  const [origens, setOrigens] = useState<LinhaRecorte[]>([]);
  const [sugestoes, setSugestoes] = useState<Sugestao[]>([]);

  const carregar = useCallback(async () => {
    setEstado("carregando");

    const { data: sessao } = await supabase.auth.getSession();
    if (!sessao.session) {
      setEstado("sem-sessao");
      return;
    }

    // A política deixa o usuário ver só a própria linha: se não vier nada, ele
    // não está liberado para o painel.
    const { data: admin } = await db.from("painel_admins").select("email").maybeSingle();
    if (!admin) {
      setEstado("sem-permissao");
      return;
    }

    const [g, ap, si, og, su] = await Promise.all([
      db.from("vw_funil_geral").select("*").maybeSingle(),
      db.from("vw_funil_aparelho").select("*"),
      db.from("vw_funil_sistema").select("*"),
      db.from("vw_funil_origem").select("*"),
      db.from("sugestoes").select("*").order("criado_em", { ascending: false }).limit(500),
    ]);

    if (g.error) {
      console.error("[painel] falha ao ler o funil", g.error);
      setEstado("erro");
      return;
    }

    setGeral(g.data as FunilGeral | null);
    setAparelhos((ap.data ?? []) as LinhaRecorte[]);
    setSistemas((si.data ?? []) as LinhaRecorte[]);
    setOrigens((og.data ?? []) as LinhaRecorte[]);
    setSugestoes((su.data ?? []) as Sugestao[]);
    setEstado("pronto");
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  if (estado === "carregando") {
    return <Aviso titulo="Carregando…" texto="Buscando os números do funil." />;
  }

  if (estado === "sem-sessao") {
    return (
      <Aviso titulo="Acesso restrito" texto="Entre com a sua conta para ver o painel.">
        <Link
          to="/auth/login"
          className="mt-5 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Entrar
        </Link>
      </Aviso>
    );
  }

  if (estado === "sem-permissao") {
    return (
      <Aviso
        titulo="Sem permissão"
        texto="Sua conta está autenticada, mas não está liberada para o painel. Inclua o seu e-mail na tabela painel_admins."
      />
    );
  }

  if (estado === "erro") {
    return (
      <Aviso titulo="Não foi possível carregar" texto="Tente novamente em alguns instantes." />
    );
  }

  const g = geral;

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Página de sugestões</p>
            <h1 className="mt-0.5 font-display text-2xl font-bold text-foreground">
              Funil de acesso
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void carregar()}
              className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Atualizar
            </button>
            <button
              type="button"
              onClick={() =>
                baixarCsv(
                  "sugestoes.csv",
                  ["Data", "Nome", "Telefone", "E-mail", "Mensagem"],
                  sugestoes.map((s) => [
                    new Date(s.criado_em).toLocaleString("pt-BR"),
                    s.nome,
                    s.telefone,
                    s.email,
                    s.mensagem,
                  ]),
                )
              }
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Exportar sugestões (CSV)
            </button>
            <button
              type="button"
              onClick={() =>
                baixarCsv(
                  "funil.csv",
                  ["Recorte", "Valor", "Acessos", "Iniciaram", "Enviaram", "Taxa geral (%)"],
                  [
                    ...aparelhos.map((l) => [
                      "aparelho",
                      l.tipo_aparelho ?? "",
                      l.acessos,
                      l.iniciaram,
                      l.enviaram,
                      l.taxa_geral,
                    ]),
                    ...sistemas.map((l) => [
                      "sistema",
                      l.sistema ?? "",
                      l.acessos,
                      l.iniciaram,
                      l.enviaram,
                      l.taxa_geral,
                    ]),
                    ...origens.map((l) => [
                      "origem",
                      l.origem ?? "",
                      l.acessos,
                      l.iniciaram,
                      l.enviaram,
                      l.taxa_geral,
                    ]),
                  ],
                )
              }
              className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Exportar funil (CSV)
            </button>
          </div>
        </header>

        {/* os quatro números do funil */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Numero rotulo="Acessos" valor={g?.acessos ?? 0} nota="Visitas à página" />
          <Numero
            rotulo="Pessoas únicas"
            valor={g?.pessoas_unicas ?? 0}
            nota="Estimativa por aparelho"
          />
          <Numero
            rotulo="Iniciaram"
            valor={g?.iniciaram ?? 0}
            nota={`${porcento(g?.taxa_acesso_inicio)} dos acessos`}
          />
          <Numero
            rotulo="Enviaram"
            valor={g?.enviaram ?? 0}
            nota={`${porcento(g?.taxa_inicio_envio)} de quem começou`}
          />
        </div>

        <p className="mt-3 text-sm text-muted-foreground">
          Conversão de ponta a ponta:{" "}
          <strong className="text-foreground">{porcento(g?.taxa_geral)}</strong> dos acessos
          terminam em sugestão enviada.
        </p>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <TabelaRecorte titulo="Por aparelho" campo="tipo_aparelho" linhas={aparelhos} />
          <TabelaRecorte titulo="Por sistema" campo="sistema" linhas={sistemas} />
          <TabelaRecorte titulo="Por origem do QR" campo="origem" linhas={origens} />
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Sugestões recebidas{" "}
            <span className="text-sm font-normal text-muted-foreground">({sugestoes.length})</span>
          </h2>
          {sugestoes.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Nenhuma sugestão registrada ainda.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {sugestoes.map((s) => (
                <li key={s.id} className="py-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-semibold text-foreground">{s.nome}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(s.criado_em).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {s.telefone}
                    {s.email ? ` · ${s.email}` : ""}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{s.mensagem}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/painel")({
  ssr: false,
  component: PainelFunil,
});
