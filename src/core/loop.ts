/**
 * Bucle con paso fijo. La simulación avanza siempre en pasos de 1/60 s, así el
 * movimiento se siente idéntico en una pantalla de 60 Hz y en una de 120 Hz.
 */

const STEP = 1 / 60
const MAX_FRAME = 0.25 // si la pestaña estuvo en segundo plano, no recuperamos

export function startLoop(update: (dt: number) => void, render: () => void): void {
  let last = performance.now() / 1000
  let acc = 0

  const frame = (now: number) => {
    const t = now / 1000
    acc += Math.min(t - last, MAX_FRAME)
    last = t
    while (acc >= STEP) {
      update(STEP)
      acc -= STEP
    }
    render()
    requestAnimationFrame(frame)
  }

  requestAnimationFrame(frame)
}
