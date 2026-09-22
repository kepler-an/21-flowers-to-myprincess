/**
 * El acompañante. No se controla: va detrás, pisando exactamente por donde
 * ella ha pasado.
 *
 * Funciona con un rastro de migas de pan. Cada vez que ella se mueve un par
 * de píxeles se guarda el punto; él camina hacia el punto que queda a cierta
 * distancia hacia atrás en ese rastro. Cuando ella se para, el rastro deja de
 * crecer y él se detiene a la misma distancia en lugar de encimársele.
 */
import { WALK_CYCLE, drawCharacter, drawCharacterShadow, facingFrom, type Facing } from './character'

/** Cuánto camino le saca ella, en píxeles. */
const GAP = 15
/** Resolución del rastro. */
const STEP = 2
const MAX_POINTS = 48

type Point = { x: number; y: number }

export class Companion {
  x: number
  y: number
  facing: Facing = 'down'

  private trail: Point[] = []
  private frame = 0
  private animT = 0

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  update(dt: number, px: number, py: number): void {
    const last = this.trail[this.trail.length - 1]
    if (!last || Math.hypot(px - last.x, py - last.y) >= STEP) {
      this.trail.push({ x: px, y: py })
      if (this.trail.length > MAX_POINTS) this.trail.shift()
    }

    // Retrocedemos por el rastro hasta acumular GAP píxeles de camino.
    let walked = 0
    let target: Point | null = null
    for (let i = this.trail.length - 1; i > 0; i--) {
      walked += Math.hypot(this.trail[i].x - this.trail[i - 1].x, this.trail[i].y - this.trail[i - 1].y)
      if (walked >= GAP) {
        target = this.trail[i - 1]
        break
      }
    }

    // Todavía no hay rastro suficiente: se queda donde está.
    if (!target) {
      this.animT = 0
      this.frame = 0
      return
    }

    const dx = target.x - this.x
    const dy = target.y - this.y
    if (Math.hypot(dx, dy) < 0.4) {
      this.animT = 0
      this.frame = 0
      return
    }

    const k = Math.min(1, dt * 14)
    this.x += dx * k
    this.y += dy * k
    this.facing = facingFrom(dx, dy, this.facing)

    this.animT += dt
    this.frame = WALK_CYCLE[Math.floor(this.animT * 7) % WALK_CYCLE.length]
  }

  /** Lo coloca de golpe, sin rastro previo (al entrar en una escena). */
  place(x: number, y: number): void {
    this.x = x
    this.y = y
    this.trail.length = 0
  }

  render(ctx: CanvasRenderingContext2D, camX = 0, camY = 0): void {
    drawCharacter(ctx, 'friend', this.facing, this.frame, this.x - camX, this.y - camY)
  }

  renderShadow(ctx: CanvasRenderingContext2D, camX = 0, camY = 0): void {
    drawCharacterShadow(ctx, this.x - camX, this.y - camY)
  }
}
