/**
 * PRNG con semilla (mulberry32). Todo lo procedural lo usa, así el jardín se
 * pinta idéntico en cada partida y los retoques a mano son reproducibles.
 */
export function makeRng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export type Rng = () => number

export const randRange = (rng: Rng, min: number, max: number): number => min + rng() * (max - min)
export const randInt = (rng: Rng, min: number, max: number): number =>
  Math.floor(randRange(rng, min, max + 1))
export const pick = <T>(rng: Rng, arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)]
