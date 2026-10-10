---
name: hidromonitor-landing
description: Use SEMPRE que for criar, refazer, ajustar ou revisar a landing page do Hidromonitor, ou qualquer página com animações no scroll, vídeo de água controlado pela rolagem ou visual premium estilo páginas de produto da Apple.
---

# Landing page Hidromonitor: padrão premium com scroll

Esta skill define COMO construir a landing page do Hidromonitor. O objetivo é um site com nível de acabamento de página de produto da Apple: calmo, limpo, confiável, com poucos efeitos executados com perfeição. Siga as regras abaixo com prioridade sobre preferências genéricas.

## 1. Contexto da marca

- Hidromonitor: startup de medição individualizada de consumo de água em condomínios (hidrômetros multijato certificados pelo Inmetro, com saída de pulso, conformes à Lei 13.312/2016).
- Público principal: síndicos, administradoras de condomínio e construtoras.
- Mensagem central: cada unidade paga pela água que realmente usa. Justiça, transparência, economia.
- Tom: seguro, técnico sem ser frio, direto. Nada de exageros ou promessas vagas.

## 2. Identidade visual (inegociável)

- **Cores:** azul profundo (dominante) e âmbar (destaques e chamadas para ação). Extraia os valores hexadecimais EXATOS do código existente e registre como variáveis CSS (`--color-primary`, `--color-accent` etc.) antes de escrever qualquer componente. Nunca invente tons novos fora dessa família; para variações, gere tints e shades a partir das cores-base.
- **Fontes:** XXII Geom Bold para títulos, Inter para todo o resto. Nenhuma outra fonte.
- **Logo:** use apenas os arquivos existentes. Não redesenhe, não recolora, não distorça.
- Âmbar é tempero: use em no máximo um elemento de destaque por tela (botão principal, número-chave, reflexo de luz).

## 3. Princípios de design (o que torna "estilo Apple")

1. **Uma ideia por seção.** Cada tela comunica uma única mensagem.
2. **Espaço vazio é intencional.** Seções com altura mínima de 100vh nas partes narrativas; margens generosas.
3. **Tipografia como protagonista.** Títulos grandes (clamp entre ~2.5rem e ~6rem), pesos contrastantes, entrelinha apertada nos títulos (1.0 a 1.1), confortável no texto (1.5 a 1.7). Largura máxima de texto de ~60 caracteres.
4. **Um efeito de destaque por seção, no máximo.** Se duas animações competem pela atenção, remova uma.
5. **Hierarquia clara:** título, uma frase de apoio, e só então detalhes.
6. **Escala de espaçamento consistente** baseada em múltiplos de 8px. Nada de valores arbitrários.

### Anti-padrões (proibido)

- Shader de água procedural ou água desenhada em canvas/SVG tentando parecer real.
- Gradientes roxos, glassmorphism genérico, sombras pesadas, cards com bordas arredondadas em excesso, ícones de emoji.
- Vários objetos girando ao mesmo tempo, partículas por toda parte, parallax em todos os elementos.
- Animações que disparam sozinhas sem relação com o scroll ou com a leitura.
- Textos centralizados longos, blocos de texto sobre áreas de vídeo sem sobreposição de contraste.
- Layout que parece template de SaaS (hero + 3 cards + depoimentos + preços padrão).

## 4. Stack técnica

- **GSAP + ScrollTrigger** para tudo que depende do scroll.
- **Lenis** para rolagem suave.
- Sem Three.js, a menos que o usuário peça explicitamente um modelo 3D real (.glb) fornecido por ele.

### Integração obrigatória Lenis + ScrollTrigger

```js
const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

Nunca rode um loop `requestAnimationFrame` separado para o Lenis quando o GSAP estiver presente.

## 5. Água real controlada pelo scroll (técnica principal)

A água deve ser **filmagem real**, nunca simulação. Duas técnicas, nesta ordem de preferência:

### A) Sequência de frames em canvas (mais suave e confiável)

1. Extraia frames do vídeo com ffmpeg, em WebP:
   ```bash
   ffmpeg -i agua.mp4 -vf "fps=30,scale=1920:-1" -c:v libwebp -quality 75 frames/agua_%04d.webp
   ```
   Gere também uma versão para mobile (`scale=960:-1`, menos frames, ex.: fps=20).
2. Pré-carregue os frames progressivamente (primeiro o frame 1, depois o restante em segundo plano).
3. Desenhe no `<canvas>` com `drawImage`, usando lógica de "cover" (preencher a tela mantendo proporção).
4. Ligue o índice do frame ao progresso do ScrollTrigger com `scrub: 1` (ou maior, para mais inércia).

### B) Vídeo com scrubbing (alternativa mais leve)

1. O vídeo PRECISA ser reencodado com todos os quadros-chave, senão o scrub fica travado:
   ```bash
   ffmpeg -i agua.mp4 -c:v libx264 -g 1 -crf 23 -preset slow -an -movflags +faststart -vf "scale=1920:-2" agua-scrub.mp4
   ```
2. Atributos: `muted playsinline preload="auto"`, sem `autoplay`, sem `controls`.
3. Nunca escreva `video.currentTime` diretamente a cada evento de scroll. Interpole:
   ```js
   let target = 0, current = 0;
   ScrollTrigger.create({ trigger: '#agua', start: 'top top', end: 'bottom bottom',
     onUpdate: (self) => { target = self.progress * video.duration; } });
   gsap.ticker.add(() => {
     current += (target - current) * 0.1;
     if (Math.abs(video.currentTime - current) > 0.01) video.currentTime = current;
   });
   ```

### Integração visual da água

- Sobreposição em gradiente do azul profundo da marca (de transparente para opaco) para unificar a cor do vídeo com a identidade.
- Água "aparecendo" com o scroll: anime `clip-path: inset(...)` ou a altura de uma máscara de baixo para cima, ligada ao scroll, revelando a filmagem progressivamente.
- Textos sobre a água: sempre com camada de contraste (gradiente escuro ou `backdrop-filter: blur()` leve). Contraste mínimo WCAG AA (4.5:1).
- Sempre tenha uma imagem estática (poster) do primeiro frame para exibir enquanto carrega.

## 6. Padrões de animação

- **Easing:** `power2.out` ou `power3.out` para entradas; `none` para tudo que é `scrub`. Nunca `bounce` ou `elastic`.
- **Entrada de texto:** deslocamento curto (20 a 40px) + opacidade. Nada de giros ou escalas exageradas.
- **Durações:** 0.6s a 1.2s para animações não ligadas ao scroll.
- **Pinning:** use `pin: true` apenas em seções narrativas (no máximo 2 ou 3 na página toda). Sempre teste o `end` para a seção não ficar presa tempo demais.
- **Números:** contadores animados só para dados reais e relevantes (ex.: economia média).
- Anime apenas `transform` e `opacity` (e `clip-path` quando necessário). Nunca anime `width`, `height`, `top`, `left`.

## 7. Desempenho

- Meta: 60 fps em notebook comum e Lighthouse Performance acima de 85.
- Lazy loading de frames, vídeos e imagens abaixo da dobra.
- `will-change` apenas durante a animação, nunca permanente em muitos elementos.
- Pausar trabalho pesado quando a aba estiver oculta (`document.visibilitychange`).

## 8. Mobile e acessibilidade

- Construa mobile primeiro. Em telas pequenas: menos pinning, frames em menor resolução, efeitos mais curtos.
- `prefers-reduced-motion: reduce`: desligue scrub e pinning, mostre o poster estático da água e use apenas fades simples.
- HTML semântico (`header`, `main`, `section`, `h1` único), textos alternativos, foco visível nos botões.

## 9. Fluxo de trabalho obrigatório

1. **Analisar:** leia o projeto existente e extraia cores, fontes, logo e textos. Resuma em poucas linhas.
2. **Propor direção visual antes de codar:** tokens (cores com hex, escala tipográfica, espaçamentos) e, para cada seção, o que acontece no scroll em uma frase. Espere aprovação.
3. **Construir o hero primeiro**, sozinho, e parar para aprovação.
4. **Uma seção por vez**, sempre parando para validação.
5. **Autorrevisão antes de entregar cada etapa:** rode o checklist abaixo e corrija o que falhar antes de dizer que terminou.

## 10. Checklist de qualidade (rodar a cada entrega)

- [ ] Só as cores e fontes da marca foram usadas?
- [ ] Cada seção tem uma única ideia e no máximo um efeito de destaque?
- [ ] A água é filmagem real e o movimento é suave (sem saltos ao rolar rápido ou devagar)?
- [ ] Todo texto sobre vídeo tem contraste suficiente?
- [ ] Funciona bem em 375px de largura?
- [ ] Com `prefers-reduced-motion` ativo, a página continua completa e legível?
- [ ] Nenhum anti-padrão da seção 3 aparece?
- [ ] O resultado parece uma página de produto premium, e não um template?

Se algum item falhar, corrija antes de entregar e explique o que foi ajustado.
