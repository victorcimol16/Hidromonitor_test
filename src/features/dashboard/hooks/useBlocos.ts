import { useCallback, useEffect, useState } from "react";
import type { Bloco } from "../lib/mock-data";
import { SEED_BLOCOS } from "../lib/mock-data";

const STORAGE_KEY = "hidromonitor:blocos";

function loadBlocos(): Bloco[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Bloco[]) : SEED_BLOCOS;
  } catch {
    return SEED_BLOCOS;
  }
}

export function useBlocos() {
  const [blocos, setBlocos] = useState<Bloco[]>(() => loadBlocos());

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(blocos));
  }, [blocos]);

  const addBloco = useCallback((input: { condominioId: string; name: string }) => {
    const bloco: Bloco = { id: crypto.randomUUID(), ...input };
    setBlocos((prev) => [...prev, bloco]);
    return bloco;
  }, []);

  const renameBloco = useCallback((id: string, name: string) => {
    setBlocos((prev) => prev.map((b) => (b.id === id ? { ...b, name } : b)));
  }, []);

  const removeBloco = useCallback((id: string) => {
    setBlocos((prev) => prev.filter((b) => b.id !== id));
  }, []);

  /** Cascade: called when the parent condomínio itself is removed. */
  const removeByCondominioId = useCallback((condominioId: string) => {
    setBlocos((prev) => prev.filter((b) => b.condominioId !== condominioId));
  }, []);

  return { blocos, addBloco, renameBloco, removeBloco, removeByCondominioId };
}
