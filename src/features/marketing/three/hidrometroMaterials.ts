import * as THREE from "three";

/**
 * Materiais do hidrômetro (Etapa 2).
 *
 * O STEP não traz materiais, então aplicamos MeshPhysicalMaterial por grupo de
 * peças. Os nomes das peças vêm do próprio arquivo (ver hidromonitor-3d).
 *
 * O corpo tem DUAS variantes para o usuário escolher: latão polido ou plástico
 * técnico escuro. O resto é fixo: vidro no mostrador, cromo nos detalhes,
 * branco nas rodas do totalizador e âmbar da marca no ponteiro (único acento
 * quente).
 */

export type BodyVariant = "brass" | "plastic";

// Âmbar da marca (#ffbf52) e azul profundo (#002953) — usados como acentos.
export const BRAND_AMBER = "#ffbf52";
export const BRAND_DEEP = "#002953";

/** A qual grupo de material cada peça pertence. Casamento robusto (minúsculas +
 *  `includes`) para não depender de acentos/espaços exatos no nome. */
export function groupForPart(name: string): MaterialGroup {
  const n = name.trim().toLowerCase();
  // Rodas do totalizador: SOLID pares (2,4,...,14) — brancas.
  if (/^solid_(2|4|6|8|10|12|14)$/.test(n)) return "wheels";
  // Anéis/espaçadores entre as rodas: SOLID ímpares (3,5,...,15).
  if (/^solid_(3|5|7|9|11|13|15)$/.test(n)) return "chrome";
  // Ponteiro — vermelho (acento).
  if (n.includes("ponteiro")) return "amber";
  // Lente/mostrador — vidro translúcido.
  if (n.includes("visor") || n.includes("espelho")) return "glass";
  // Face do totalizador e etiquetas — brancas.
  if (n.includes("adesivo")) return "face";
  // Tampa de proteção — anel âmbar de destaque.
  if (n.includes("tampa")) return "blue";
  // Corpo / carcaça / cúpula / caixa / corpo interno — AZUL (cor dominante).
  if (n.includes("topo") || n.includes("corpo") || n === "solid_1" || n === "solid")
    return "body";
  // Detalhes (filtro, batente, parafuso) — cinza.
  return "chrome";
}

export type MaterialGroup = "body" | "blue" | "glass" | "chrome" | "wheels" | "face" | "amber";

/**
 * Cria o conjunto de materiais — look PLANO e VIBRANTE (sem metal, sem reflexo
 * de environment): cores chapadas e saturadas, com apenas o sombreamento suave
 * das luzes para dar forma. Estilo ilustração 3D / clay.
 *
 * `metalness: 0` + `envMapIntensity: 0` remove reflexos; `roughness` alto deixa
 * a superfície fosca; `MeshStandardMaterial` (sem clearcoat) mantém tudo simples.
 */
const flat = (hex: string, roughness = 0.65) =>
  new THREE.MeshStandardMaterial({
    color: new THREE.Color(hex),
    metalness: 0,
    roughness,
    envMapIntensity: 0,
  });

export function createMaterials(variant: BodyVariant): Record<MaterialGroup, THREE.Material> {
  // Corpo: azul vibrante da marca (ou grafite, na variante "plastic").
  const body = flat(variant === "brass" ? "#1763d6" : "#2a2f3a");

  // Tampa/colar: âmbar vibrante da marca (contraste quente com o corpo azul).
  const blue = flat("#ffab1f", 0.55);

  // Lente do mostrador: translúcida clara, fosca, sem reflexo.
  const glass = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#d6ebff"),
    metalness: 0,
    roughness: 0.4,
    envMapIntensity: 0,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
  });

  // Detalhes (filtro, batente, parafuso): cinza-claro fosco.
  const chrome = flat("#b9c2cc", 0.7);

  // Rodas do totalizador e mostrador: branco.
  const wheels = flat("#f4f7fb", 0.75);
  const face = flat("#f4f7fb", 0.8);

  // Ponteiro: vermelho vibrante (pop de cor, como num hidrômetro de verdade).
  const amber = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#e5392b"),
    metalness: 0,
    roughness: 0.5,
    envMapIntensity: 0,
    emissive: new THREE.Color("#e5392b"),
    emissiveIntensity: 0.15,
  });

  return { body, blue, glass, chrome, wheels, face, amber };
}

/** Libera as texturas/materiais (chamar ao trocar variante / desmontar). */
export function disposeMaterials(mats: Record<MaterialGroup, THREE.Material>) {
  Object.values(mats).forEach((m) => m.dispose());
}

/**
 * Cria um material FOSCO (sem reflexo) usando a COR ORIGINAL da peça — aquela
 * que veio do próprio modelo (STEP → GLB). Preserva as cores e os lugares do
 * modelo original, só trocando o acabamento por plano/fosco.
 */
/** Vidro translúcido da LENTE sobre o mostrador (a peça "Espelho"). No CAD ela
 *  vem opaca e acaba tampando o visor — aqui a deixamos transparente. */
export function glassLensMaterial(): THREE.Material {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color("#dceeff"),
    metalness: 0,
    roughness: 0.15,
    envMapIntensity: 0,
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
  });
}

/** `true` se a peça é a lente/vidro que cobre o mostrador. */
export function isLensPart(name: string): boolean {
  return name.trim().toLowerCase().includes("espelho");
}

/** `true` se a peça é o casco externo da carcaça (cutaway deixa semitransparente). */
export function isShellPart(name: string): boolean {
  const n = name.trim().toLowerCase();
  // Casco EXTERNO (fica semitransparente). NÃO inclui "SOLID" (a caixa do
  // mecanismo com os números do registro) — essa fica opaca e visível.
  return n === "solid_1" || n.includes("topo") || n.includes("corpo");
}

/** `true` se a peça é a face do mostrador (números/visor) — recebe destaque. */
export function isDialFace(name: string): boolean {
  const n = name.trim().toLowerCase();
  return n.includes("adesivo") || n.includes("visor");
}

/** Material do mostrador destacado: claro + leve emissivo, para "brilhar"
 *  dentro do corpo de vidro (cutaway) e chamar atenção. */
export function dialHighlightMaterial(): THREE.Material {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color("#f2f7ff"),
    metalness: 0,
    roughness: 0.55,
    envMapIntensity: 0,
    emissive: new THREE.Color("#cfe0ff"),
    emissiveIntensity: 0.6,
  });
}

/** Material "fantasma": a cor original da peça, porém semitransparente, para o
 *  efeito cutaway — revela o mecanismo/mostrador por dentro sem mover nada. */
export function ghostMaterialFromMesh(mesh: THREE.Mesh): THREE.Material {
  const m = flatMaterialFromMesh(mesh) as THREE.MeshStandardMaterial;
  m.transparent = true;
  m.opacity = 0.22;
  m.depthWrite = false;
  // Mantém FrontSide (sem DoubleSide) para não dobrar o overdraw — o casco
  // transparente de face única já revela o interior e é bem mais leve/estável.
  return m;
}

export function flatMaterialFromMesh(mesh: THREE.Mesh): THREE.Material {
  const src = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
  const std = src as THREE.MeshStandardMaterial | undefined;
  const color =
    std && std.color ? std.color.clone() : new THREE.Color("#8a8a8a");
  const transparent = !!(std && (std.transparent || (std.opacity ?? 1) < 1));
  return new THREE.MeshStandardMaterial({
    color,
    metalness: 0,
    roughness: 0.7,
    envMapIntensity: 0,
    transparent,
    opacity: std?.opacity ?? 1,
  });
}
