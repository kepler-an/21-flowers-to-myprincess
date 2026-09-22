/**
 * Un único input para todo el juego. Las escenas no saben si el jugador usa
 * teclado o ratón: piden un vector de movimiento y si se ha pulsado "acción".
 */
import { toScreenSpace } from './screen'

const held = new Set<string>()
let actionQueued = false
let anyQueued = false

export const pointer = { x: 0, y: 0, down: false, moved: false }

const MOVE_KEYS: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  KeyA: [-1, 0],
  KeyD: [1, 0],
  KeyW: [0, -1],
  KeyS: [0, 1],
}

const ACTION_KEYS = new Set(['Space', 'Enter', 'KeyE', 'KeyZ', 'NumpadEnter'])

export function initInput(onMute: () => void): void {
  window.addEventListener('keydown', (e) => {
    if (e.repeat) {
      if (MOVE_KEYS[e.code]) e.preventDefault()
      return
    }
    held.add(e.code)
    if (MOVE_KEYS[e.code] || ACTION_KEYS.has(e.code)) e.preventDefault()
    if (ACTION_KEYS.has(e.code)) actionQueued = true
    if (e.code === 'KeyM') onMute()
    anyQueued = true
  })

  window.addEventListener('keyup', (e) => held.delete(e.code))
  window.addEventListener('blur', () => held.clear())

  window.addEventListener('pointermove', (e) => {
    const p = toScreenSpace(e.clientX, e.clientY)
    pointer.x = p.x
    pointer.y = p.y
    pointer.moved = true
  })
  window.addEventListener('pointerdown', (e) => {
    const p = toScreenSpace(e.clientX, e.clientY)
    pointer.x = p.x
    pointer.y = p.y
    pointer.down = true
    actionQueued = true
    anyQueued = true
  })
  window.addEventListener('pointerup', () => {
    pointer.down = false
  })
  window.addEventListener('contextmenu', (e) => e.preventDefault())
}

/** Vector de teclado, ya normalizado. (0,0) si no hay nada pulsado. */
export function keyboardVector(): { x: number; y: number } {
  let x = 0
  let y = 0
  for (const code of held) {
    const v = MOVE_KEYS[code]
    if (v) {
      x += v[0]
      y += v[1]
    }
  }
  if (x === 0 && y === 0) return { x: 0, y: 0 }
  const len = Math.hypot(x, y)
  return { x: x / len, y: y / len }
}

export function isKeyboardMoving(): boolean {
  for (const code of held) if (MOVE_KEYS[code]) return true
  return false
}

/** Consume la pulsación de acción: devuelve true una sola vez por pulsación. */
export function takeAction(): boolean {
  if (!actionQueued) return false
  actionQueued = false
  return true
}

/** Igual, pero para "cualquier tecla" (pantalla de título). */
export function takeAny(): boolean {
  if (!anyQueued) return false
  anyQueued = false
  return true
}

export function clearQueued(): void {
  actionQueued = false
  anyQueued = false
}
