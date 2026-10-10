import { useCallback, useState } from "react";

const STORAGE_KEY = "hidromonitor:configuracoes";

export type Settings = {
  /** R$ por litro, no formato exibido em pt-BR (ex.: "0,012"). */
  tarifa: string;
  /** Litros por dia que disparam um alerta. */
  limite: string;
  notifEmail: boolean;
  notifPush: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  tarifa: "0,012",
  limite: "500",
  notifEmail: true,
  notifPush: false,
};

function loadSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    // Merge com o default para tolerar chaves novas em versões futuras.
    return raw
      ? { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) }
      : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Preferências do painel, persistidas client-side (sem backend ainda), no mesmo
 * padrão de useCondominios/useDispositivos. Diferente daqueles, a gravação é
 * explícita — a tela tem um botão "Salvar", então não persistimos a cada tecla.
 */
export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => loadSettings());

  const save = useCallback((next: Settings) => {
    setSettings(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  return { settings, save };
}
