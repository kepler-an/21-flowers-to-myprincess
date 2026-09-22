/**
 * Efectos de pantalla completa, todos a resolución interna para que se vean
 * pixelados de verdad y no como un filtro moderno encima.
 */
import { W, H } from './screen'
import { NIGHT_TINT } from '../art/palette'

// Matriz de Bayer 8x8: la transición no es un fundido a negro, es un disuelto
// por umbral ordenado, como en los juegos de la época.
const BAYER = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28,
  52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7,
  39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21,
]

const patterns = new Map<string, CanvasPattern>()

function dissolvePattern(ctx: CanvasRenderingContext2D, level: number, color: string): CanvasPattern {
  const key = `${level}|${color}`
  const cached = patterns.get(key)
  if (cached) return cached
  const cv = document.createElement('canvas')
  cv.width = 8
  cv.height = 8
  const c = cv.getContext('2d')!
  c.fillStyle = color
  for (let i = 0; i < 64; i++) {
    if (BAYER[i] < level) c.fillRect(i % 8, Math.floor(i / 8), 1, 1)
  }
  const pattern = ctx.createPattern(cv, 'repeat')!
  patterns.set(key, pattern)
  return pattern
}

/** amount 0 = nada, 1 = pantalla completamente cubierta de `color`. */
export function dissolve(ctx: CanvasRenderingContext2D, amount: number, color = '#0e1018'): void {
  const level = Math.round(Math.max(0, Math.min(1, amount)) * 64)
  if (level <= 0) return
  if (level >= 64) {
    ctx.fillStyle = color
    ctx.fillRect(0, 0, W, H)
    return
  }
  ctx.fillStyle = dissolvePattern(ctx, level, color)
  ctx.fillRect(0, 0, W, H)
}

/** Oscurece el frame hacia el azul nocturno. 0 = día pleno, 1 = noche cerrada. */
export function nightTint(ctx: CanvasRenderingContext2D, amount: number): void {
  if (amount <= 0) return
  const a = Math.min(1, amount)
  const mix = (c: number) => Math.round(255 - (255 - c) * a)
  ctx.save()
  ctx.globalCompositeOperation = 'multiply'
  ctx.fillStyle = `rgb(${mix(NIGHT_TINT.r)},${mix(NIGHT_TINT.g)},${mix(NIGHT_TINT.b)})`
  ctx.fillRect(0, 0, W, H)
  ctx.restore()
}

/**
 * Halo de luz cálida. Se dibuja como anillos concéntricos de 1px en aditivo:
 * a escala ×4 los escalones se ven, que es justo lo que queremos.
 */
export function light(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  strength = 0.5,
  color = '255,220,140',
): void {
  if (radius <= 0) return
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  const steps = 6
  for (let i = steps; i >= 1; i--) {
    const r = (radius * i) / steps
    ctx.fillStyle = `rgba(${color},${(strength / steps) * (1 - (i - 1) / steps + 0.35)})`
    ctx.beginPath()
    ctx.arc(Math.round(x), Math.round(y), Math.round(r), 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

/** Barrido horizontal de luz cálida, para el amanecer del campo. */
export function warmWash(ctx: CanvasRenderingContext2D, amount: number): void {
  if (amount <= 0) return
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  ctx.fillStyle = `rgba(246,201,69,${0.16 * amount})`
  ctx.fillRect(0, 0, W, H)
  ctx.restore()
}
