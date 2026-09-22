/**
 * Escena 3 · El terreno.
 *
 * Aquí el juego deja de disimular, pero todavía sin decir nada: hay veintiún
 * surcos vacíos y resulta que ella lleva veintiuna semillas encima. La cuenta
 * la hace sola.
 */
import type { Scene } from '../core/scene'
import { scenes } from '../core/scene'
import { W, H } from '../core/screen'
import { PALETTE } from '../art/palette'
import { drawSprite, drawSpriteAt } from '../art/atlas'
import { paintSoil, drawHills, paintGrass, drawWildflower, fill, paintSkyRamp } from '../art/terrain'
import { makeRng, randInt, randRange } from '../core/rng'
import { takeAction, pointer } from '../core/input'
import { setMood, setTranspose, sound } from '../core/audio'
import {
  burstDirt,
  burstPetals,
  emit,
  updateParticles,
  renderParticles,
  clearParticles,
} from '../core/particles'
import { nightTint, warmWash, light } from '../core/fx'
import { Player } from '../game/player'
import { Companion } from '../game/companion'
import { state, save } from '../game/state'
import { drawSeedCounter, drawHint, drawMuteMark } from '../game/ui'
import { content } from '../content'

const COLS = 7
const ROWS = 3
const FIELD_X = 34
const FIELD_Y = 104
const COL_GAP = 42
const ROW_GAP = 30

/** Segundos que tarda una semilla en llegar a girasol abierto. */
const GROW = 3.8
const STAGE_AT = [0, 0.45, 1.25, 2.1, 2.9, 3.5]

type Plot = { x: number; y: number; planted: boolean; t: number; sway: number; bloomed: boolean }

export class FieldScene implements Scene {
  private bg = document.createElement('canvas')
  private player = new Player(W / 2, 168)
  private friend = new Companion(W / 2 - 16, 170)
  private plots: Plot[] = []
  private far: { x: number; y: number; p: number }[] = []
  private t = 0
  private hintT = 6
  private dawn = 0
  private doneT = -1
  private leaving = false

  constructor(private skipToBloom = false) {}

  enter(): void {
    setMood('field')
    setTranspose(0)
    clearParticles()
    this.build()

    if (this.skipToBloom) {
      for (const p of this.plots) {
        p.planted = true
        p.t = GROW + 2
        p.bloomed = true
      }
      this.dawn = 1
      // Quien vuelve al enlace ve el campo entero unos segundos antes de que
      // vuelva la carta. No se le hace repetir nada.
      this.doneT = 0
      this.hintT = 0
    } else if (state.planted > 0) {
      // Partida retomada: los surcos que ya plantó siguen plantados.
      for (let i = 0; i < Math.min(state.planted, this.plots.length); i++) {
        const p = this.plots[i]
        p.planted = true
        p.t = GROW + 2
        p.bloomed = true
      }
      setTranspose(Math.min(7, Math.floor(state.planted / 3)))
    }
  }

  private build(): void {
    this.bg.width = W
    this.bg.height = H
    const ctx = this.bg.getContext('2d')!
    const rng = makeRng(2109)

    // Cielo de amanecer, todavía frío: lo calienta `dawn` en tiempo real.
    paintSkyRamp(ctx, 0, 0, W, 78, [
      PALETTE['1'],
      PALETTE['2'],
      PALETTE['3'],
      PALETTE['i'],
      PALETTE['c'],
    ])
    drawHills(ctx, 62, W, PALETTE['j'], rng, 10, 84)
    drawHills(ctx, 74, W, PALETTE['4'], rng, 7, 84)

    paintGrass(ctx, 0, 84, W, H - 84, rng, 0.004)
    ctx.globalAlpha = 0.4
    fill(ctx, 0, 84, W, H - 84, PALETTE['5'])
    ctx.globalAlpha = 1

    paintSoil(ctx, 18, 96, W - 36, 78, rng)
    for (let i = 0; i < 26; i++) drawWildflower(ctx, randInt(rng, 4, W - 4), randInt(rng, 86, 96), rng)

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const i = r * COLS + c
        if (i >= content.seedCount) continue
        this.plots.push({
          x: FIELD_X + c * COL_GAP + (r % 2 === 1 ? 6 : 0),
          y: FIELD_Y + r * ROW_GAP,
          planted: false,
          t: 0,
          sway: rng() * Math.PI * 2,
          bloomed: false,
        })
      }
    }

    // Girasoles lejanos: el campo continúa más allá de lo que se juega.
    for (let i = 0; i < 34; i++) {
      this.far.push({ x: randInt(rng, -4, W), y: randInt(rng, 86, 98), p: rng() * Math.PI * 2 })
    }
  }

  private get planted(): number {
    return this.plots.filter((p) => p.planted).length
  }

  private nearestPlot(): Plot | null {
    let best: Plot | null = null
    let bestD = 20
    for (const p of this.plots) {
      if (p.planted) continue
      const d = Math.hypot(p.x - this.player.x, p.y - this.player.y)
      if (d < bestD) {
        best = p
        bestD = d
      }
    }
    return best
  }

  update(dt: number): void {
    this.t += dt
    this.hintT -= dt
    updateParticles(dt)

    const action = takeAction()
    this.player.frozen = this.doneT >= 0
    this.player.update(dt, [], { x: 20, y: 96, w: W - 40, h: 76 }, { x: pointer.x, y: pointer.y })
    this.friend.update(dt, this.player.x, this.player.y)

    if (action && state.seeds > 0) {
      const plot = this.nearestPlot()
      if (plot) {
        plot.planted = true
        plot.t = 0
        state.seeds--
        state.planted++
        save()
        sound.plant()
        burstDirt(plot.x, plot.y)
        // Cada tres semillas la música sube un grado. Al final ha subido una
        // quinta entera sin que se note el truco.
        setTranspose(Math.min(7, Math.floor(state.planted / 3)))
      }
    }

    for (const p of this.plots) {
      if (!p.planted) continue
      p.t += dt
      if (!p.bloomed && p.t >= GROW) {
        p.bloomed = true
        burstPetals(p.x, p.y - 20)
        if (this.plots.filter((q) => q.bloomed).length % 4 === 1) sound.bloom()
      }
    }

    // El amanecer llega con la última semilla, no antes.
    const allPlanted = this.planted >= this.plots.length
    if (allPlanted) this.dawn = Math.min(1, this.dawn + dt * 0.35)

    const allBloomed = this.plots.every((p) => p.bloomed)
    if (allBloomed && this.doneT < 0) {
      this.doneT = 0
      state.completed = true
      save()
    }
    if (this.doneT >= 0) {
      this.doneT += dt
      if (this.doneT > 2.4 && !this.leaving) {
        this.leaving = true
        state.scene = 'letter'
        save()
        void import('./LetterScene').then((m) => scenes.go(() => new m.LetterScene(), '#f6c945'))
      }
    }

    // Polen dorado, cada vez más denso conforme florece el campo.
    if (Math.random() < dt * (2 + this.plots.filter((p) => p.bloomed).length * 0.5)) {
      emit('pollen', randRange(Math.random, 0, W), randRange(Math.random, 90, H), {
        vx: randRange(Math.random, -4, 12),
        vy: randRange(Math.random, -11, -4),
        max: randRange(Math.random, 2.5, 5),
        color: Math.random() < 0.5 ? PALETTE['e'] : PALETTE['d'],
      })
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.drawImage(this.bg, 0, 0)

    // Girasoles del fondo: solo aparecen cuando el campo ya está florecido.
    if (this.dawn > 0.05) {
      ctx.globalAlpha = Math.min(1, this.dawn)
      for (const f of this.far) {
        const sway = Math.sin(this.t * 0.9 + f.p) * 1
        drawSpriteAt(ctx, 'sunflower.far', Math.round(f.x + sway), f.y - 10)
      }
      ctx.globalAlpha = 1
    }

    const drawables = this.plots.map((p) => ({
      y: p.y,
      draw: () => {
        if (!p.planted) {
          drawSprite(ctx, 'furrow', p.x, p.y + 2)
          return
        }
        let stage = 0
        while (stage < 5 && p.t >= STAGE_AT[stage + 1]) stage++
        const sway = p.bloomed ? Math.sin(this.t * 1.1 + p.sway) * 1.2 : 0
        drawSprite(ctx, `sunflower.${stage}`, p.x + sway, p.y + 4)
      },
    }))

    drawables.push({
      y: this.friend.y,
      draw: () => {
        this.friend.renderShadow(ctx)
        this.friend.render(ctx)
      },
    })
    drawables.push({
      y: this.player.y,
      draw: () => {
        this.player.renderShadow(ctx)
        this.player.render(ctx)
      },
    })
    drawables.sort((a, b) => a.y - b.y)
    for (const d of drawables) d.draw()

    renderParticles(ctx)

    // El farol de la travesía sigue ahí, en el borde del terreno.
    drawSpriteAt(ctx, 'lantern', 18, 74)
    light(ctx, 23, 80, 15, 0.5 * (1 - this.dawn * 0.7))

    // Noche que se retira / sol que entra.
    nightTint(ctx, 0.55 * (1 - this.dawn))
    warmWash(ctx, this.dawn)

    const plot = this.nearestPlot()
    if (plot && state.seeds > 0 && this.doneT < 0) {
      const bob = Math.sin(this.t * 4) * 1.5
      ctx.fillStyle = PALETTE['f']
      ctx.fillRect(Math.round(plot.x), Math.round(plot.y - 14 + bob), 1, 3)
      ctx.fillRect(Math.round(plot.x - 1), Math.round(plot.y - 11 + bob), 3, 1)
    }

    drawSeedCounter(ctx, state.seeds)
    // Arriba, no abajo: el jugador se pasa la escena caminando por abajo.
    drawHint(ctx, content.field.prompt, this.hintT / 2, 88)
    drawMuteMark(ctx, state.muted)
  }
}
