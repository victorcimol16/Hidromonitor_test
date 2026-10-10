/**
 * Feature flags — liga/desliga seções inteiras do app em um único lugar.
 *
 * Para ativar ou desativar algo, basta trocar `true`/`false` aqui.
 * (Peça "ative o login" / "desative os alertas" etc. que a troca é feita.)
 */
export const FEATURES = {
  /**
   * Autenticação (login/cadastro).
   * - `true`  → fluxo normal: precisa entrar com e-mail/senha; rotas do
   *            dashboard exigem sessão.
   * - `false` → login DESATIVADO: o botão "Entrar" leva direto ao dashboard e
   *            as rotas protegidas ficam abertas (sem checar sessão).
   */
  auth: false,

  /** Tela de Alertas (item da sidebar). */
  alerts: true,

  /** Tela de Configurações (item da sidebar). */
  settings: true,
} as const;

export type FeatureName = keyof typeof FEATURES;

export function isFeatureEnabled(name: FeatureName): boolean {
  return FEATURES[name];
}
