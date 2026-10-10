import { useCallback, useEffect, useState } from "react";
import type { Condominio } from "../lib/mock-data";
import { SEED_CONDOMINIOS } from "../lib/mock-data";

const STORAGE_KEY = "hidromonitor:condominios";

function loadCondominios(): Condominio[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Condominio[]) : SEED_CONDOMINIOS;
  } catch {
    return SEED_CONDOMINIOS;
  }
}

export type CondominioInput = {
  name: string;
  endereco: string;
  cep: string;
  cidade: string;
  estado: string;
};

export function useCondominios() {
  const [condominios, setCondominios] = useState<Condominio[]>(() => loadCondominios());

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(condominios));
  }, [condominios]);

  const addCondominio = useCallback((input: CondominioInput) => {
    const condominio: Condominio = { id: crypto.randomUUID(), ...input };
    setCondominios((prev) => [...prev, condominio]);
    return condominio;
  }, []);

  const editCondominio = useCallback((id: string, input: CondominioInput) => {
    setCondominios((prev) => prev.map((c) => (c.id === id ? { ...c, ...input } : c)));
  }, []);

  const removeCondominio = useCallback((id: string) => {
    setCondominios((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return { condominios, addCondominio, editCondominio, removeCondominio };
}
