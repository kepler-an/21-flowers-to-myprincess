/**
 * Escena 1 · El jardín.
 *
 * Luz de tarde, un jardín cerrado, ocho semillas entre la hierba y cinco
 * objetos que dicen una línea cada uno. Nada aquí debe insinuar de qué va
 * el juego: es, deliberadamente, un jueguito bonito y sin más.
 */
import type { Scene } from '../core/scene'
import { scenes } from '../core/scene'
import { W, H } from '../core/screen'
import { PALETTE } from '../art/palette'
import { drawSprite, drawSpriteAt } from '../art/atlas'
import {
  paintGrass,
  paintPath,
  drawTree,
  drawBush,
  drawWildflower,
  fill,
} from '../art/terrain'
import { makeRng, randInt, randRange } from '../core/rng'
import { takeAction, pointer } from '../core/input'
import { setMood, sound } from '../core/audio'
import { emit, sparkle, updateParticles, renderParticles, clearParticles } from '../core/particles'
import { Player, type Rect } from '../game/player'
import { Companion } from '../game/companion'
import { state, save, markFound, hasFound } from '../game/state'
import { Dialog, drawSeedCounter, drawHint, drawInteractMark, drawMuteMark } from '../game/ui'
import { content } from '../content'

const WORLD_W = 480
const WORLD_H = 252

/** Las ocho semillas del jardín. El resto (13) están en la travesía. */
const SEEDS: [number, number][] = [
  [70, 132],
  [150, 192],
  [112, 228],
  [192, 114],
  [262, 232],
  [330, 122],
  [362, 212],
  [412, 152],
]

type Prop = {
  id: string
  sprite: string
  x: number
  y: number
  text?: string
  /** Distancia a la que se puede interactuar. */
  reach?: number
}

const PROPS: Prop[] = [
  { id: 'sign', sprite: 'sign', x: 216, y: 208, text: content.garden.sign },
  { id: 'bench', sprite: 'bench', x: 152, y: 152, text: content.garden.bench },
  { id: 'cat', sprite: 'cat', x: 256, y: 128, text: content.garden.cat },
  { id: 'mailbox', sprite: 'mailbox', x: 302, y: 144, text: content.garden.mailbox },
  { id: 'can', sprite: 'can', x: 116, y: 220, text: content.garden.can },
]

export class GardenScene implements Scene {
  private bg = document.createElement('canvas')
  private player = new Player(204, 196)
  private friend = new Companion(190, 198)
  private dialog = new Dialog()
  private seeds = SEEDS.map(([x, y]) => ({ x, y, taken: false, p: Math.random() * 6 }))
  private solids: Rect[] = []
  private t = 0
  private pollenT = 0
  private leaving = false
  private hintT = 0

  enter(): void {
    setMood('garden')
    clearParticles()
    this.hintT = 4.5
    this.buildWorld()
    // Si ya había semillas guardadas, no las volvemos a repartir.
    const already = Math.min(state.seeds, this.seeds.length)
    for (let i = 0; i < already; i++) this.seeds[i].taken = true
  }

  private buildWorld(): void {
    this.bg.width = WORLD_W
    this.bg.height = WORLD_H
    const ctx = this.bg.getContext('2d')!
    const rng = makeRng(730921)

    paintGrass(ctx, 0, 0, WORLD_W, WORLD_H, rng)

    // Camino: del centro del jardín a la verja del este.
    paintPath(ctx, 198, 178, WORLD_W - 198, 12, rng)
    paintPath(ctx, 198, 122, 12, 66, rng)

    // Verja: postes con dos travesaños, con un hueco al este.
    const gateGap: [number, number] = [166, 200]
    this.fence(ctx, rng, gateGap)

    // Árboles del borde superior y las esquinas.
    const trees: [number, number, number][] = [
      [40, 108, 1.1],
      [96, 100, 0.9],
      [168, 96, 1.15],
      [248, 100, 0.95],
      [322, 96, 1.1],
      [398, 104, 0.9],
      [446, 132, 1.0],
      [34, 198, 1.0],
      [30, 248, 0.95],
      [124, 250, 1.05],
      [232, 252, 0.9],
      [350, 250, 1.0],
      [440, 236, 1.05],
    ]
    for (const [x, y, s] of trees) {
      drawTree(ctx, x, y, rng, s)
      this.solids.push({ x: x - 6, y: y - 5, w: 12, h: 6 })
    }

    for (let i = 0; i < 14; i++) {
      const bx = randInt(rng, 36, WORLD_W - 36)
      const by = randInt(rng, 118, WORLD_H - 16)
      if (Math.abs(by - 183) < 20 && bx > 190) continue // no tapar el camino
      // Un arbusto encima de una semilla la dejaría inalcanzable y el juego
      // no se podría terminar nunca. Ante la duda, no se pone el arbusto.
      if (SEEDS.some(([sx, sy]) => Math.hypot(sx - bx, sy - by) < 18)) continue
      if (PROPS.some((p) => Math.hypot(p.x - bx, p.y - by) < 20)) continue
      drawBush(ctx, bx, by, rng, randRange(rng, 0.8, 1.2))
      this.solids.push({ x: bx - 5, y: by - 4, w: 10, h: 5 })
    }

    for (let i = 0; i < 70; i++) {
      drawWildflower(ctx, randInt(rng, 28, WORLD_W - 28), randInt(rng, 114, WORLD_H - 8), rng)
    }

    // Sólidos de los objetos con volumen.
    this.solids.push({ x: 140, y: 146, w: 24, h: 7 })
    this.solids.push({ x: 298, y: 138, w: 8, h: 7 })
    this.solids.push({ x: 212, y: 202, w: 8, h: 7 })
  }

  private fence(ctx: CanvasRenderingContext2D, rng: ReturnType<typeof makeRng>, gap: [number, number]): void {
    const post = (x: number, y: number) => {
      fill(ctx, x, y - 16, 3, 16, PALETTE['b'])
      fill(ctx, x, y - 16, 1, 16, PALETTE['a'])
      fill(ctx, x, y - 17, 3, 1, PALETTE['a'])
    }
    const railH = (x0: number, x1: number, y: number) => {
      fill(ctx, x0, y - 12, x1 - x0, 2, PALETTE['b'])
      fill(ctx, x0, y - 7, x1 - x0, 2, PALETTE['b'])
    }
    const railV = (y0: number, y1: number, x: number) => {
      fill(ctx, x, y0, 2, y1 - y0, PALETTE['b'])
      fill(ctx, x + 5, y0, 2, y1 - y0, PALETTE['b'])
    }

    const top = 104
    railH(20, WORLD_W - 20, top)
    for (let x = 20; x < WORLD_W - 20; x += 22) post(x, top)

    railV(104, WORLD_H, 20)
    railV(104, gap[0], WORLD_W - 26)
    railV(gap[1], WORLD_H, WORLD_W - 26)
    for (let y = 104; y < WORLD_H; y += 22) {
      post(20, y + 16)
      if (y + 16 < gap[0] || y > gap[1]) post(WORLD_W - 26, y + 16)
    }
    // sombra bajo la verja
    ctx.globalAlpha = 0.12
    fill(ctx, 20, top, WORLD_W - 40, 2, PALETTE['1'])
    ctx.globalAlpha = 1
    void rng
  }

  private get camera(): { x: number; y: number } {
    return {
      x: Math.max(0, Math.min(WORLD_W - W, Math.round(this.player.x - W / 2))),
      y: Math.max(0, Math.min(WORLD_H - H, Math.round(this.player.y - H / 2 - 8))),
    }
  }

  update(dt: number): void {
    this.t += dt
    this.hintT -= dt
    this.dialog.update(dt)
    updateParticles(dt)

    const action = takeAction()
    if (this.dialog.open) {
      if (action) this.dialog.advance()
      this.player.frozen = true
      return
    }
    this.player.frozen = this.leaving

    const cam = this.camera
    this.player.update(
      dt,
      this.solids,
      { x: 26, y: 114, w: WORLD_W - 56, h: WORLD_H - 132 },
      { x: pointer.x + cam.x, y: pointer.y + cam.y },
    )
    this.friend.update(dt, this.player.x, this.player.y)

    // Semillas: se recogen al pasar por encima, sin pulsar nada.
    for (const s of this.seeds) {
      if (s.taken) continue
      if (Math.hypot(s.x - this.player.x, s.y - this.player.y) < 9) {
        s.taken = true
        state.seeds++
        save()
        sound.pickup()
        sparkle(s.x, s.y - 3)
      }
    }

    // Objetos: pulsar acción estando cerca.
    if (action) {
      const near = this.nearestProp()
      if (near?.text) {
        this.dialog.show(near.text)
        markFound(near.id)
        save()
      }
    }

    // Verja.
    if (!this.leaving && this.player.x > WORLD_W - 42 && this.player.y > 162 && this.player.y < 204) {
      if (this.remaining === 0) {
        this.leaving = true
        state.scene = 'crossing'
        save()
        void import('./CrossingScene').then((m) => scenes.go(() => new m.CrossingScene()))
      } else if (action || !hasFound('gate')) {
        markFound('gate')
        this.dialog.show(content.garden.gateLocked)
        this.player.x = WORLD_W - 42
      }
    }

    // Polen: dos o tres motas por segundo, dentro de cámara.
    this.pollenT -= dt
    if (this.pollenT <= 0) {
      this.pollenT = 0.35
      emit('pollen', randRange(makeRandom(), cam.x, cam.x + W), randRange(makeRandom(), cam.y + 20, cam.y + H), {
        vx: randRange(makeRandom(), -6, 10),
        vy: randRange(makeRandom(), -9, -3),
        max: randRange(makeRandom(), 2.4, 4.5),
        color: PALETTE['e'],
      })
    }

    // Las semillas que quedan llaman la atención pasado un rato.
    if (this.t > 14 && Math.random() < dt * 0.9) {
      const pending = this.seeds.filter((s) => !s.taken)
      if (pending.length) {
        const s = pending[Math.floor(Math.random() * pending.length)]
        emit('spark', s.x + randRange(makeRandom(), -2, 2), s.y - 4, {
          vy: -10,
          max: 0.6,
          color: PALETTE['f'],
        })
      }
    }
  }

  private get remaining(): number {
    return this.seeds.filter((s) => !s.taken).length
  }

  private nearestProp(): Prop | null {
    let best: Prop | null = null
    let bestD = Infinity
    for (const p of PROPS) {
      const d = Math.hypot(p.x - this.player.x, p.y - 4 - this.player.y)
      if (d < (p.reach ?? 22) && d < bestD) {
        best = p
        bestD = d
      }
    }
    return best
  }

  render(ctx: CanvasRenderingContext2D): void {
    const cam = this.camera
    ctx.drawImage(this.bg, -cam.x, -cam.y)

    // Semillas en el suelo, con un latido muy leve.
    for (const s of this.seeds) {
      if (s.taken) continue
      const bob = Math.sin(this.t * 2 + s.p) * 0.6
      drawSpriteAt(ctx, 'seed', s.x - cam.x - 3, s.y - cam.y - 6 + bob)
    }

    // Todo lo que pisa el suelo se ordena por Y para que se tape bien.
    const drawables: { y: number; draw: () => void }[] = PROPS.map((p) => ({
      y: p.y,
      draw: () => drawSprite(ctx, p.sprite, p.x - cam.x, p.y - cam.y),
    }))
    drawables.push({
      y: this.player.y,
      draw: () => {
        this.player.renderShadow(ctx, cam.x, cam.y)
        this.player.render(ctx, cam.x, cam.y)
      },
    })
    drawables.push({
      y: this.friend.y,
      draw: () => {
        this.friend.renderShadow(ctx, cam.x, cam.y)
        this.friend.render(ctx, cam.x, cam.y)
      },
    })
    drawables.sort((a, b) => a.y - b.y)
    for (const d of drawables) d.draw()

    renderParticles(ctx)

    const near = this.dialog.open ? null : this.nearestProp()
    if (near) drawInteractMark(ctx, near.x - cam.x, near.y - cam.y - 26)

    drawSeedCounter(ctx, state.seeds)
    drawHint(ctx, content.title.hint, this.hintT / 1.5)
    this.dialog.render(ctx)
    drawMuteMark(ctx, state.muted)
  }
}

/** Fuente de azar sin semilla para lo puramente decorativo. */
const makeRandom = () => Math.random
