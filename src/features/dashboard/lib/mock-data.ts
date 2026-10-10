export type DeviceStatus = "online" | "offline";

export type Condominio = {
  id: string;
  name: string;
  endereco: string;
  cep: string;
  cidade: string;
  estado: string;
};

export type Bloco = {
  id: string;
  condominioId: string;
  name: string;
};

export type Dispositivo = {
  id: string;
  condominioId: string;
  blocoId: string | null;
  name: string;
  status: DeviceStatus;
  createdAt: string;
};

// Seeded on first load so the hierarchy has something to explore; all three
// collections are fully user-manageable (create/edit/remove) from there on.
export const SEED_CONDOMINIOS: Condominio[] = [
  {
    id: "cond-jardim-das-aguas",
    name: "Residencial Jardim das Águas",
    endereco: "Rua das Palmeiras, 120",
    cep: "01234-000",
    cidade: "São Paulo",
    estado: "SP",
  },
  {
    id: "cond-edificio-aurora",
    name: "Edifício Aurora",
    endereco: "Av. Aurora, 450",
    cep: "04567-000",
    cidade: "São Paulo",
    estado: "SP",
  },
];

export const SEED_BLOCOS: Bloco[] = [
  { id: "bloco-a-jardim", condominioId: "cond-jardim-das-aguas", name: "Bloco A" },
  { id: "bloco-b-jardim", condominioId: "cond-jardim-das-aguas", name: "Bloco B" },
];

export const ESTADOS_BR = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
] as const;
