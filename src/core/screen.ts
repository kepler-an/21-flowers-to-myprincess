/**
 * Resolución interna fija y escalado entero. Todo el juego dibuja en 320x180
 * y el navegador lo amplía por ×N sin interpolar: los píxeles quedan cuadrados
 * y del mismo tamaño en cualquier portátil.
 */
import { LETTERBOX } from '../art/palette'

export const W = 320
export const H = 180

export const canvas = document.getElementById('screen') as HTMLCanvasElement
export const ctx = canvas.getContext('2d', { alpha: false })!

/** Buffer intermedio: algunas escenas lo post-procesan (tinte nocturno). */
export const buffer = document.createElement('canvas')
buffer.width = W
buffer.height = H
export const bctx = buffer.getContext('2d', { alpha: false })!

let scale = 1

export function currentScale(): number {
  return scale
}

function resize(): void {
  const maxW = window.innerWidth
  const maxH = window.innerHeight
  scale = Math.max(1, Math.min(Math.floor(maxW / W), Math.floor(maxH / H)))
  canvas.style.width = `${W * scale}px`
  canvas.style.height = `${H * scale}px`
  ctx.imageSmoothingEnabled = false
  bctx.imageSmoothingEnabled = false
}

export function initScreen(): void {
  document.body.style.background = LETTERBOX
  resize()
  window.addEventListener('resize', resize)
}

/** Vuelca el buffer a la pantalla visible. */
export function present(): void {
  ctx.drawImage(buffer, 0, 0)
}

export function clear(color: string): void {
  bctx.fillStyle = color
  bctx.fillRect(0, 0, W, H)
}

/** Convierte coordenadas de ratón de la ventana a píxeles internos. */
export function toScreenSpace(clientX: number, clientY: number): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect()
  return {
    x: (clientX - rect.left) / scale,
    y: (clientY - rect.top) / scale,
  }
}
