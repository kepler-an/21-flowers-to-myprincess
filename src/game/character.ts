/**
 * Lo que comparten los dos personajes: el ciclo de caminar, cómo se elige el
 * fotograma según hacia dónde miran, y la sombrita bajo los pies.
 */
import { drawSprite } from '../art/atlas'

export type Facing = 'down' | 'up' | 'left' | 'right'

/** Reposo, paso, reposo, paso contrario. */
export const WALK_CYCLE = [0, 1, 0, 2]

export function drawCharacter(
  ctx: CanvasRenderingContext2D,
  set: string,
  facing: Facing,
  frame: number,
  x: number,
  y: number,
): void {
  const dir = facing === 'left' ? 'side-left' : facing === 'right' ? 'side' : facing
  drawSprite(ctx, `${set}.${dir}.${frame}`, x, y)
}

/** Sombra ovalada de dos tonos, dibujada a mano para que no se vea borrosa. */
export function drawCharacterShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
): void {
  ctx.save()
  ctx.globalAlpha = 0.22
  ctx.fillStyle = '#0e1018'
  ctx.fillRect(Math.round(x - 4), Math.round(y - 2), 8, 2)
  ctx.fillRect(Math.round(x - 3), Math.round(y - 3), 6, 1)
  ctx.restore()
}

/** Dirección dominante de un desplazamiento. */
export function facingFrom(dx: number, dy: number, fallback: Facing): Facing {
  if (dx === 0 && dy === 0) return fallback
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left'
  return dy > 0 ? 'down' : 'up'
}
