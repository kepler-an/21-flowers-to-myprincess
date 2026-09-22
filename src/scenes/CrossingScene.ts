/**
 * Escena 2 · La travesía.
 *
 * La distancia, sin decir la palabra. Un tramo largo hacia el este mientras
 * el atardecer cae a noche de forma continua, y una luz cálida en el borde
 * derecho que durante casi todo el camino no parece acercarse (está dibujada
 * en el horizonte, no en el mundo, hasta el último tramo).
 *
 * No hay ni una línea de diálogo en toda la escena, a propósito.
 */
import type { Scene } from '../core/scene'
import { scenes } from '../core/scene'
import { W, H } from '../core/screen'
import { PALETTE } from '../art/palette'
import { drawSpriteAt } from '../art/atlas'
import {
  drawHills,
  paintGrass,
  drawBush,
  drawWildflower,
  fill,
  paintSkyRamp,
  paintWater,
  drawRipples,
  ragged,
} from '../art/terrain'
import { makeRng, randInt, randRange } from '../core/rng'
import { pointer } from '../core/input'
import { setMood, sound } from '../core/audio'
import { emit, sparkle, updateParticles, renderParticles, clearParticles } from '../core/particles'
import { nightTint, light } from '../core/fx'
import { Player, type Rect } from '../game/player'
import { Companion } from '../game/companion'
import { state, save } from '../game/state'
import { drawSeedCounter, drawHint, drawMuteMark } from '../game/ui'
import { content } from '../content'

const WORLD_W = 1440
const GROUND_TOP = 128
const BAND_TOP = 138
const BAND_H = 34

/** Trece semillas: 8 del jardín + 13 = 21. */
const SEED_COUNT = 13

/** Tramos oscuros donde el camino solo aparece al acercarte. */
const GAPS: [number, number][] = [
  [430, 530],
  [740, 850],
  [1060, 1170],
]

type Step = { x: number; y: number; reveal: number }
type Firefly = { x: number; y: number; p: number; sp: number; home: number }

export class CrossingScene implements Scene {
  private bg = document.createElement('canvas')
  private player = new Player(30, 158)
  private friend = new Companion(14, 158)
  private stars: { x: number; y: number; p: number }[] = []
  private steps: Step[] = []
  private fireflies: Firefly[] = []
  private seeds: { x: number; y: number; taken: boolean }[] = []
  private solids: Rect[] = []
  private t = 0
  private hintT = 5
  private leaving = false

  enter(): void {
    setMood('crossing')
    clearParticles()
    this.build()
    // Al retomar una partida a medias, damos por recogidas las que ya tenía.
    const already = Math.max(0, Math.min(state.seeds - 8, this.seeds.length))
    for (let i = 0; i < already; i++) this.seeds[i].taken = true
  }

  private build(): void {
    this.bg.width = WORLD_W
    this.bg.height = H
    const ctx = this.bg.getContext('2d')!
    const rng = makeRng(210921)

    // Cielo de atardecer. El tinte nocturno lo apagará progresivamente.
    paintSkyRamp(ctx, 0, 0, WORLD_W, GROUND_TOP, [
      PALETTE['2'],
      PALETTE['3'],
      PALETTE['i'],
      PALETTE['c'],
      PALETTE['g'],
    ])

    for (let i = 0; i < WORLD_W / 7; i++) {
      this.stars.push({
        x: randInt(rng, 0, WORLD_W),
        y: randInt(rng, 2, GROUND_TOP - 40),
        p: rng() * Math.PI * 2,
      })
    }

    drawHills(ctx, GROUND_TOP - 24, WORLD_W, PALETTE['j'], rng, 11, GROUND_TOP)
    drawHills(ctx, GROUND_TOP - 11, WORLD_W, PALETTE['4'], rng, 8, GROUND_TOP)

    // Franja de suelo: hierba oscura, más apagada que la del jardín.
    paintGrass(ctx, 0, GROUND_TOP, WORLD_W, H - GROUND_TOP, rng, 0.006)
    ctx.globalAlpha = 0.45
    fill(ctx, 0, GROUND_TOP, WORLD_W, H - GROUND_TOP, PALETTE['4'])
    ctx.globalAlpha = 1
    ragged(ctx, 0, GROUND_TOP, WORLD_W, PALETTE['5'], rng, 'top', 3)

    // Los tramos que cortan el camino: agua oscura, cruzable por piedras.
    for (const [x0, x1] of GAPS) {
      paintWater(ctx, x0, GROUND_TOP + 2, x1 - x0, H - GROUND_TOP - 2, rng)
      // Piedras: se dibujan encima en tiempo real, según se revelan.
      const n = Math.round((x1 - x0) / 22)
      for (let i = 0; i < n; i++) {
        this.steps.push({
          x: x0 + 12 + (i * (x1 - x0 - 20)) / Math.max(1, n - 1),
          y: BAND_TOP + BAND_H * 0.55 + randRange(rng, -4, 4),
          reveal: 0,
        })
      }
    }

    for (let i = 0; i < 28; i++) {
      const bx = randInt(rng, 40, WORLD_W - 120)
      if (GAPS.some(([a, b]) => bx > a - 14 && bx < b + 14)) continue
      const by = rng() < 0.5 ? randInt(rng, GROUND_TOP + 2, BAND_TOP - 2) : randInt(rng, BAND_TOP + BAND_H, H - 2)
      drawBush(ctx, bx, by, rng, randRange(rng, 0.7, 1.1))
      if (by < BAND_TOP) this.solids.push({ x: bx - 5, y: by - 4, w: 10, h: 5 })
    }
    for (let i = 0; i < 90; i++) {
      const fx2 = randInt(rng, 10, WORLD_W - 60)
      if (GAPS.some(([a, b]) => fx2 > a - 10 && fx2 < b + 10)) continue
      drawWildflower(ctx, fx2, randInt(rng, GROUND_TOP + 4, H - 4), rng)
    }

    // Semillas repartidas por el camino. Si una cae en un tramo oscuro se
    // empuja al otro lado: tienen que ser exactamente trece, sin excepción.
    for (let i = 0; i < SEED_COUNT; i++) {
      let x = 90 + (i * (WORLD_W - 260)) / SEED_COUNT + randRange(rng, -18, 18)
      for (const [a, b] of GAPS) {
        if (x > a - 16 && x < b + 16) x = b + 20
      }
      this.seeds.push({
        x: Math.min(x, WORLD_W - 110),
        y: BAND_TOP + randRange(rng, 6, BAND_H - 6),
        taken: false,
      })
    }

    // Luciérnagas: viven cerca de los tramos oscuros.
    for (const [x0, x1] of GAPS) {
      for (let i = 0; i < 7; i++) {
        const home = randRange(rng, x0 - 20, x1 + 20)
        this.fireflies.push({
          x: home,
          y: randRange(rng, BAND_TOP - 16, BAND_TOP + BAND_H),
          p: rng() * Math.PI * 2,
          sp: randRange(rng, 0.4, 0.9),
          home,
        })
      }
    }
  }

  /** 0 al empezar, 1 al llegar al farol. */
  private get progress(): number {
    return Math.max(0, Math.min(1, (this.player.x - 60) / (WORLD_W - 220)))
  }

  private get camX(): number {
    return Math.max(0, Math.min(WORLD_W - W, Math.round(this.player.x - W / 2)))
  }

  update(dt: number): void {
    this.t += dt
    this.hintT -= dt
    updateParticles(dt)

    this.player.frozen = this.leaving
    this.player.update(
      dt,
      this.solids,
      { x: 16, y: BAND_TOP - 6, w: WORLD_W - 40, h: BAND_H + 4 },
      { x: pointer.x + this.camX, y: pointer.y },
    )
    this.friend.update(dt, this.player.x, this.player.y)

    for (const s of this.seeds) {
      if (s.taken) continue
      if (Math.hypot(s.x - this.player.x, s.y - this.player.y) < 10) {
        s.taken = true
        state.seeds++
        save()
        sound.pickup()
        sparkle(s.x, s.y - 3, PALETTE['e'])
      }
    }

    // Las piedras se revelan cuando te acercas, no antes.
    for (const st of this.steps) {
      const d = Math.abs(st.x - this.player.x)
      const want = d < 70 ? 1 : 0
      const before = st.reveal
      st.reveal += (want - st.reveal) * Math.min(1, dt * 3.2)
      if (before < 0.4 && st.reveal >= 0.4) {
        emit('spark', st.x, st.y - 2, { vy: -12, max: 0.5, color: PALETTE['e'] })
      }
    }

    // Las luciérnagas se dejan arrastrar un poco por el jugador.
    for (const f of this.fireflies) {
      f.p += dt * f.sp
      const pull = Math.max(0, 1 - Math.abs(f.home - this.player.x) / 110)
      f.x += (this.player.x + 14 - f.x) * pull * dt * 0.5 + Math.cos(f.p * 1.6) * 9 * dt
      f.y += Math.sin(f.p) * 7 * dt
      f.y = Math.max(BAND_TOP - 24, Math.min(BAND_TOP + BAND_H + 4, f.y))
    }

    if (!this.leaving && this.player.x > WORLD_W - 70) {
      this.leaving = true
      state.scene = 'field'
      save()
      sound.bloom()
      void import('./FieldScene').then((m) => scenes.go(() => new m.FieldScene(), '#0e1018'))
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    const cam = this.camX
    const p = this.progress
    ctx.drawImage(this.bg, -cam, 0)

    // Estrellas: aparecen conforme cae la noche.
    if (p > 0.15) {
      const a = Math.min(1, (p - 0.15) * 1.8)
      for (const s of this.stars) {
        const sx = s.x - cam
        if (sx < -2 || sx > W + 2) continue
        ctx.globalAlpha = a * (0.5 + 0.5 * Math.sin(this.t * 1.5 + s.p))
        ctx.fillStyle = PALETTE['h']
        ctx.fillRect(sx, s.y, 1, 1)
      }
      ctx.globalAlpha = 1
    }

    // Reflejos del agua, solo en los tramos que se ven.
    for (const [x0, x1] of GAPS) {
      if (x1 - cam < -20 || x0 - cam > W + 20) continue
      drawRipples(ctx, x0 - cam, GROUND_TOP + 2, x1 - x0, H - GROUND_TOP - 2, this.t)
    }

    // Piedras del camino.
    for (const st of this.steps) {
      if (st.reveal < 0.02) continue
      const sx = st.x - cam
      if (sx < -20 || sx > W + 20) continue
      ctx.globalAlpha = Math.min(1, st.reveal)
      drawSpriteAt(ctx, 'step', sx - 7, st.y - 6)
      ctx.globalAlpha = 1
    }

    for (const s of this.seeds) {
      if (s.taken) continue
      const sx = s.x - cam
      if (sx < -10 || sx > W + 10) continue
      drawSpriteAt(ctx, 'seed', sx - 3, s.y - 6)
    }

    // Él siempre detrás: se dibuja primero para que ella quede delante.
    this.friend.renderShadow(ctx, cam, 0)
    this.friend.render(ctx, cam, 0)
    this.player.renderShadow(ctx, cam, 0)
    this.player.render(ctx, cam, 0)

    renderParticles(ctx)

    // El farol: casi todo el camino vive en el horizonte (sin parallax, no se
    // acerca). Solo en el último tramo pasa a ser un objeto del mundo.
    const anchored = Math.max(0, Math.min(1, (this.player.x - (WORLD_W - 420)) / 300))
    const lampWorldX = WORLD_W - 46
    const lampX = anchored * (lampWorldX - cam) + (1 - anchored) * (W - 26)
    const lampY = 120 - anchored * 4

    nightTint(ctx, p * 0.92)

    light(ctx, lampX, lampY, 10 + anchored * 26, 0.55 + anchored * 0.4)
    if (anchored > 0.55) {
      const a = (anchored - 0.55) / 0.45
      ctx.globalAlpha = Math.min(1, a)
      drawSpriteAt(ctx, 'lantern', lampX - 5, lampY - 14)
      ctx.globalAlpha = 1
    } else {
      ctx.fillStyle = PALETTE['f']
      ctx.fillRect(Math.round(lampX), Math.round(lampY), 1, 1)
      ctx.fillStyle = PALETTE['d']
      ctx.fillRect(Math.round(lampX) - 1, Math.round(lampY), 3, 1)
      ctx.fillRect(Math.round(lampX), Math.round(lampY) - 1, 1, 3)
    }

    // Luciérnagas: se dibujan después del tinte para que iluminen de verdad.
    for (const f of this.fireflies) {
      const sx = f.x - cam
      if (sx < -10 || sx > W + 10) continue
      const glow = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(f.p * 2.6))
      light(ctx, sx, f.y, 6, 0.55 * glow)
      ctx.globalAlpha = glow
      ctx.fillStyle = PALETTE['e']
      ctx.fillRect(Math.round(sx), Math.round(f.y), 1, 1)
      ctx.globalAlpha = 1
    }

    drawSeedCounter(ctx, state.seeds)
    drawHint(ctx, content.crossing.prompt, this.hintT / 2)
    drawMuteMark(ctx, state.muted)
  }
}
