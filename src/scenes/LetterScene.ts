/**
 * Escena 4 · La carta.
 *
 * El campo se queda vivo detrás, para siempre. Delante aparece la fecha y el
 * mensaje, línea a línea. No hay botones, ni "volver a jugar", ni nada que
 * invite a cerrar la pestaña.
 */
import type { Scene } from '../core/scene'
import { W, H } from '../core/screen'
import { PALETTE } from '../art/palette'
import { drawSpriteAt } from '../art/atlas'
import { drawTextCentered, LINE_H, textWidth } from '../art/font'
import { paintGrass, drawHills, fill, paintSkyRamp } from '../art/terrain'
import { makeRng, randRange } from '../core/rng'
import { setMood } from '../core/audio'
import { emit, updateParticles, renderParticles, clearParticles } from '../core/particles'
import { warmWash } from '../core/fx'
import { state } from '../game/state'
import { drawMuteMark } from '../game/ui'
import { content } from '../content'

/** Ritmo de aparición del texto, en segundos. */
const DATE_AT = 1.2
const FIRST_LINE_AT = 2.6
const LINE_GAP = 1.15
const CHARS_PER_SEC = 26

type Flower = { x: number; y: number; scale: number; p: number }

export class LetterScene implements Scene {
  private bg = document.createElement('canvas')
  private flowers: Flower[] = []
  private t = 0

  enter(): void {
    setMood('letter')
    clearParticles()
    this.build()
    this.publishAccessibleCopy()
  }

  exit(): void {
    const overlay = document.getElementById('overlay')
    if (overlay) overlay.textContent = ''
  }

  /** El texto también existe como HTML, para poder leerlo y copiarlo. */
  private publishAccessibleCopy(): void {
    const overlay = document.getElementById('overlay')
    if (!overlay) return
    const { date, lines, signature, coda } = content.letter
    overlay.textContent = [date, ...lines, signature, coda].filter(Boolean).join('\n')
  }

  private build(): void {
    this.bg.width = W
    this.bg.height = H
    const ctx = this.bg.getContext('2d')!
    const rng = makeRng(919)

    // Cielo cálido de mañana.
    paintSkyRamp(ctx, 0, 0, W, 76, [PALETTE['c'], PALETTE['d'], PALETTE['e'], PALETTE['f']])
    // sol bajo, apenas insinuado
    ctx.fillStyle = PALETTE['f']
    ctx.beginPath()
    ctx.arc(W - 58, 40, 12, 0, Math.PI * 2)
    ctx.fill()

    drawHills(ctx, 62, W, PALETTE['6'], rng, 9, 82)
    drawHills(ctx, 72, W, PALETTE['5'], rng, 7, 82)
    paintGrass(ctx, 0, 78, W, H - 78, rng, 0.01)
    ctx.globalAlpha = 0.25
    fill(ctx, 0, 78, W, H - 78, PALETTE['5'])
    ctx.globalAlpha = 1

    // Campo lleno: seis filas, en perspectiva. Las dos del fondo con la flor
    // pequeña, las de delante con la grande, y todas con su propio desorden.
    const ROWS = 6
    for (let row = 0; row < ROWS; row++) {
      const y = 90 + row * 20
      const count = row < 2 ? 15 : 8 + row
      for (let i = 0; i < count; i++) {
        this.flowers.push({
          x: -10 + (i * (W + 20)) / (count - 1) + randRange(rng, -9, 9),
          y: y + randRange(rng, -2, 2),
          scale: row < 2 ? 0.5 : 1,
          p: rng() * Math.PI * 2,
        })
      }
    }
    this.flowers.sort((a, b) => a.y - b.y)
  }

  /** Placa oscura detrás de una línea, para que se lea sobre el campo. */
  private plate(ctx: CanvasRenderingContext2D, text: string, y: number): void {
    if (!text) return
    const w = textWidth(text) + 6
    ctx.save()
    ctx.globalAlpha *= 0.76
    ctx.fillStyle = PALETTE['9']
    ctx.fillRect(Math.round(W / 2 - w / 2), y - 2, w, LINE_H)
    ctx.restore()
  }

  update(dt: number): void {
    this.t += dt
    updateParticles(dt)

    // Pétalos sueltos, constantes pero escasos.
    if (Math.random() < dt * 2.2) {
      emit('petal', randRange(Math.random, -10, W), randRange(Math.random, 80, H - 10), {
        vx: randRange(Math.random, 6, 22),
        vy: randRange(Math.random, -14, -4),
        max: randRange(Math.random, 3, 6),
        color: Math.random() < 0.5 ? PALETTE['d'] : PALETTE['e'],
      })
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.drawImage(this.bg, 0, 0)

    for (const f of this.flowers) {
      const sway = Math.sin(this.t * 0.9 + f.p) * (1 + f.scale)
      if (f.scale < 1) {
        drawSpriteAt(ctx, 'sunflower.far', Math.round(f.x + sway), Math.round(f.y - 10))
      } else {
        drawSpriteAt(ctx, 'sunflower.5', Math.round(f.x + sway - 8), Math.round(f.y - 24))
      }
    }

    renderParticles(ctx)
    warmWash(ctx, 0.26)

    // El campo se ve entero detrás, sin velo encima: cada línea de texto
    // lleva su propia placa oscura. Se lee perfecto y el campo sigue vivo.
    const { date, lines, signature, coda } = content.letter
    const block = lines.length * LINE_H
    const top = Math.round((H - block) / 2) + 6

    if (this.t > DATE_AT) {
      const a = Math.min(1, (this.t - DATE_AT) * 1.4)
      ctx.save()
      ctx.globalAlpha = a
      this.plate(ctx, date, top - 26)
      drawTextCentered(ctx, date, W / 2, top - 26, { color: PALETTE['d'], shadow: PALETTE['9'] })
      // subrayado que se abre desde el centro
      const uw = Math.round(64 * a)
      ctx.fillStyle = PALETTE['c']
      ctx.fillRect(Math.round(W / 2 - uw / 2), top - 14, uw, 1)
      ctx.restore()
    }

    for (let i = 0; i < lines.length; i++) {
      const at = FIRST_LINE_AT + i * LINE_GAP
      if (this.t < at) break
      if (!lines[i]) continue
      const reveal = Math.min(lines[i].length, (this.t - at) * CHARS_PER_SEC)
      // La placa se dibuja al ancho completo desde el principio: si creciera
      // con el texto, la línea bailaría al escribirse.
      this.plate(ctx, lines[i], top + i * LINE_H)
      drawTextCentered(ctx, lines[i], W / 2, top + i * LINE_H, {
        color: PALETTE['f'],
        shadow: PALETTE['1'],
        reveal,
      })
    }

    const afterLines = FIRST_LINE_AT + lines.length * LINE_GAP

    if (signature && this.t > afterLines + 0.6) {
      ctx.save()
      ctx.globalAlpha = Math.min(1, (this.t - afterLines - 0.6) * 1.2)
      this.plate(ctx, signature, top + block + 6)
      drawTextCentered(ctx, signature, W / 2, top + block + 6, { color: PALETTE['e'] })
      ctx.restore()
    }

    if (coda && this.t > afterLines + 2.2) {
      const pulse = 0.45 + 0.35 * Math.sin(this.t * 1.1)
      ctx.save()
      ctx.globalAlpha = Math.min(1, (this.t - afterLines - 2.2) * 0.6) * pulse
      this.plate(ctx, coda, H - 16)
      drawTextCentered(ctx, coda, W / 2, H - 16, { color: PALETTE['e'] })
      ctx.restore()
    }

    drawMuteMark(ctx, state.muted)
  }
}
