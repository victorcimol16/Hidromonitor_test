import type { Dispositivo } from "./mock-data";
import type { DailyPoint } from "../components/AggregateConsumptionChart";

/**
 * Agregações da visão geral — sempre derivadas dos dispositivos cadastrados.
 *
 * Ainda não há backend de leituras (telemetria) conectado, então o consumo
 * captado de cada dispositivo é 0. Estas funções são o ponto único onde a
 * leitura real de cada hidrômetro entra: ao ligar o Supabase, basta somar as
 * leituras do dispositivo aqui e todos os cards/gráfico passam a refletir o
 * dado real automaticamente.
 */

// R$ por litro — tarifa de referência usada para estimar o custo.
export const TARIFA_POR_LITRO = 0.012;

/** Consumo (L) captado por um dispositivo em um dia específico. 0 sem leitura. */
function deviceLitersOnDay(_device: Dispositivo, _day: Date): number {
  return 0;
}

/** Consumo (L) de um dispositivo em uma janela que termina hoje. 0 sem leitura. */
function deviceLitersInWindow(_device: Dispositivo, _days: number): number {
  return 0;
}

export type OverviewMetrics = {
  consumoHojeLiters: number;
  consumoMesLiters: number;
  custoEstimado: number;
  unidadesEmAlerta: number;
};

export function computeOverviewMetrics(devices: Dispositivo[]): OverviewMetrics {
  const consumoHojeLiters = devices.reduce((sum, d) => sum + deviceLitersInWindow(d, 1), 0);
  const consumoMesLiters = devices.reduce((sum, d) => sum + deviceLitersInWindow(d, 30), 0);
  // Uma unidade entra em alerta quando o consumo do dia ultrapassa o limite —
  // sem leituras (0 L), nenhuma dispara.
  const unidadesEmAlerta = 0;

  return {
    consumoHojeLiters,
    consumoMesLiters,
    custoEstimado: consumoMesLiters * TARIFA_POR_LITRO,
    unidadesEmAlerta,
  };
}

/** Série diária agregada (soma dos dispositivos) para o gráfico. */
export function buildDailyConsumption(devices: Dispositivo[], days: number): DailyPoint[] {
  const today = new Date();
  const out: DailyPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const liters = devices.reduce((sum, dev) => sum + deviceLitersOnDay(dev, d), 0);
    out.push({
      label: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`,
      liters,
    });
  }
  return out;
}
