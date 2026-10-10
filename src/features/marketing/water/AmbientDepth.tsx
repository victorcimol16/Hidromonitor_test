/**
 * Atmosfera "profundidade submersa" do hero.
 *
 * Camadas puramente decorativas (CSS/SVG, sem shader): faixa de superfície
 * luminosa no topo, brilho de sol atravessando a água, raios de luz descendo e
 * bolhas lentas subindo em direção à superfície — um aceno aos pontinhos da
 * logo. Tudo anima só `transform`/`opacity`. Em `prefers-reduced-motion` a cena
 * congela e as bolhas somem (ver styles.css, bloco [data-ambient]).
 *
 * Fica ENTRE o vídeo de água (atrás) e o conteúdo do hero (à frente).
 */

// Raios de luz: poucos e fixos (determinísticos p/ não quebrar o SSR). Menos
// elementos = cena mais leve.
const RAIOS = [
  { left: 32, ang: -9, w: 220, dur: 11, delay: 0 },
  { left: 56, ang: 7, w: 200, dur: 10, delay: 1.4 },
  { left: 80, ang: 15, w: 170, dur: 12, delay: 0.7 },
];

// Bolhas: configs fixas (left %, tamanho px, subida vh, deriva px, duração s,
// atraso s, opacidade máxima). Mantidas enxutas para não pesar.
const BOLHAS = [
  { left: 10, size: 8, rise: 88, drift: 14, dur: 15, delay: 0, op: 0.4 },
  { left: 22, size: 12, rise: 94, drift: 18, dur: 13, delay: 1.5, op: 0.46 },
  { left: 34, size: 5, rise: 78, drift: 8, dur: 18, delay: 4.5, op: 0.3 },
  { left: 46, size: 9, rise: 90, drift: -14, dur: 15.5, delay: 2.2, op: 0.4 },
  { left: 57, size: 6, rise: 82, drift: 12, dur: 17, delay: 6, op: 0.32 },
  { left: 68, size: 11, rise: 92, drift: -16, dur: 13.5, delay: 0.8, op: 0.44 },
  { left: 79, size: 6, rise: 80, drift: 10, dur: 16.5, delay: 3, op: 0.32 },
  { left: 89, size: 13, rise: 95, drift: -18, dur: 12.5, delay: 4, op: 0.46 },
  { left: 96, size: 5, rise: 76, drift: -8, dur: 18.5, delay: 2, op: 0.28 },
];

const LUZ = "199, 232, 255"; // azul-claro para a luz/bolhas (rgb)

export function AmbientDepth() {
  return (
    <div
      data-ambient
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Brilho de sol atravessando a superfície (topo-centro). */}
      <div
        className="anim absolute left-1/2 top-[-18%] h-[55%] w-[70%]"
        style={{
          background: `radial-gradient(ellipse at center, rgba(${LUZ}, 0.28) 0%, rgba(${LUZ}, 0.08) 38%, transparent 70%)`,
          animation: "sun-drift 10s ease-in-out infinite",
        }}
      />

      {/* Raios de luz descendo da superfície. */}
      {RAIOS.map((r, i) => (
        <div
          key={i}
          className="anim absolute top-[-12%] h-[130%]"
          style={{
            left: `${r.left}%`,
            width: `${r.w}px`,
            transform: `translateX(-50%) rotate(${r.ang}deg)`,
            transformOrigin: "top center",
            // Gradiente suave já dá o esfumado — sem blur nem mix-blend (caros).
            background: `linear-gradient(to bottom, rgba(${LUZ}, 0.28) 0%, rgba(${LUZ}, 0.08) 44%, transparent 70%)`,
            borderRadius: "50%",
            animation: `ray-breathe ${r.dur}s ease-in-out ${r.delay}s infinite`,
          }}
        />
      ))}

      {/* Faixa de superfície luminosa, logo abaixo do topo. */}
      <div
        className="anim absolute inset-x-0 top-0 h-[16%]"
        style={{
          background: `linear-gradient(to bottom, rgba(${LUZ}, 0.22) 0%, transparent 100%)`,
          animation: "surface-shimmer 7s ease-in-out infinite",
        }}
      />

      {/* Bolhas subindo. */}
      <div className="bubbles-layer absolute inset-0">
        {BOLHAS.map((b, i) => (
          <span
            key={i}
            className="absolute bottom-0 rounded-full"
            style={{
              left: `${b.left}%`,
              width: `${b.size}px`,
              height: `${b.size}px`,
              background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.75), rgba(${LUZ}, 0.28) 60%, transparent 74%)`,
              // Variáveis consumidas pelo keyframe bubble-rise.
              ["--rise" as string]: `${b.rise}vh`,
              ["--drift" as string]: `${b.drift}px`,
              ["--bmax" as string]: b.op,
              animation: `bubble-rise ${b.dur}s linear ${b.delay}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
