/**
 * Todo el estado del juego, en un objeto plano. No hace falta más: siete
 * campos cubren la experiencia entera.
 *
 * Se persiste en localStorage al cambiar de escena, para que cerrar la pestaña
 * a mitad no borre el recorrido, y para que una vez terminado el enlace lleve
 * directamente al campo de girasoles.
 */

export type SceneId = 'title' | 'garden' | 'crossing' | 'field' | 'letter'

export type GameState = {
  scene: SceneId
  seeds: number
  found: string[]
  planted: number
  muted: boolean
  completed: boolean
}

const KEY = 'september21.v1'

export const state: GameState = {
  scene: 'title',
  seeds: 0,
  found: [],
  planted: 0,
  muted: false,
  completed: false,
}

export function load(): void {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return
    const saved = JSON.parse(raw) as Partial<GameState>
    Object.assign(state, saved)
    if (!Array.isArray(state.found)) state.found = []
  } catch {
    // Si el almacenamiento falla (modo privado, permisos), se juega sin guardar.
  }
}

export function save(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* sin guardado */
  }
}

export function reset(): void {
  state.scene = 'title'
  state.seeds = 0
  state.found = []
  state.planted = 0
  state.completed = false
  save()
}

export const hasFound = (id: string): boolean => state.found.includes(id)

export function markFound(id: string): void {
  if (!hasFound(id)) state.found.push(id)
}
