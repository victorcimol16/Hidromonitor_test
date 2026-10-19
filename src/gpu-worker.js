// Descobre o renderizador WebGL fora da thread principal: em máquinas sem GPU
// (WebGL por software) só criar o contexto já leva segundos.
self.onmessage = () => {
  let renderer = "";
  try {
    const gl = new OffscreenCanvas(1, 1).getContext("webgl2");
    if (gl) {
      const info = gl.getExtension("WEBGL_debug_renderer_info");
      renderer = String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    } else renderer = "none";
  } catch {
    renderer = "none";
  }
  self.postMessage(renderer);
};
