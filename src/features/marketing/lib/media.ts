/**
 * Helpers de ambiente para as animações da landing. Todos são seguros no SSR
 * (TanStack Start renderiza no servidor): devolvem um valor neutro quando não
 * há `window`.
 */

/** `true` quando roda no navegador. Base para todas as outras. */
export const isBrowser = (): boolean => typeof window !== "undefined";

/**
 * Usuário pediu menos movimento. Quando `true`, desligamos scrub e pinning e
 * mostramos direto o estado estático (poster da água, fades simples).
 */
export const prefersReducedMotion = (): boolean =>
  isBrowser() && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Viewport pequena (< 768px, breakpoint `md`). Alivia efeitos no celular. */
export const isMobileViewport = (): boolean =>
  isBrowser() && window.matchMedia("(max-width: 767px)").matches;

// Cache (a detecção cria um contexto WebGL; faz só uma vez).
let webglRapidoCache: boolean | null = null;

/**
 * Há GPU de verdade para WebGL? Alguns ambientes (VMs, GPU desligada, drivers
 * ausentes) caem em renderização por SOFTWARE ("SwiftShader", "Microsoft Basic
 * Render Driver", "llvmpipe"), onde cenas 3D pesadas rodam a poucos fps. Nesses
 * casos tratamos como "sem WebGL rápido" e usamos o poster estático.
 * Otimista por padrão: se não der para detectar, assume GPU.
 */
export function hasFastWebGL(): boolean {
  if (!isBrowser()) return false;
  if (webglRapidoCache !== null) return webglRapidoCache;
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) {
      webglRapidoCache = false;
      return false;
    }
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "";
    const software = /SwiftShader|Basic Render|basic-render|llvmpipe|Software|Microsoft Basic/i.test(
      renderer,
    );
    webglRapidoCache = !software;
    return webglRapidoCache;
  } catch {
    webglRapidoCache = false;
    return false;
  }
}
