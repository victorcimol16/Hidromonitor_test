/**
 * Capítulo 4 — Lado a lado.
 *
 * Uma ideia: a mesma conta do prédio, duas formas de dividir. Seção densa e
 * informativa, sem animação: é uma comparação, então vira tabela de verdade
 * (`th scope`), com a coluna da medição individual em destaque.
 *
 * No celular, cada linha vira um bloco empilhado; os rótulos das colunas
 * aparecem dentro de cada célula (e somem a partir de `md`, onde o cabeçalho
 * da tabela está visível).
 *
 * Todas as afirmações vêm do que o produto já faz segundo os textos do projeto
 * (alertas de consumo fora do padrão, histórico por unidade, leitura automática,
 * consumo por bloco). Nenhum número.
 */

const LINHAS = [
  {
    aspecto: "Quem paga o quê",
    rateio: "A conta do prédio é dividida em partes iguais.",
    individual: "Cada unidade paga o que consumiu.",
  },
  {
    aspecto: "Economizar compensa?",
    rateio: "Não muda a conta: a economia de um se dilui entre todos.",
    individual: "Sim: quem economiza paga menos no mês seguinte.",
  },
  {
    aspecto: "Vazamento numa unidade",
    rateio: "Todos pagam, e ninguém percebe até a fatura subir.",
    individual: "O consumo fora do padrão aparece na plataforma.",
  },
  {
    aspecto: "Leitura",
    rateio: "Não existe por unidade, ou é feita à mão, porta a porta.",
    individual: "Automática, pela saída de pulso do medidor.",
  },
  {
    aspecto: "Contestação de um morador",
    rateio: "Sem dados da unidade para responder.",
    individual: "Histórico de consumo de cada apartamento.",
  },
  {
    aspecto: "Assembleia",
    rateio: "Discussão sem números.",
    individual: "Consumo por bloco e por unidade, pronto para apresentar.",
  },
];

const RATEIO = "Rateio igual";
const INDIVIDUAL = "Medição individual";

export function Comparativo() {
  return (
    <section
      id="lado-a-lado"
      aria-labelledby="comparativo-titulo"
      className="bg-hm-bg py-[var(--space-8)] text-hm-text md:py-[var(--space-12)] lg:py-[var(--space-16)]"
    >
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <h2
          id="comparativo-titulo"
          className="max-w-[20ch] font-display text-[length:var(--text-h2)] font-bold leading-[1.08] tracking-[-0.02em]"
        >
          A mesma conta, duas formas de dividir.
        </h2>

        <table className="mt-[var(--space-8)] w-full border-collapse text-left">
          <caption className="sr-only">
            Comparação entre rateio igual e medição individual de água em condomínio
          </caption>
          <thead className="max-md:sr-only">
            <tr className="border-b border-hm-text/15">
              <th
                scope="col"
                className="w-[24%] pb-[var(--space-2)] align-bottom text-sm font-semibold"
              >
                <span className="sr-only">Aspecto</span>
              </th>
              <th
                scope="col"
                className="w-[38%] pb-[var(--space-2)] pr-[var(--space-4)] align-bottom text-sm font-semibold text-hm-text-muted"
              >
                {RATEIO}
              </th>
              <th
                scope="col"
                className="w-[38%] rounded-t-lg bg-hm-primary-100 align-bottom px-[var(--space-3)] pb-[var(--space-2)] pt-[var(--space-2)] text-sm font-semibold text-hm-primary"
              >
                {INDIVIDUAL}
              </th>
            </tr>
          </thead>
          <tbody>
            {LINHAS.map((l) => (
              <tr
                key={l.aspecto}
                className="border-b border-hm-text/10 max-md:block max-md:py-[var(--space-3)]"
              >
                <th
                  scope="row"
                  className="py-[var(--space-3)] pr-[var(--space-4)] align-top font-display text-lg font-semibold leading-snug max-md:block max-md:py-0"
                >
                  {l.aspecto}
                </th>
                <td className="py-[var(--space-3)] pr-[var(--space-4)] align-top leading-[var(--leading-body)] text-hm-text-muted max-md:mt-[var(--space-1)] max-md:block max-md:py-0">
                  <span className="font-semibold text-hm-text md:hidden">{RATEIO}: </span>
                  {l.rateio}
                </td>
                <td className="bg-hm-primary-100 px-[var(--space-3)] py-[var(--space-3)] align-top font-medium leading-[var(--leading-body)] text-hm-text max-md:mt-[var(--space-1)] max-md:block max-md:rounded-md max-md:py-[var(--space-1)]">
                  <span className="font-semibold text-hm-primary md:hidden">{INDIVIDUAL}: </span>
                  {l.individual}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
