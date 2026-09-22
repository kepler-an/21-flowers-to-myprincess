/**
 * Pixel art como datos. Cada fila es una cadena de índices de PALETTE
 * ('.' = transparente). Se hornean todos a un único atlas en el arranque.
 *
 * Lo que tiene forma reconocible se dibuja a mano aquí.
 * Lo orgánico (hierba, árboles, arbustos, piedras) se pinta por código en
 * art/terrain.ts, para que no haya dos árboles idénticos.
 */

export type Sprite = string[]

/** Alinea un sprite a la base de una caja de `h` filas, rellenando arriba. */
function bottom(rows: Sprite, h: number): Sprite {
  const w = rows[0].length
  const pad = '.'.repeat(w)
  const out: Sprite = []
  for (let i = 0; i < h - rows.length; i++) out.push(pad)
  return out.concat(rows)
}

// ─── Protagonista ────────────────────────────────────────────────────────────
// 10x16. Pelo lavanda (m/n/o), piel e, ojos 1, vestido morado (k/l).

const H_HEAD_DOWN = ['..mmmmmm..', '.nmmmmmmo.', '.mmeeeemm.', '.me1ee1em.', '.mmeeeemm.', '..mmeemm..']
const H_HEAD_UP = ['..mmmmmm..', '.nmmmmmmo.', '.mmmmmmmm.', '.mmmmmmmm.', '.mmmmmmmm.', '..mmmmmm..']
const H_HEAD_SIDE = ['..mmmm....', '.nmmmmm...', '.mmeeee...', '.mme1ee...', '.mmeeee...', '.mmmee....']

const H_TORSO_DOWN = ['.mkkkkkkm.', '.ekkkkkke.', '.ekkkkkke.', '..kkkkkk..']
const H_TORSO_UP = ['..mmmmmm..', '.ekmmmmke.', '.ekmmmmke.', '..kmmmmk..']
const H_TORSO_SIDE = ['.mkkkk....', '.mkkkkk...', '.mkkkke...', '..kkkk....']

/** La falda se ensancha hacia el bajo: es lo que define la silueta. */
const H_SKIRT = ['..kkkkkk..', '.kkkkkkkk.', 'kkkkkkkkkk', 'llllllllll']
const H_SKIRT_SIDE = ['..kkkk....', '.kkkkkk...', '.kkkkkk...', '.llllll...']

const H_LEGS_IDLE = ['..ee..ee..', '..ll..ll..']
const H_LEGS_A = ['..ee.ee...', '.ll..ll...']
const H_LEGS_B = ['...ee.ee..', '...ll..ll.']

const H_LEGS_SIDE_IDLE = ['..ee.e....', '..ll.l....']
const H_LEGS_SIDE_A = ['.ee...e...', '.ll...l...']
const H_LEGS_SIDE_B = ['..e..ee...', '..l..ll...']

export const PLAYER: Record<string, Sprite> = {
  'down.0': [...H_HEAD_DOWN, ...H_TORSO_DOWN, ...H_SKIRT, ...H_LEGS_IDLE],
  'down.1': [...H_HEAD_DOWN, ...H_TORSO_DOWN, ...H_SKIRT, ...H_LEGS_A],
  'down.2': [...H_HEAD_DOWN, ...H_TORSO_DOWN, ...H_SKIRT, ...H_LEGS_B],
  'up.0': [...H_HEAD_UP, ...H_TORSO_UP, ...H_SKIRT, ...H_LEGS_IDLE],
  'up.1': [...H_HEAD_UP, ...H_TORSO_UP, ...H_SKIRT, ...H_LEGS_A],
  'up.2': [...H_HEAD_UP, ...H_TORSO_UP, ...H_SKIRT, ...H_LEGS_B],
  'side.0': [...H_HEAD_SIDE, ...H_TORSO_SIDE, ...H_SKIRT_SIDE, ...H_LEGS_SIDE_IDLE],
  'side.1': [...H_HEAD_SIDE, ...H_TORSO_SIDE, ...H_SKIRT_SIDE, ...H_LEGS_SIDE_A],
  'side.2': [...H_HEAD_SIDE, ...H_TORSO_SIDE, ...H_SKIRT_SIDE, ...H_LEGS_SIDE_B],
}

// ─── Acompañante ─────────────────────────────────────────────────────────────
// Camina siempre un par de pasos por detrás, por el mismo sitio que ella.

const TORSO_DOWN = ['..gggggg..', '.egggggge.', '.egggggge.', '..gggggg..']

const LEGS_IDLE = ['..aaaaaa..', '..aaaaaa..', '..aa..aa..', '..aa..aa..', '..99..99..', '..99..99..']
const LEGS_A = ['..aaaaaa..', '..aaaaaa..', '..aa.aa...', '..aa.aa...', '.99..99...', '.99..99...']
const LEGS_B = ['..aaaaaa..', '..aaaaaa..', '...aa.aa..', '...aa.aa..', '...99..99.', '...99..99.']

const HEAD_DOWN = ['..999999..', '.99eeee99.', '.9eeeeee9.', '.9e1ee1e9.', '..eeeeee..', '...eeee...']
const HEAD_UP = ['..999999..', '.99999999.', '.99999999.', '.99999999.', '..999999..', '...eeee...']
const HEAD_SIDE = ['..9999....', '.999999...', '.99eeee...', '.99ee1e...', '..eeeee...', '...eee....']

const TORSO_SIDE = ['..gggg....', '..ggggg...', '..gggge...', '..gggg....']

const LEGS_SIDE_IDLE = [
  '..aaaa....',
  '..aaaa....',
  '..aa.a....',
  '..aa.a....',
  '..99.9....',
  '..99.9....',
]
const LEGS_SIDE_A = [
  '..aaaa....',
  '..aaaa....',
  '..aa.a....',
  '..aa.a....',
  '.99...9...',
  '.99...9...',
]
const LEGS_SIDE_B = [
  '..aaaa....',
  '..aaaa....',
  '..a.aa....',
  '..a.aa....',
  '..9..99...',
  '..9..99...',
]

export const COMPANION: Record<string, Sprite> = {
  'down.0': [...HEAD_DOWN, ...TORSO_DOWN, ...LEGS_IDLE],
  'down.1': [...HEAD_DOWN, ...TORSO_DOWN, ...LEGS_A],
  'down.2': [...HEAD_DOWN, ...TORSO_DOWN, ...LEGS_B],
  'up.0': [...HEAD_UP, ...TORSO_DOWN, ...LEGS_IDLE],
  'up.1': [...HEAD_UP, ...TORSO_DOWN, ...LEGS_A],
  'up.2': [...HEAD_UP, ...TORSO_DOWN, ...LEGS_B],
  'side.0': [...HEAD_SIDE, ...TORSO_SIDE, ...LEGS_SIDE_IDLE],
  'side.1': [...HEAD_SIDE, ...TORSO_SIDE, ...LEGS_SIDE_A],
  'side.2': [...HEAD_SIDE, ...TORSO_SIDE, ...LEGS_SIDE_B],
}

// ─── Objetos ─────────────────────────────────────────────────────────────────

export const SEED: Sprite = ['...9...', '..9a9..', '.9aea9.', '.9aea9.', '.9aaa9.', '..999..']

export const CAT: Sprite = [
  '..9......9....',
  '..99....99....',
  '.9aa9999aa9...',
  '.9aaaaaaaa9...',
  '.9aa1aa1aa9...',
  '.9aaaaaaaaa9..',
  '..9aaaaaaa9b..',
  '..9aaaaaa9.bb.',
  '...9999999..b.',
]

export const BENCH: Sprite = [
  '..bbbbbbbbbbbbbbbbbbbb..',
  '..baaaaaaaaaaaaaaaaaab..',
  '..bbbbbbbbbbbbbbbbbbbb..',
  '..b..................b..',
  '..bbbbbbbbbbbbbbbbbbbb..',
  '..baaaaaaaaaaaaaaaaaab..',
  'bbbbbbbbbbbbbbbbbbbbbbbb',
  'baaaaaaaaaaaaaaaaaaaaaab',
  'bbbbbbbbbbbbbbbbbbbbbbbb',
  '.b....................b.',
  '.b....................b.',
  '.9....................9.',
  '.9....................9.',
]

export const SIGN: Sprite = [
  '.bbbbbbbbbb.',
  '.baaaaaaaab.',
  '.ba999999ab.',
  '.ba999999ab.',
  '.baaaaaaaab.',
  '.baaaaaaaab.',
  '.bbbbbbbbbb.',
  '.....bb.....',
  '.....bb.....',
  '.....bb.....',
  '....a99a....',
]

export const MAILBOX: Sprite = [
  '...gggg...',
  '..gggggg..',
  '.gggggggg.',
  '.gg9999gg.',
  '.gg9999gg.',
  '.gg9999gg.',
  '.gggggggg.',
  '..gggggg..',
  '....bb....',
  '....bb....',
  '....bb....',
  '....bb....',
  '....bb....',
  '...abba...',
  '..aaaaaa..',
]

export const CAN: Sprite = [
  '...bb....bb...',
  '..b........b..',
  '..b........b..',
  '.hhhhhhhhhh...',
  'hhhhhhhhhhhh..',
  '.hhhhhhhhhh..i',
  '.hhhhhhhhhh.ii',
  '.hhhhhhhhhhii.',
  '.hhhhhhhhhh...',
  '.ihhhhhhhhi...',
  '..iiiiiiii....',
]

export const LANTERN: Sprite = [
  '....99....',
  '...9..9...',
  '..999999..',
  '..9dddd9..',
  '..9dffd9..',
  '..9dffd9..',
  '..9dddd9..',
  '..999999..',
  '....99....',
  '....bb....',
  '....bb....',
  '....bb....',
  '....bb....',
  '....bb....',
  '....bb....',
  '....bb....',
  '...abba...',
  '..aaaaaa..',
]

export const STONE_STEP: Sprite = [
  '....hhhhh.....',
  '..hhiiiiihh...',
  '.hiiiiiiiiih..',
  '.hiiiiiiiiih..',
  '..hiiiiiiih...',
  '...3333333....',
]

/** Surco de tierra removida: marca dónde se puede plantar. */
export const FURROW: Sprite = [
  '..99999999..',
  '.9aaaaaaaa9.',
  '.9a999999a9.',
  '.9aaaaaaaa9.',
  '..99999999..',
]

// ─── Girasol: seis estados de crecimiento, 16x24, alineados a la base ────────

const BLOOM_HEAD = [
  '......dddd......',
  '...dd.dddd.dd...',
  '..dddddddddddd..',
  '..ddddcaacdddd..',
  '.ddddca99acdddd.',
  '..ddddcaacdddd..',
  '..dddddddddddd..',
  '...dd.dddd.dd...',
  '......dddd......',
]

const TALL_STEM = [
  '.......66.......',
  '.......66.......',
  '.......66.......',
  '...777.66.......',
  '..7777766.......',
  '...777.66.......',
  '.......66777....',
  '.......6677777..',
  '.......66777....',
  '.......66.......',
  '.......66.......',
  '.......66.......',
  '......a66a......',
  '.....aa66aa.....',
  '....aaaaaaaa....',
]

export const SUNFLOWER: Sprite[] = [
  // 0 · montículo de tierra recién plantado
  bottom(['....999999....', '..99aaaaaa99..', '.9aaaaaaaaaa9.', '..9999999999..'], 24).map((r) =>
    r.length === 14 ? `.${r}.` : r,
  ),
  // 1 · brote
  bottom(
    [
      '.....7..7.....',
      '....77..77....',
      '.....7887.....',
      '......66......',
      '......66......',
      '...999999999..',
      '..9aaaaaaaa9..',
      '...999999999..',
    ],
    24,
  ).map((r) => (r.length === 14 ? `.${r}.` : r)),
  // 2 · tallo joven con hojas
  bottom(
    [
      '.......66.......',
      '.......66.......',
      '...777.66.......',
      '..7777766.......',
      '...777.66.......',
      '.......66777....',
      '.......6677777..',
      '.......66777....',
      '.......66.......',
      '.......66.......',
      '......a66a......',
      '.....aa66aa.....',
      '....aaaaaaaa....',
    ],
    24,
  ),
  // 3 · capullo
  bottom(
    [
      '......5665......',
      '.....566665.....',
      '.....566665.....',
      '......5665......',
      ...TALL_STEM.slice(2),
    ],
    24,
  ),
  // 4 · abriéndose
  bottom(
    [
      '......cccc......',
      '.....cddddc.....',
      '....cdd55ddc....',
      '....cdd55ddc....',
      '.....cddddc.....',
      '......cccc......',
      ...TALL_STEM.slice(3),
    ],
    24,
  ),
  // 5 · girasol abierto
  bottom([...BLOOM_HEAD, ...TALL_STEM], 24),
]

/** Un girasol pequeño para el fondo del campo (misma silueta, media escala). */
export const SUNFLOWER_FAR: Sprite = [
  '..dddd..',
  '.dd99dd.',
  '.dd99dd.',
  '..dddd..',
  '...66...',
  '.7.66.7.',
  '..766...',
  '...66...',
  '...66...',
  '..aaaa..',
]
