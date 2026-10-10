import { useState } from "react";
import { AuthInput } from "@/features/auth/components/AuthInput";
import { AuthButton } from "@/features/auth/components/AuthButton";
import { SelectField } from "./SelectField";
import type { Bloco } from "../lib/mock-data";

export function DeviceForm({
  initialName = "",
  initialBlocoId = null,
  blocos,
  onSubmit,
  submitLabel,
}: {
  initialName?: string;
  initialBlocoId?: string | null;
  blocos: Bloco[];
  onSubmit: (input: { name: string; blocoId: string | null }) => void;
  submitLabel: string;
}) {
  const [name, setName] = useState(initialName);
  const [blocoId, setBlocoId] = useState<string>(initialBlocoId ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit({ name: trimmed, blocoId: blocoId || null });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AuthInput
        label="Nome do dispositivo"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ex.: Hidrômetro Apto 12"
        required
      />

      <SelectField label="Bloco" value={blocoId} onChange={(e) => setBlocoId(e.target.value)}>
        <option value="">Sem bloco</option>
        {blocos.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </SelectField>

      <AuthButton type="submit">{submitLabel}</AuthButton>
    </form>
  );
}
