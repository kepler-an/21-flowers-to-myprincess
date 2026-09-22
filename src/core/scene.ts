import { dissolve } from './fx'
import { clearQueued } from './input'

export interface Scene {
  enter?(): void
  exit?(): void
  update(dt: number): void
  render(ctx: CanvasRenderingContext2D): void
}

type Factory = () => Scene

const OUT = 0.45
const IN = 0.45

/**
 * Gestor de escenas con transición de disuelto pixelado. Es todo el "motor"
 * de navegación que necesita el juego: una escena activa y, como mucho, una
 * pendiente.
 */
export class SceneManager {
  private current: Scene | null = null
  private pending: Factory | null = null
  private phase: 'idle' | 'out' | 'in' = 'idle'
  private t = 0
  private color = '#0e1018'

  start(factory: Factory): void {
    this.current = factory()
    this.current.enter?.()
    this.phase = 'in'
    this.t = 0
  }

  /** Cambia de escena con disuelto. `color` es el color del apagado. */
  go(factory: Factory, color = '#0e1018'): void {
    if (this.phase === 'out') return
    this.pending = factory
    this.phase = 'out'
    this.t = 0
    this.color = color
  }

  get transitioning(): boolean {
    return this.phase !== 'idle'
  }

  update(dt: number): void {
    if (this.phase === 'out') {
      this.t += dt
      if (this.t >= OUT) {
        this.current?.exit?.()
        this.current = this.pending!()
        this.pending = null
        this.current.enter?.()
        clearQueued()
        this.phase = 'in'
        this.t = 0
      }
    } else if (this.phase === 'in') {
      this.t += dt
      if (this.t >= IN) {
        this.phase = 'idle'
        this.t = 0
      }
    }
    // Durante el disuelto la escena sigue viva: el mundo no se congela.
    this.current?.update(dt)
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.current?.render(ctx)
    if (this.phase === 'out') dissolve(ctx, this.t / OUT, this.color)
    else if (this.phase === 'in') dissolve(ctx, 1 - this.t / IN, this.color)
  }
}

export const scenes = new SceneManager()
