/**
 * Utilitários do funil que só rodam no servidor.
 *
 * Não há segredo neste arquivo — são funções puras. A chave de serviço do
 * Supabase é carregada por import dinâmico dentro dos handlers, para não
 * vazar no pacote enviado ao navegador.
 */

/**
 * Zera o último trecho do IP. `189.45.12.77` vira `189.45.12.0`.
 *
 * Mantém a utilidade analítica (dá para separar regiões e perceber acessos
 * repetidos da mesma rede) sem guardar um endereço que identifique uma pessoa
 * específica — o que reduz bastante a exposição na LGPD.
 */
export function mascararIp(ip: string | null): string | null {
  if (!ip) return null;
  const limpo = ip.trim();
  if (!limpo) return null;

  // IPv6: preserva os quatro primeiros grupos (a rede), descarta o resto.
  if (limpo.includes(":")) {
    const grupos = limpo.split(":").filter(Boolean).slice(0, 4);
    return grupos.length ? `${grupos.join(":")}::` : null;
  }

  const partes = limpo.split(".");
  if (partes.length !== 4) return null;
  return `${partes[0]}.${partes[1]}.${partes[2]}.0`;
}

export type LocalDaVisita = {
  ip_mascarado: string | null;
  cidade: string | null;
  pais: string | null;
};

/**
 * Lê IP, cidade e país dos cabeçalhos que a Cloudflare adiciona.
 *
 * `cf-connecting-ip` e `cf-ipcountry` vêm por padrão. A cidade depende de
 * `request.cf` (disponível no runtime de Workers) ou de uma Transform Rule que
 * adicione `cf-ipcity` — se nenhum dos dois existir, fica nula e o resto segue
 * funcionando normalmente.
 */
export function localDaRequisicao(request: Request): LocalDaVisita {
  const cabecalho = (nome: string) => request.headers.get(nome);

  const ipBruto =
    cabecalho("cf-connecting-ip") ??
    cabecalho("x-real-ip") ??
    cabecalho("x-forwarded-for")?.split(",")[0] ??
    null;

  const cf = (request as Request & { cf?: { city?: string; country?: string } }).cf;

  return {
    ip_mascarado: mascararIp(ipBruto),
    cidade: cf?.city ?? cabecalho("cf-ipcity") ?? null,
    pais: cf?.country ?? cabecalho("cf-ipcountry") ?? null,
  };
}

/** Corta o texto no limite e devolve nulo quando vem vazio. */
export function texto(valor: unknown, limite: number): string | null {
  if (typeof valor !== "string") return null;
  const limpo = valor.trim().slice(0, limite);
  return limpo === "" ? null : limpo;
}

/** Aceita só número dentro da faixa; qualquer outra coisa vira nulo. */
export function inteiro(valor: unknown, minimo: number, maximo: number): number | null {
  const n = typeof valor === "number" ? valor : Number(valor);
  if (!Number.isFinite(n)) return null;
  const arredondado = Math.round(n);
  if (arredondado < minimo || arredondado > maximo) return null;
  return arredondado;
}

/** Igual a `inteiro`, mas preserva casas decimais (pixel ratio, memória). */
export function decimal(valor: unknown, minimo: number, maximo: number): number | null {
  const n = typeof valor === "number" ? valor : Number(valor);
  if (!Number.isFinite(n)) return null;
  if (n < minimo || n > maximo) return null;
  return Math.round(n * 100) / 100;
}

/** Só deixa passar valores de uma lista fechada — evita lixo vindo do cliente. */
export function dentreOpcoes(valor: unknown, opcoes: readonly string[]): string | null {
  return typeof valor === "string" && opcoes.includes(valor) ? valor : null;
}

export const TIPOS_APARELHO = ["celular", "tablet", "computador"] as const;

/** Resposta padrão: o rastreio nunca devolve erro que possa travar a página. */
export function respostaOk(extra: Record<string, unknown> = {}): Response {
  return new Response(JSON.stringify({ ok: true, ...extra }), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
