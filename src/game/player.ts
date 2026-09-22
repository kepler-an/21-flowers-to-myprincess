/**
 * El personaje. Un solo verbo: caminar. La colisión es AABB contra una lista
 * de rectángulos sólidos que cada escena declara a mano — con cuatro escenas
 * pequeñas no hace falta un sistema de tiles.
 */
import { keyboardVector, isKeyboardMoving, pointer } from '../core/input'
import { sound } from '../core/audio'
import { WALK_CYCLE, drawCharacter, drawCharacterShadow, type Facing } from './character'

export type Rect = { x: number; y: number; w: number; h: number }

const SPEED = 54
const FOOT_W = 8
const FOOT_H = 5

function overlaps(x: number, y: number, r: Rect): boolean {
  return (
    x - FOOT_W / 2 < r.x + r.w && x + FOOT_W / 2 > r.x && y - FOOT_H < r.y + r.h && y > r.y
  )
}

export class Player {
  x: number
  y: number
  facing: Facing = 'down'
  moving = false
  /** Bloquea el control durante cinemáticas o cuadros de diálogo. */
  frozen = false

  private animT = 0
  private frame = 0
  private stepT = 0

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  /** `pointerTarget` permite caminar hacia el ratón manteniéndolo pulsado. */
  update(dt: number, solids: Rect[], bounds: Rect, pointerTarget?: { x: number; y: number }): void {
    let v = { x: 0, y: 0 }

    if (!this.frozen) {
      if (isKeyboardMoving()) {
        v = keyboardVector()
      } else if (pointer.down && pointerTarget) {
        const dx = pointerTarget.x - this.x
        const dy = pointerTarget.y - this.y
        const d = Math.hypot(dx, dy)
        if (d > 3) v = { x: dx / d, y: dy / d }
      }
    }

    this.moving = v.x !== 0 || v.y !== 0

    if (this.moving) {
      if (Math.abs(v.x) > Math.abs(v.y)) this.facing = v.x > 0 ? 'right' : 'left'
      else this.facing = v.y > 0 ? 'down' : 'up'

      // Resolución por ejes separados: así no nos enganchamos en las esquinas.
      this.moveAxis(v.x * SPEED * dt, 0, solids)
      this.moveAxis(0, v.y * SPEED * dt, solids)

      this.x = Math.max(bounds.x, Math.min(bounds.x + bounds.w, this.x))
      this.y = Math.max(bounds.y, Math.min(bounds.y + bounds.h, this.y))

      this.animT += dt
      this.frame = WALK_CYCLE[Math.floor(this.animT * 7) % WALK_CYCLE.length]

      this.stepT += dt
      if (this.stepT > 0.3) {
        this.stepT = 0
        sound.step()
      }
    } else {
      this.animT = 0
      this.frame = 0
      this.stepT = 0.25
    }
  }

  private moveAxis(dx: number, dy: number, solids: Rect[]): void {
    const nx = this.x + dx
    const ny = this.y + dy
    for (const r of solids) {
      if (overlaps(nx, ny, r)) return
    }
    this.x = nx
    this.y = ny
  }

  /** Rectángulo que ocupa a efectos de "¿estoy cerca de esto?". */
  get foot(): Rect {
    return { x: this.x - FOOT_W / 2, y: this.y - FOOT_H, w: FOOT_W, h: FOOT_H }
  }

  render(ctx: CanvasRenderingContext2D, camX = 0, camY = 0): void {
    drawCharacter(ctx, 'player', this.facing, this.frame, this.x - camX, this.y - camY)
  }

  renderShadow(ctx: CanvasRenderingContext2D, camX = 0, camY = 0): void {
    drawCharacterShadow(ctx, this.x - camX, this.y - camY)
  }
}
