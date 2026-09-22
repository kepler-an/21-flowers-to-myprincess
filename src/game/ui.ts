/**
 * Interfaz mínima: una caja de diálogo, un contador y algún aviso que se
 * desvanece. Nada más aparece en pantalla en todo el juego.
 *
 * El contador nunca muestra el objetivo (dice "7", no "7/21"): el número 21
 * solo debe cobrar sentido al final.
 */
import { drawText, drawTextCentered, LINE_H, wrapText, textWidth } from '../art/font'
import { drawSpriteAt } from '../art/atlas'
import { PALETTE } from '../art/palette'
import { W, H } from '../core/screen'
import { sound } from '../core/audio'

const BOX_X = 14
const BOX_W = W - 28
const PAD = 7
const CHARS_PER_SEC = 45

export class Dialog {
  private lines: string[] = []
  private t = 0
  private total = 0
  open = false

  show(text: string): void {
    this.lines = text
      .split('\n')
      .flatMap((line) => wrapText(line, BOX_W - PAD * 2))
      .slice(0, 3)
    this.total = this.lines.reduce((n, l) => n + l.length, 0)
    this.t = 0
    this.open = true
    sound.talk()
  }

  close(): void {
    this.open = false
    this.lines = []
  }

  get finished(): boolean {
    return this.t * CHARS_PER_SEC >= this.total
  }

  /** Devuelve true si el diálogo se ha cerrado con esta pulsación. */
  advance(): boolean {
    if (!this.open) return false
    if (!this.finished) {
      this.t = this.total / CHARS_PER_SEC
      return false
    }
    this.close()
    return true
  }

  update(dt: number): void {
    if (this.open) this.t += dt
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.open) return
    const h = PAD * 2 + this.lines.length * LINE_H - 2
    const y = H - h - 12

    ctx.fillStyle = PALETTE['1']
    ctx.fillRect(BOX_X, y, BOX_W, h)
    ctx.fillStyle = PALETTE['e']
    ctx.fillRect(BOX_X, y, BOX_W, 1)
    ctx.fillRect(BOX_X, y + h - 1, BOX_W, 1)
    ctx.fillRect(BOX_X, y, 1, h)
    ctx.fillRect(BOX_X + BOX_W - 1, y, 1, h)
    // esquinas mordidas: el borde no se cierra del todo, como en los RPG
    ctx.fillStyle = PALETTE['1']
    ctx.fillRect(BOX_X, y, 1, 1)
    ctx.fillRect(BOX_X + BOX_W - 1, y, 1, 1)
    ctx.fillRect(BOX_X, y + h - 1, 1, 1)
    ctx.fillRect(BOX_X + BOX_W - 1, y + h - 1, 1, 1)

    let budget = Math.floor(this.t * CHARS_PER_SEC)
    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i]
      drawText(ctx, line, BOX_X + PAD, y + PAD + i * LINE_H, {
        color: PALETTE['f'],
        reveal: budget,
      })
      budget -= line.length
      if (budget <= 0) break
    }

    if (this.finished) {
      // flechita parpadeante
      const blink = Math.floor(performance.now() / 380) % 2 === 0
      if (blink) {
        ctx.fillStyle = PALETTE['d']
        const ax = BOX_X + BOX_W - 8
        const ay = y + h - 6
        ctx.fillRect(ax, ay, 3, 1)
        ctx.fillRect(ax + 1, ay + 1, 1, 1)
      }
    }
  }
}

export function drawSeedCounter(ctx: CanvasRenderingContext2D, seeds: number, alpha = 1): void {
  if (seeds <= 0) return
  ctx.save()
  ctx.globalAlpha = alpha
  drawSpriteAt(ctx, 'seed', W - 26, 7)
  drawText(ctx, String(seeds), W - 17, 7, { color: PALETTE['f'], shadow: PALETTE['1'] })
  ctx.restore()
}

/** Aviso que aparece centrado abajo y se desvanece solo. */
export function drawHint(
  ctx: CanvasRenderingContext2D,
  text: string,
  alpha: number,
  y = H - 20,
): void {
  if (alpha <= 0.01) return
  ctx.save()
  ctx.globalAlpha = Math.min(1, alpha)
  drawTextCentered(ctx, text, W / 2, y, { color: PALETTE['e'], shadow: PALETTE['1'] })
  ctx.restore()
}

/** Indicador sobre un objeto al que se puede hablar/recoger. */
export function drawInteractMark(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  const bob = Math.sin(performance.now() / 220) * 1.5
  ctx.fillStyle = PALETTE['f']
  ctx.fillRect(Math.round(x), Math.round(y + bob), 1, 3)
  ctx.fillRect(Math.round(x), Math.round(y + bob + 4), 1, 1)
}

export function drawMuteMark(ctx: CanvasRenderingContext2D, muted: boolean): void {
  if (!muted) return
  ctx.save()
  ctx.globalAlpha = 0.55
  drawText(ctx, 'M', 7, H - 14, { color: PALETTE['h'] })
  ctx.restore()
}

export { textWidth }
