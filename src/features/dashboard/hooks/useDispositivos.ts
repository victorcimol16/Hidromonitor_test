import { useCallback, useEffect, useState } from "react";
import type { Dispositivo } from "../lib/mock-data";

const STORAGE_KEY = "hidromonitor:dispositivos";

function loadDispositivos(): Dispositivo[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Dispositivo[]) : [];
  } catch {
    return [];
  }
}

export type DispositivoInput = {
  name: string;
  condominioId: string;
  blocoId: string | null;
};

/**
 * Devices are mocked and persisted client-side only (no telemetry backend yet).
 * The shape mirrors what a real device-registry table would look like, so
 * swapping this hook for a real data-fetching one later is a drop-in change.
 */
export function useDispositivos() {
  const [devices, setDevices] = useState<Dispositivo[]>(() => loadDispositivos());

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(devices));
  }, [devices]);

  const addDevice = useCallback((input: DispositivoInput) => {
    const device: Dispositivo = {
      id: crypto.randomUUID(),
      status: "offline",
      createdAt: new Date().toISOString(),
      ...input,
    };
    setDevices((prev) => [...prev, device]);
    return device;
  }, []);

  const editDevice = useCallback((id: string, input: DispositivoInput) => {
    setDevices((prev) => prev.map((d) => (d.id === id ? { ...d, ...input } : d)));
  }, []);

  const removeDevice = useCallback((id: string) => {
    setDevices((prev) => prev.filter((d) => d.id !== id));
  }, []);

  /** Cascade: called when the parent condomínio itself is removed. */
  const removeByCondominioId = useCallback((condominioId: string) => {
    setDevices((prev) => prev.filter((d) => d.condominioId !== condominioId));
  }, []);

  /** Called when a bloco is removed — devices stay, just lose that grouping. */
  const unassignBloco = useCallback((blocoId: string) => {
    setDevices((prev) => prev.map((d) => (d.blocoId === blocoId ? { ...d, blocoId: null } : d)));
  }, []);

  return {
    devices,
    addDevice,
    editDevice,
    removeDevice,
    removeByCondominioId,
    unassignBloco,
  };
}
