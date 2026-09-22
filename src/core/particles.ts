/**
 * Pool fijo de partículas. Nada de asignaciones por frame: las partículas
 * muertas se reutilizan. Suficiente para polen, tierra, pétalos y chispas.
 */

export type Kind = 'pollen' | 'dirt' | 'petal' | 'spark'

type P = {
  alive: boolean
  kind: Kind
  x: number
  y: number
  vx: number
  vy: number
  life: number
  max: number
  color: string
  size: number
  phase: number
}

const MAX = 220
const pool: P[] = Array.from({ length: MAX }, () => ({
  alive: false,
  kind: 'pollen' as Kind,
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  life: 0,
  max: 1,
  color: '#fdf8e7',
  size: 1,
  phase: 0,
}))

let cursor = 0

function take(): P {
  for (let i = 0; i < MAX; i++) {
    const p = pool[(cursor + i) % MAX]
    if (!p.alive) {
      cursor = (cursor + i + 1) % MAX
      return p
    }
  }
  // Pool lleno: reciclamos la más antigua en vez de crecer.
  const p = pool[cursor]
  cursor = (cursor + 1) % MAX
  return p
}

export function emit(
  kind: Kind,
  x: number,
  y: number,
  opts: Partial<Pick<P, 'vx' | 'vy' | 'max' | 'color' | 'size'>> = {},
): void {
  const p = take()
  p.alive = true
  p.kind = kind
  p.x = x
  p.y = y
  p.vx = opts.vx ?? 0
  p.vy = opts.vy ?? 0
  p.max = opts.max ?? 1
  p.life = p.max
  p.color = opts.color ?? '#fdf8e7'
  p.size = opts.size ?? 1
  p.phase = Math.random() * Math.PI * 2
}

/** Estallido de tierra al plantar. */
export function burstDirt(x: number, y: number): void {
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * 2
    const s = 18 + Math.random() * 26
    emit('dirt', x, y, {
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      max: 0.4 + Math.random() * 0.3,
      color: Math.random() < 0.5 ? '#6b4226' : '#3c2317',
    })
  }
}

/** Estallido de pétalos al florecer. */
export function burstPetals(x: number, y: number): void {
  for (let i = 0; i < 12; i++) {
    const a = Math.random() * Math.PI * 2
    const s = 10 + Math.random() * 24
    emit('petal', x, y, {
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s - 14,
      max: 0.9 + Math.random() * 0.7,
      color: Math.random() < 0.6 ? '#f6c945' : '#e0a13c',
    })
  }
}

export function sparkle(x: number, y: number, color = '#f7e3a3'): void {
  for (let i = 0; i < 6; i++) {
    const a = Math.random() * Math.PI * 2
    emit('spark', x, y, {
      vx: Math.cos(a) * 16,
      vy: Math.sin(a) * 16 - 8,
      max: 0.35 + Math.random() * 0.25,
      color,
    })
  }
}

export function updateParticles(dt: number): void {
  for (const p of pool) {
    if (!p.alive) continue
    p.life -= dt
    if (p.life <= 0) {
      p.alive = false
      continue
    }
    p.phase += dt * 3
    switch (p.kind) {
      case 'pollen':
        p.x += p.vx * dt + Math.sin(p.phase) * 4 * dt
        p.y += p.vy * dt
        break
      case 'dirt':
        p.vy += 220 * dt
        p.x += p.vx * dt
        p.y += p.vy * dt
        break
      case 'petal':
        p.vy += 40 * dt
        p.vx *= 0.98
        p.x += p.vx * dt + Math.sin(p.phase * 1.7) * 12 * dt
        p.y += p.vy * dt
        break
      case 'spark':
        p.vx *= 0.92
        p.vy *= 0.92
        p.x += p.vx * dt
        p.y += p.vy * dt
        break
    }
  }
}

export function renderParticles(ctx: CanvasRenderingContext2D): void {
  for (const p of pool) {
    if (!p.alive) continue
    // Las partículas parpadean al morir en vez de desvanecerse: más retro.
    const f = p.life / p.max
    if (f < 0.35 && Math.floor(p.life * 22) % 2 === 0) continue
    ctx.fillStyle = p.color
    ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size)
  }
}

export function clearParticles(): void {
  for (const p of pool) p.alive = false
}

/** Nº de partículas vivas, útil para esperar a que se apague un efecto. */
export function aliveCount(): number {
  let n = 0
  for (const p of pool) if (p.alive) n++
  return n
}
