/**
 * Todo lo orgánico se pinta por código: hierba, árboles, arbustos, piedras,
 * tierra, estrellas. Con una semilla fija sale siempre igual, pero ningún
 * árbol es idéntico a otro — que es justo lo que delata a un tileset repetido.
 *
 * Las escenas lo llaman una sola vez, contra un canvas offscreen.
 */
import { PALETTE } from './palette'
import type { Rng } from '../core/rng'
import { randInt, randRange } from '../core/rng'

const C = PALETTE

export function fill(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string): void {
  ctx.fillStyle = color
  ctx.fillRect(x, y, w, h)
}

const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/**
 * Degradado vertical entre colores de la paleta, con la transición tramada.
 * Es la diferencia entre un cielo con bandas duras y un cielo que respira,
 * sin salirse de los colores que tenemos.
 */
export function paintSkyRamp(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  stops: string[],
): void {
  const rgb = stops.map(hexToRgb)
  const img = ctx.createImageData(w, h)
  const data = img.data
  const last = rgb.length - 1

  for (let j = 0; j < h; j++) {
    const t = (j / Math.max(1, h - 1)) * last
    const i = Math.min(last, Math.floor(t))
    const f = t - i
    const a = rgb[i]
    const b = rgb[Math.min(last, i + 1)]
    for (let px = 0; px < w; px++) {
      const threshold = BAYER4[(px & 3) + (j & 3) * 4] / 16
      const c = f > threshold ? b : a
      const o = (j * w + px) * 4
      data[o] = c[0]
      data[o + 1] = c[1]
      data[o + 2] = c[2]
      data[o + 3] = 255
    }
  }
  ctx.putImageData(img, x, y)
}

/** Borde irregular de 1-3 px, para que dos superficies no choquen en recto. */
export function ragged(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  len: number,
  color: string,
  rng: Rng,
  side: 'top' | 'bottom' | 'left' | 'right',
  depth = 3,
): void {
  ctx.fillStyle = color
  // La profundidad cambia poco a poco: si se sortea entera en cada píxel el
  // borde sale en picos de sierra, que se nota muchísimo.
  let d = randInt(rng, 0, depth)
  for (let i = 0; i < len; i++) {
    d = Math.max(0, Math.min(depth, d + randInt(rng, -1, 1)))
    if (d === 0) continue
    if (side === 'top') ctx.fillRect(x + i, y, 1, d)
    else if (side === 'bottom') ctx.fillRect(x + i, y - d, 1, d)
    else if (side === 'left') ctx.fillRect(x, y + i, d, 1)
    else ctx.fillRect(x - d, y + i, d, 1)
  }
}

/** Césped: base plana + mechones sueltos en dos tonos. */
export function paintGrass(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  rng: Rng,
  density = 0.012,
): void {
  fill(ctx, x, y, w, h, C['6'])

  // Manchas amplias de tono. Redondas y muy tenues: si se recortan en
  // rectángulo se ven los bordes y el césped parece un mosaico.
  ctx.globalAlpha = 0.18
  for (let i = 0; i < (w * h) / 620; i++) {
    ctx.fillStyle = rng() < 0.5 ? C['5'] : C['7']
    ctx.beginPath()
    ctx.ellipse(
      randInt(rng, x, x + w),
      randInt(rng, y, y + h),
      randInt(rng, 7, 20),
      randInt(rng, 4, 10),
      0,
      0,
      Math.PI * 2,
    )
    ctx.fill()
  }
  ctx.globalAlpha = 1

  // Mechones: tres píxeles en V.
  const count = Math.floor(w * h * density)
  for (let i = 0; i < count; i++) {
    const gx = randInt(rng, x, x + w - 3)
    const gy = randInt(rng, y, y + h - 3)
    ctx.fillStyle = rng() < 0.65 ? C['5'] : C['8']
    ctx.fillRect(gx, gy + 1, 1, 2)
    ctx.fillRect(gx + 1, gy, 1, 2)
    ctx.fillRect(gx + 2, gy + 1, 1, 2)
  }
}

/** Camino de tierra. Los bordes se comen a mordiscos, nunca quedan rectos. */
export function paintPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  rng: Rng,
): void {
  fill(ctx, x, y, w, h, C['b'])
  if (w > h) {
    ragged(ctx, x, y, w, C['6'], rng, 'top', 3)
    ragged(ctx, x, y + h, w, C['6'], rng, 'bottom', 3)
  } else {
    ragged(ctx, x, y, h, C['6'], rng, 'left', 3)
    ragged(ctx, x + w, y, h, C['6'], rng, 'right', 3)
  }
  for (let i = 0; i < (w * h) / 40; i++) {
    ctx.fillStyle = rng() < 0.5 ? C['a'] : C['9']
    ctx.fillRect(randInt(rng, x + 1, x + w - 2), randInt(rng, y + 1, y + h - 2), 1, 1)
  }
}

/**
 * Agua oscura. Es lo que corta el camino en la travesía: se entiende de un
 * vistazo que hay que cruzarla, cosa que un agujero negro no conseguía.
 */
export function paintWater(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  rng: Rng,
): void {
  fill(ctx, x, y, w, h, C['2'])
  ctx.globalAlpha = 0.5
  for (let i = 0; i < h / 3; i++) {
    fill(ctx, x, y + randInt(rng, 0, h - 1), w, 1, C['1'])
  }
  ctx.globalAlpha = 1
  ragged(ctx, x, y, w, C['5'], rng, 'top', 3)
  ragged(ctx, x, y + h, w, C['5'], rng, 'bottom', 3)
  ragged(ctx, x, y, h, C['5'], rng, 'left', 4)
  ragged(ctx, x + w, y, h, C['5'], rng, 'right', 4)
}

/** Reflejos del agua: se dibujan en cada frame, con desplazamiento temporal. */
export function drawRipples(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  t: number,
): void {
  ctx.globalAlpha = 0.35
  ctx.fillStyle = C['i']
  for (let i = 0; i < 5; i++) {
    const ry = y + 5 + ((i * h) / 5 + Math.sin(t * 0.6 + i) * 2)
    const rx = x + 6 + ((t * (7 + i * 3) + i * 37) % (w - 26))
    ctx.fillRect(Math.round(rx), Math.round(ry), 7 + (i % 3) * 3, 1)
  }
  ctx.globalAlpha = 1
}

function blob(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string): void {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(Math.round(x), Math.round(y), Math.round(r), 0, Math.PI * 2)
  ctx.fill()
}

/** Árbol: tronco + copa de manchas en tres verdes. (x, y) es la base. */
export function drawTree(ctx: CanvasRenderingContext2D, x: number, y: number, rng: Rng, size = 1): void {
  const trunkH = Math.round(12 * size)
  const trunkW = Math.round(5 * size)
  const crownY = y - trunkH - Math.round(10 * size)
  const r = 10 * size

  // sombra
  ctx.globalAlpha = 0.18
  blob(ctx, x, y, r * 0.75, C['1'])
  ctx.globalAlpha = 1

  fill(ctx, Math.round(x - trunkW / 2), y - trunkH, trunkW, trunkH, C['a'])
  fill(ctx, Math.round(x - trunkW / 2), y - trunkH, 1, trunkH, C['9'])

  const lobes = randInt(rng, 4, 6)
  const pts: [number, number, number][] = []
  for (let i = 0; i < lobes; i++) {
    const a = (i / lobes) * Math.PI * 2 + rng()
    const d = randRange(rng, 0, r * 0.55)
    pts.push([x + Math.cos(a) * d, crownY + Math.sin(a) * d * 0.7, randRange(rng, r * 0.6, r)])
  }
  for (const [px, py, pr] of pts) blob(ctx, px, py, pr, C['4'])
  for (const [px, py, pr] of pts) blob(ctx, px - 1, py - 1.5, pr * 0.82, C['5'])
  for (const [px, py, pr] of pts) blob(ctx, px - 2, py - 3, pr * 0.5, C['6'])
  // brillo superior
  blob(ctx, x - r * 0.35, crownY - r * 0.45, r * 0.28, C['7'])
}

export function drawBush(ctx: CanvasRenderingContext2D, x: number, y: number, rng: Rng, size = 1): void {
  const r = 6 * size
  ctx.globalAlpha = 0.16
  blob(ctx, x, y, r * 0.8, C['1'])
  ctx.globalAlpha = 1
  for (let i = 0; i < 3; i++) {
    blob(ctx, x + randRange(rng, -r * 0.5, r * 0.5), y - r * 0.5 + randRange(rng, -2, 2), randRange(rng, r * 0.6, r), C['5'])
  }
  blob(ctx, x - 1, y - r * 0.8, r * 0.6, C['6'])
  blob(ctx, x - 2, y - r, r * 0.35, C['7'])
}

/** Piedra. En gris terroso: en azul parecían bolsas de plástico. */
export function drawRock(ctx: CanvasRenderingContext2D, x: number, y: number, rng: Rng): void {
  const w = randInt(rng, 6, 11)
  const h = Math.round(w * 0.55)
  ctx.globalAlpha = 0.18
  fill(ctx, x - w / 2, y - 1, w, 2, C['1'])
  ctx.globalAlpha = 1
  fill(ctx, x - w / 2, y - h, w, h, C['9'])
  fill(ctx, x - w / 2 + 1, y - h, w - 2, h - 1, C['3'])
  fill(ctx, x - w / 2 + 2, y - h + 1, w - 5, 1, C['i'])
}

/** Flores pequeñas de fondo, sin interacción. */
export function drawWildflower(ctx: CanvasRenderingContext2D, x: number, y: number, rng: Rng): void {
  const color = rng() < 0.5 ? C['e'] : C['d']
  fill(ctx, x, y - 3, 1, 3, C['5'])
  fill(ctx, x, y - 4, 1, 1, color)
  fill(ctx, x - 1, y - 4, 1, 1, color)
  fill(ctx, x + 1, y - 4, 1, 1, color)
}

/** Tierra arada del campo final. */
export function paintSoil(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  rng: Rng,
): void {
  fill(ctx, x, y, w, h, C['a'])
  for (let i = 0; i < (w * h) / 26; i++) {
    ctx.fillStyle = rng() < 0.55 ? C['9'] : C['b']
    ctx.fillRect(randInt(rng, x, x + w - 1), randInt(rng, y, y + h - 1), randInt(rng, 1, 3), 1)
  }
  // surcos largos, muy tenues
  for (let ry = y + 6; ry < y + h; ry += 11) {
    ctx.globalAlpha = 0.25
    fill(ctx, x, ry, w, 1, C['9'])
    ctx.globalAlpha = 1
  }
  // el terreno no termina en escuadra: la hierba se lo come por los bordes
  ragged(ctx, x, y, w, C['5'], rng, 'top', 4)
  ragged(ctx, x, y + h, w, C['5'], rng, 'bottom', 4)
  ragged(ctx, x, y, h, C['5'], rng, 'left', 5)
  ragged(ctx, x + w, y, h, C['5'], rng, 'right', 5)
}

/** Cielo nocturno con estrellas. Devuelve las estrellas para poder titilarlas. */
export function paintNightSky(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  rng: Rng,
): { x: number; y: number; p: number }[] {
  paintSkyRamp(ctx, x, y, w, h, [C['1'], C['1'], C['1'], C['j'], C['j'], C['2'], C['3']])
  const stars: { x: number; y: number; p: number }[] = []
  for (let i = 0; i < w / 6; i++) {
    stars.push({
      x: randInt(rng, x, x + w),
      y: randInt(rng, y, y + Math.floor(h * 0.75)),
      p: rng() * Math.PI * 2,
    })
  }
  return stars
}

/**
 * Colinas lejanas. Rellenan todo lo que queda por debajo hasta `bottom`: si
 * solo se dibuja la curva, entre dos capas se cuela el cielo y parece un fallo.
 */
export function drawHills(
  ctx: CanvasRenderingContext2D,
  y: number,
  w: number,
  color: string,
  rng: Rng,
  amp = 8,
  bottom?: number,
): void {
  ctx.fillStyle = color
  let hx = -10
  while (hx < w + 20) {
    const r = randInt(rng, 16, 34)
    const lift = randRange(rng, amp * 0.3, amp)
    ctx.beginPath()
    ctx.arc(hx, y + r - lift, r, Math.PI, Math.PI * 2)
    ctx.fill()
    hx += Math.round(r * 1.15)
  }
  ctx.fillRect(0, y, w, Math.max(4, (bottom ?? y + 4) - y))
}
