/**
 * Pantalla de título. Noche, unas siluetas de girasoles abajo y nada más.
 * No promete nada: parece el principio de un juego pequeño, y eso es lo que
 * tiene que parecer.
 */
import type { Scene } from '../core/scene'
import { scenes } from '../core/scene'
import { W, H } from '../core/screen'
import { drawTextCentered } from '../art/font'
import { sprite } from '../art/atlas'
import { PALETTE } from '../art/palette'
import { paintNightSky, drawHills } from '../art/terrain'
import { makeRng, randInt, randRange } from '../core/rng'
import { takeAny, clearQueued } from '../core/input'
import { initAudio, setMood, sound } from '../core/audio'
import { light } from '../core/fx'
import { state, save } from '../game/state'
import { content } from '../content'
import { drawMuteMark } from '../game/ui'

type Star = { x: number; y: number; p: number }
type Silhouette = { x: number; y: number; scale: number; sway: number }

export class TitleScene implements Scene {
  private bg = document.createElement('canvas')
  private stars: Star[] = []
  private flowers: Silhouette[] = []
  private fireflies: { x: number; y: number; p: number; sp: number }[] = []
  private t = 0
  private leaving = false

  enter(): void {
    setMood('silent')
    clearQueued()

    this.bg.width = W
    this.bg.height = H
    const ctx = this.bg.getContext('2d')!
    const rng = makeRng(20250921)

    this.stars = paintNightSky(ctx, 0, 0, W, H, rng)
    // Las colinas van en púrpura oscuro, no en negro: si el fondo fuera negro
    // las siluetas de las flores desaparecerían dentro de él.
    drawHills(ctx, H - 58, W, PALETTE['2'], rng, 9, H)
    drawHills(ctx, H - 44, W, PALETTE['j'], rng, 12, H)

    // Girasoles en silueta: la misma flor que aparece al final del juego,
    // en negro. Dos filas, la de delante al doble de tamaño.
    for (let i = 0; i < 11; i++) {
      this.flowers.push({
        x: -8 + (i * (W + 16)) / 10 + randRange(rng, -6, 6),
        y: H - randInt(rng, 30, 40),
        scale: 1,
        sway: rng() * Math.PI * 2,
      })
    }
    for (let i = 0; i < 5; i++) {
      this.flowers.push({
        x: -10 + (i * (W + 20)) / 4 + randRange(rng, -10, 10),
        y: H + randInt(rng, 2, 10),
        scale: 2,
        sway: rng() * Math.PI * 2,
      })
    }

    for (let i = 0; i < 9; i++) {
      this.fireflies.push({
        x: randRange(rng, 0, W),
        y: randRange(rng, H - 70, H - 20),
        p: rng() * Math.PI * 2,
        sp: randRange(rng, 0.25, 0.6),
      })
    }
  }

  update(dt: number): void {
    this.t += dt
    for (const f of this.fireflies) {
      f.p += dt * f.sp
      f.x += Math.cos(f.p * 1.7) * 7 * dt
      f.y += Math.sin(f.p) * 5 * dt
    }

    if (!this.leaving && this.t > 0.6 && takeAny()) {
      this.leaving = true
      initAudio()
      sound.start()
      state.scene = state.completed ? 'field' : 'garden'
      save()
      // Import perezoso para no cargar las escenas grandes en el arranque.
      void (state.completed
        ? import('./FieldScene').then((m) => scenes.go(() => new m.FieldScene(true)))
        : import('./GardenScene').then((m) => scenes.go(() => new m.GardenScene())))
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.drawImage(this.bg, 0, 0)

    for (const s of this.stars) {
      const tw = 0.55 + 0.45 * Math.sin(this.t * 1.6 + s.p)
      ctx.globalAlpha = tw
      ctx.fillStyle = tw > 0.85 ? PALETTE['f'] : PALETTE['h']
      ctx.fillRect(s.x, s.y, 1, 1)
    }
    ctx.globalAlpha = 1

    // Girasoles en silueta, con un vaivén lentísimo.
    for (const f of this.flowers) {
      const lean = Math.sin(this.t * 0.5 + f.sway) * 1.5
      const s = sprite('sunflower.dark')
      const w = s.w * f.scale
      const h = s.h * f.scale
      ctx.drawImage(s.canvas, Math.round(f.x + lean - w / 2), Math.round(f.y - h), w, h)
    }

    for (const f of this.fireflies) {
      const glow = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(f.p * 2.4))
      light(ctx, f.x, f.y, 5, 0.5 * glow)
      ctx.globalAlpha = glow
      ctx.fillStyle = PALETTE['e']
      ctx.fillRect(Math.round(f.x), Math.round(f.y), 1, 1)
      ctx.globalAlpha = 1
    }

    // Título a doble escala: el mismo bitmap, solo que ×2.
    ctx.save()
    ctx.scale(2, 2)
    drawTextCentered(ctx, content.title.name, W / 4, 15, {
      color: PALETTE['d'],
      shadow: PALETTE['9'],
    })
    ctx.restore()

    drawTextCentered(ctx, content.title.subtitle, W / 2, 56, { color: PALETTE['h'] })

    if (!this.leaving && Math.floor(this.t * 1.6) % 2 === 0) {
      drawTextCentered(ctx, content.title.start, W / 2, 90, {
        color: PALETTE['f'],
        shadow: PALETTE['9'],
      })
    }

    if (this.t > 5 && !this.leaving) {
      ctx.globalAlpha = Math.min(0.55, (this.t - 5) * 0.4)
      drawTextCentered(ctx, content.title.hint, W / 2, 106, { color: PALETTE['h'] })
      ctx.globalAlpha = 1
    }

    drawMuteMark(ctx, state.muted)
  }
}
