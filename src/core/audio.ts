/**
 * Música y efectos sintetizados en tiempo real. Cero archivos de audio: pesa
 * nada, no hay licencias de por medio y la música puede reaccionar al estado
 * del juego (subir de tono cada vez que se planta una semilla, por ejemplo).
 *
 * Una melodía pentatónica lenta, tres voces: melodía (triangular), bajo
 * (seno) y un contracanto que solo aparece en el campo de girasoles.
 */

type Mood = 'silent' | 'garden' | 'crossing' | 'field' | 'letter'

const ROOT = 220 // A3

/** Grados de la escala pentatónica mayor, en semitonos. */
const SCALE = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21]

/** -1 = silencio. Índices sobre SCALE. */
const MELODY = [
  4, 5, 6, 5, 4, 2, 4, -1, 2, 1, 2, 4, 2, 1, 0, -1, 0, 2, 4, 2, 5, 4, 2, -1, 1, 2, 1, 0, -1, -1, -1,
  -1,
]

/** Bajo: una nota cada cuatro pasos. Semitonos relativos a la tónica. */
const BASS = [0, -5, -3, -5, 0, -5, -7, -5]

const MOODS: Record<
  Mood,
  { step: number; gain: number; octave: number; melody: boolean; counter: boolean; sparse: number }
> = {
  silent: { step: 0.3, gain: 0, octave: 0, melody: false, counter: false, sparse: 1 },
  garden: { step: 0.3, gain: 0.5, octave: 0, melody: true, counter: false, sparse: 1 },
  crossing: { step: 0.44, gain: 0.34, octave: -12, melody: true, counter: false, sparse: 2 },
  field: { step: 0.3, gain: 0.55, octave: 0, melody: true, counter: true, sparse: 1 },
  letter: { step: 0.34, gain: 0.5, octave: 0, melody: true, counter: true, sparse: 1 },
}

let actx: AudioContext | null = null
let master: GainNode | null = null
let muted = false

let mood: Mood = 'silent'
let transpose = 0
let step = 0
let nextTime = 0
let timer = 0

const LOOKAHEAD = 0.18

function freq(semitones: number): number {
  return ROOT * Math.pow(2, semitones / 12)
}

function voice(
  when: number,
  hz: number,
  dur: number,
  type: OscillatorType,
  gain: number,
  detune = 0,
): void {
  if (!actx || !master) return
  const osc = actx.createOscillator()
  const env = actx.createGain()
  osc.type = type
  osc.frequency.value = hz
  osc.detune.value = detune
  env.gain.setValueAtTime(0, when)
  env.gain.linearRampToValueAtTime(gain, when + 0.02)
  env.gain.exponentialRampToValueAtTime(0.0001, when + dur)
  osc.connect(env).connect(master)
  osc.start(when)
  osc.stop(when + dur + 0.05)
}

function scheduleStep(when: number): void {
  const m = MOODS[mood]
  if (m.gain <= 0) return

  if (m.melody && step % m.sparse === 0) {
    const idx = MELODY[step % MELODY.length]
    if (idx >= 0) {
      const semis = SCALE[idx] + m.octave + transpose
      voice(when, freq(semis), m.step * 2.2, 'triangle', 0.16 * m.gain)
      if (m.counter) {
        voice(when + 0.06, freq(semis + 12), m.step * 1.4, 'sine', 0.07 * m.gain, 6)
      }
    }
  }

  if (step % 4 === 0) {
    const semis = BASS[Math.floor(step / 4) % BASS.length] + m.octave - 12 + transpose
    voice(when, freq(semis), m.step * 3.4, 'sine', 0.2 * m.gain)
  }

  step = (step + 1) % (MELODY.length * 2)
}

function tick(): void {
  if (!actx) return
  while (nextTime < actx.currentTime + LOOKAHEAD) {
    scheduleStep(nextTime)
    nextTime += MOODS[mood].step
  }
}

/** Debe llamarse desde un gesto del usuario (el PRESS START). */
export function initAudio(): void {
  if (actx) return
  const Ctor = window.AudioContext ?? (window as any).webkitAudioContext
  if (!Ctor) return
  actx = new Ctor()
  master = actx.createGain()
  master.gain.value = muted ? 0 : 0.7
  master.connect(actx.destination)
  nextTime = actx.currentTime + 0.1
  timer = window.setInterval(tick, 40)
}

export function setMood(next: Mood): void {
  mood = next
}

/** Desplaza toda la música en semitonos. El campo lo usa al plantar. */
export function setTranspose(semitones: number): void {
  transpose = semitones
}

export function setMuted(value: boolean): void {
  muted = value
  if (master && actx) {
    master.gain.setTargetAtTime(value ? 0 : 0.7, actx.currentTime, 0.05)
  }
}

export function isMuted(): boolean {
  return muted
}

export function stopAudio(): void {
  if (timer) window.clearInterval(timer)
  timer = 0
}

// ─── Efectos ─────────────────────────────────────────────────────────────────

function sfx(notes: [number, number][], type: OscillatorType = 'square', gain = 0.09): void {
  if (!actx) return
  const t0 = actx.currentTime
  for (const [semis, offset] of notes) {
    voice(t0 + offset, freq(semis), 0.12, type, gain)
  }
}

export const sound = {
  pickup: () => sfx([[24, 0], [28, 0.06]]),
  step: () => sfx([[0, 0]], 'square', 0.015),
  talk: () => sfx([[12, 0]], 'square', 0.04),
  plant: () => sfx([[-12, 0], [7, 0.05]], 'triangle', 0.1),
  bloom: () => sfx([[12, 0], [16, 0.07], [19, 0.14], [24, 0.21]], 'triangle', 0.08),
  start: () => sfx([[0, 0], [7, 0.08], [12, 0.16]], 'square', 0.07),
}
