import { useState } from "react";
import { AuthInput } from "@/features/auth/components/AuthInput";
import { AuthButton } from "@/features/auth/components/AuthButton";
import { PlusIcon, XIcon } from "@/components/icons";
import { ESTADOS_BR } from "../lib/mock-data";
import type { CondominioInput } from "../hooks/useCondominios";
import { SelectField } from "./SelectField";

export function CondominioForm({
  initialValues,
  showBlocos = false,
  onSubmit,
  submitLabel,
}: {
  initialValues?: Partial<CondominioInput>;
  showBlocos?: boolean;
  onSubmit: (input: CondominioInput, blocoNames: string[]) => void;
  submitLabel: string;
}) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [endereco, setEndereco] = useState(initialValues?.endereco ?? "");
  const [cep, setCep] = useState(initialValues?.cep ?? "");
  const [cidade, setCidade] = useState(initialValues?.cidade ?? "");
  const [estado, setEstado] = useState(initialValues?.estado ?? ESTADOS_BR[0]);
  const [blocoNames, setBlocoNames] = useState<string[]>([""]);

  function updateBlocoName(index: number, value: string) {
    setBlocoNames((prev) => prev.map((b, i) => (i === index ? value : b)));
  }

  function addBlocoRow() {
    setBlocoNames((prev) => [...prev, ""]);
  }

  function removeBlocoRow(index: number) {
    setBlocoNames((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    const cleanBlocoNames = blocoNames.map((b) => b.trim()).filter(Boolean);
    onSubmit(
      {
        name: trimmedName,
        endereco: endereco.trim(),
        cep: cep.trim(),
        cidade: cidade.trim(),
        estado,
      },
      cleanBlocoNames,
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AuthInput
        label="Nome do condomínio"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ex.: Residencial Vista Verde"
        required
      />
      <AuthInput
        label="Endereço"
        value={endereco}
        onChange={(e) => setEndereco(e.target.value)}
        placeholder="Rua, número"
      />

      <div className="grid grid-cols-3 gap-3">
        <AuthInput
          label="CEP"
          value={cep}
          onChange={(e) => setCep(e.target.value)}
          placeholder="00000-000"
        />
        <AuthInput
          label="Cidade"
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
          placeholder="Cidade"
        />
        <SelectField label="Estado" value={estado} onChange={(e) => setEstado(e.target.value)}>
          {ESTADOS_BR.map((uf) => (
            <option key={uf} value={uf}>
              {uf}
            </option>
          ))}
        </SelectField>
      </div>

      {showBlocos ? (
        <div>
          <span className="mb-1.5 block text-sm font-semibold text-foreground">
            Blocos (opcional)
          </span>
          <div className="space-y-2">
            {blocoNames.map((value, index) => (
              <div key={index} className="flex gap-2">
                <input
                  value={value}
                  onChange={(e) => updateBlocoName(index, e.target.value)}
                  placeholder={`Ex.: Bloco ${String.fromCharCode(65 + index)}`}
                  className="flex-1 rounded-lg border border-input bg-white px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-[#5FD0FF]"
                />
                {blocoNames.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeBlocoRow(index)}
                    aria-label="Remover linha de bloco"
                    className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-destructive"
                  >
                    <XIcon width={16} height={16} />
                  </button>
                ) : null}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addBlocoRow}
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            <PlusIcon width={14} height={14} />
            Adicionar bloco
          </button>
        </div>
      ) : null}

      <AuthButton type="submit">{submitLabel}</AuthButton>
    </form>
  );
}
