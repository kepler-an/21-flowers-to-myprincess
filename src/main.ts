import './styles.css'
import { initScreen, bctx, present } from './core/screen'
import { startLoop } from './core/loop'
import { initInput } from './core/input'
import { scenes } from './core/scene'
import { bakeAll } from './art/atlas'
import { setMuted } from './core/audio'
import { state, load, save, reset } from './game/state'
import { TitleScene } from './scenes/TitleScene'

initScreen()
bakeAll()
load()

setMuted(state.muted)
initInput(() => {
  state.muted = !state.muted
  setMuted(state.muted)
  save()
})

// Atajo sin documentar, solo para probar el juego desde cero.
window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyR' && e.shiftKey) {
    reset()
    location.reload()
  }
})

/**
 * Previsualización de escenas: ?scene=garden|crossing|field|letter&seeds=N
 * Solo sirve para revisar una escena sin jugar hasta ella. El enlace que ella
 * recibe no lleva parámetros, así que empieza por el título como debe ser.
 */
async function boot(): Promise<void> {
  const params = new URLSearchParams(location.search)
  const want = params.get('scene')
  const seeds = params.get('seeds')
  if (seeds !== null) state.seeds = Number(seeds)

  if (want === 'garden') {
    const { GardenScene } = await import('./scenes/GardenScene')
    scenes.start(() => new GardenScene())
  } else if (want === 'crossing') {
    const { CrossingScene } = await import('./scenes/CrossingScene')
    scenes.start(() => new CrossingScene())
  } else if (want === 'field') {
    const { FieldScene } = await import('./scenes/FieldScene')
    scenes.start(() => new FieldScene(params.get('bloom') === '1'))
  } else if (want === 'letter') {
    const { LetterScene } = await import('./scenes/LetterScene')
    scenes.start(() => new LetterScene())
  } else {
    // El juego siempre empieza por el título: es la puerta de entrada y,
    // además, el gesto que desbloquea el audio en el navegador.
    scenes.start(() => new TitleScene())
  }
}

void boot()

startLoop(
  (dt) => scenes.update(dt),
  () => {
    scenes.render(bctx)
    present()
  },
)
