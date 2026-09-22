/**
 * Hornea los sprites (datos de texto) a canvas offscreen una sola vez, en el
 * arranque. A partir de ahí dibujar es un drawImage, sin coste por píxel.
 */
import { PALETTE } from './palette'
import type { Sprite } from './sprites'
import * as S from './sprites'

export type Baked = { canvas: HTMLCanvasElement; w: number; h: number }

const cache = new Map<string, Baked>()

export function bakeSprite(rows: Sprite): Baked {
  const h = rows.length
  const w = Math.max(...rows.map((r) => r.length))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  for (let y = 0; y < h; y++) {
    const row = rows[y]
    for (let x = 0; x < row.length; x++) {
      const ch = row[x]
      if (ch === '.') continue
      const color = PALETTE[ch]
      if (!color) continue
      ctx.fillStyle = color
      ctx.fillRect(x, y, 1, 1)
    }
  }
  return { canvas, w, h }
}

function mirror(src: Baked): Baked {
  const canvas = document.createElement('canvas')
  canvas.width = src.w
  canvas.height = src.h
  const ctx = canvas.getContext('2d')!
  ctx.translate(src.w, 0)
  ctx.scale(-1, 1)
  ctx.drawImage(src.canvas, 0, 0)
  return { canvas, w: src.w, h: src.h }
}

/** Misma silueta, un solo color. La pantalla de título la usa para las flores. */
function tinted(rows: Sprite, color: string): Baked {
  const flat = rows.map((row) => row.replace(/[^.]/g, 'X'))
  const h = flat.length
  const w = Math.max(...flat.map((r) => r.length))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = color
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < flat[y].length; x++) {
      if (flat[y][x] === 'X') ctx.fillRect(x, y, 1, 1)
    }
  }
  return { canvas, w, h }
}

function put(key: string, rows: Sprite): Baked {
  const baked = bakeSprite(rows)
  cache.set(key, baked)
  return baked
}

let ready = false

/** Llamar una vez antes del primer frame. Cuesta ~3 ms. */
export function bakeAll(): void {
  if (ready) return

  for (const [name, set] of [
    ['player', S.PLAYER],
    ['friend', S.COMPANION],
  ] as const) {
    for (const [key, rows] of Object.entries(set)) {
      const baked = put(`${name}.${key}`, rows)
      if (key.startsWith('side.')) {
        cache.set(`${name}.side-left.${key.split('.')[1]}`, mirror(baked))
      }
    }
  }

  put('seed', S.SEED)
  put('cat', S.CAT)
  put('kitten', S.KITTEN)
  put('zzz', S.ZZZ)
  put('bench', S.BENCH)
  put('sign', S.SIGN)
  put('mailbox', S.MAILBOX)
  put('can', S.CAN)
  put('lantern', S.LANTERN)
  put('step', S.STONE_STEP)
  put('furrow', S.FURROW)
  put('sunflower.far', S.SUNFLOWER_FAR)
  S.SUNFLOWER.forEach((rows, i) => put(`sunflower.${i}`, rows))
  cache.set('sunflower.dark', tinted(S.SUNFLOWER[5], PALETTE['1']))
  cache.set('sunflower.far.dark', tinted(S.SUNFLOWER_FAR, PALETTE['1']))

  ready = true
}

export function sprite(key: string): Baked {
  const baked = cache.get(key)
  if (!baked) throw new Error(`sprite desconocido: ${key}`)
  return baked
}

/** Dibuja con el origen en el centro-base del sprite (los pies / el suelo). */
export function drawSprite(
  ctx: CanvasRenderingContext2D,
  key: string,
  x: number,
  y: number,
): void {
  const s = sprite(key)
  ctx.drawImage(s.canvas, Math.round(x - s.w / 2), Math.round(y - s.h))
}

/** Dibuja con el origen en la esquina superior izquierda. */
export function drawSpriteAt(
  ctx: CanvasRenderingContext2D,
  key: string,
  x: number,
  y: number,
): void {
  const s = sprite(key)
  ctx.drawImage(s.canvas, Math.round(x), Math.round(y))
}
