/**
 * Fuente bitmap 5x9 dibujada a mano. Sin webfonts: el texto es parte del juego.
 *
 * Cada glifo son 9 filas de 5 píxeles separadas por '/':
 *   fila 0      zona de acentos (mayúsculas)
 *   filas 1-2   ascendentes / acentos de minúsculas
 *   filas 3-7   altura de x
 *   fila 8      descendentes (g j p q y)
 *
 * Los caracteres acentuados no se dibujan a mano: se componen en COMPOSED.
 */

const G = (rows: string) => rows.split('/')

const GLYPHS: Record<string, string[]> = {
  ' ': G('...../...../...../...../...../...../...../...../.....'),

  A: G('...../.###./#...#/#...#/#####/#...#/#...#/#...#/.....'),
  B: G('...../####./#...#/#...#/####./#...#/#...#/####./.....'),
  C: G('...../.###./#...#/#..../#..../#..../#...#/.###./.....'),
  D: G('...../####./#...#/#...#/#...#/#...#/#...#/####./.....'),
  E: G('...../#####/#..../#..../####./#..../#..../#####/.....'),
  F: G('...../#####/#..../#..../####./#..../#..../#..../.....'),
  G: G('...../.###./#...#/#..../#.###/#...#/#...#/.###./.....'),
  H: G('...../#...#/#...#/#...#/#####/#...#/#...#/#...#/.....'),
  I: G('...../.###./..#../..#../..#../..#../..#../.###./.....'),
  J: G('...../..###/...#./...#./...#./...#./#..#./.##../.....'),
  K: G('...../#...#/#..#./#.#../##.../#.#../#..#./#...#/.....'),
  L: G('...../#..../#..../#..../#..../#..../#..../#####/.....'),
  M: G('...../#...#/##.##/#.#.#/#...#/#...#/#...#/#...#/.....'),
  N: G('...../#...#/##..#/#.#.#/#..##/#...#/#...#/#...#/.....'),
  O: G('...../.###./#...#/#...#/#...#/#...#/#...#/.###./.....'),
  P: G('...../####./#...#/#...#/####./#..../#..../#..../.....'),
  Q: G('...../.###./#...#/#...#/#...#/#.#.#/#..#./.##.#/.....'),
  R: G('...../####./#...#/#...#/####./#.#../#..#./#...#/.....'),
  S: G('...../.####/#..../#..../.###./....#/....#/####./.....'),
  T: G('...../#####/..#../..#../..#../..#../..#../..#../.....'),
  U: G('...../#...#/#...#/#...#/#...#/#...#/#...#/.###./.....'),
  V: G('...../#...#/#...#/#...#/#...#/#...#/.#.#./..#../.....'),
  W: G('...../#...#/#...#/#...#/#...#/#.#.#/##.##/#...#/.....'),
  X: G('...../#...#/#...#/.#.#./..#../.#.#./#...#/#...#/.....'),
  Y: G('...../#...#/#...#/.#.#./..#../..#../..#../..#../.....'),
  Z: G('...../#####/....#/...#./..#../.#.../#..../#####/.....'),

  a: G('...../...../...../.###./....#/.####/#...#/.####/.....'),
  b: G('...../#..../#..../####./#...#/#...#/#...#/####./.....'),
  c: G('...../...../...../.###./#..../#..../#..../.###./.....'),
  d: G('...../....#/....#/.####/#...#/#...#/#...#/.####/.....'),
  e: G('...../...../...../.###./#...#/#####/#..../.###./.....'),
  f: G('...../..##./.#.../####./.#.../.#.../.#.../.#.../.....'),
  g: G('...../...../...../.####/#...#/#...#/.####/....#/####.'),
  h: G('...../#..../#..../####./#...#/#...#/#...#/#...#/.....'),
  i: G('...../..#../...../.##../..#../..#../..#../.###./.....'),
  j: G('...../...#./...../..##./...#./...#./...#./#..#./.##..'),
  k: G('...../#..../#..../#..#./#.#../##.../#.#../#..#./.....'),
  l: G('...../.##../..#../..#../..#../..#../..#../.###./.....'),
  m: G('...../...../...../##.#./#.#.#/#.#.#/#...#/#...#/.....'),
  n: G('...../...../...../####./#...#/#...#/#...#/#...#/.....'),
  o: G('...../...../...../.###./#...#/#...#/#...#/.###./.....'),
  p: G('...../...../...../####./#...#/#...#/####./#..../#....'),
  q: G('...../...../...../.####/#...#/#...#/.####/....#/....#'),
  r: G('...../...../...../#.##./##..#/#..../#..../#..../.....'),
  s: G('...../...../...../.####/#..../.###./....#/####./.....'),
  t: G('...../.#.../.#.../####./.#.../.#.../.#..#/..##./.....'),
  u: G('...../...../...../#...#/#...#/#...#/#...#/.####/.....'),
  v: G('...../...../...../#...#/#...#/#...#/.#.#./..#../.....'),
  w: G('...../...../...../#...#/#...#/#.#.#/#.#.#/.#.#./.....'),
  x: G('...../...../...../#...#/.#.#./..#../.#.#./#...#/.....'),
  y: G('...../...../...../#...#/#...#/#...#/.####/....#/.###.'),
  z: G('...../...../...../#####/...#./..#../.#.../#####/.....'),

  '0': G('...../.###./#...#/#..##/#.#.#/##..#/#...#/.###./.....'),
  '1': G('...../..#../.##../..#../..#../..#../..#../.###./.....'),
  '2': G('...../.###./#...#/....#/...#./..#../.#.../#####/.....'),
  '3': G('...../####./....#/....#/.###./....#/....#/####./.....'),
  '4': G('...../...#./..##./.#.#./#..#./#####/...#./...#./.....'),
  '5': G('...../#####/#..../####./....#/....#/#...#/.###./.....'),
  '6': G('...../..##./.#.../#..../####./#...#/#...#/.###./.....'),
  '7': G('...../#####/....#/...#./..#../.#.../.#.../.#.../.....'),
  '8': G('...../.###./#...#/#...#/.###./#...#/#...#/.###./.....'),
  '9': G('...../.###./#...#/#...#/.####/....#/...#./.##../.....'),

  '.': G('...../...../...../...../...../...../...../..#../.....'),
  ',': G('...../...../...../...../...../...../...../..#../.#...'),
  ':': G('...../...../...../..#../...../...../..#../...../.....'),
  ';': G('...../...../...../..#../...../...../..#../.#.../.....'),
  '!': G('...../..#../..#../..#../..#../..#../...../..#../.....'),
  '?': G('...../.###./#...#/....#/...#./..#../...../..#../.....'),
  '¿': G('...../..#../...../..#../.#.../#..../#...#/.###./.....'),
  '¡': G('...../..#../...../..#../..#../..#../..#../..#../.....'),
  "'": G('...../..#../..#../...../...../...../...../...../.....'),
  '"': G('...../.#.#./.#.#./...../...../...../...../...../.....'),
  '-': G('...../...../...../...../.###./...../...../...../.....'),
  '—': G('...../...../...../...../#####/...../...../...../.....'),
  '·': G('...../...../...../...../..#../...../...../...../.....'),
  '*': G('...../...../#.#../.#.../#.#../...../...../...../.....'),
  '(': G('...../...#./..#../.#.../.#.../.#.../..#../...#./.....'),
  ')': G('...../.#.../..#../...#./...#./...#./..#../.#.../.....'),
  '/': G('...../....#/....#/...#./..#../.#.../#..../#..../.....'),
  '+': G('...../...../..#../..#../#####/..#../..#../...../.....'),
  '=': G('...../...../...../.###./...../.###./...../...../.....'),
  '<': G('...../...#./..#../.#.../#..../.#.../..#../...#./.....'),
  '>': G('...../#..../.#.../..#../...#./..#../.#.../#..../.....'),
  '♥': G('...../...../.#.#./#####/#####/.###./..#../...../.....'),
}

/** Marcas diacríticas, por fila. */
const MARKS: Record<string, string> = {
  acute: '..##.',
  diaeresis: '.#.#.',
  tilde: '.###.',
}

/** carácter -> [glifo base, marca]. Las minúsculas llevan la marca más abajo. */
const COMPOSED: Record<string, [string, keyof typeof MARKS]> = {
  Á: ['A', 'acute'],
  É: ['E', 'acute'],
  Í: ['I', 'acute'],
  Ó: ['O', 'acute'],
  Ú: ['U', 'acute'],
  Ü: ['U', 'diaeresis'],
  Ñ: ['N', 'tilde'],
  á: ['a', 'acute'],
  é: ['e', 'acute'],
  í: ['i', 'acute'],
  ó: ['o', 'acute'],
  ú: ['u', 'acute'],
  ü: ['u', 'diaeresis'],
  ñ: ['n', 'tilde'],
}

export const GLYPH_W = 5
export const GLYPH_H = 9
export const ADVANCE = 6
export const LINE_H = 11

const ORDER: string[] = []
const INDEX = new Map<string, number>()

function composedRows(base: string[], mark: string, lowercase: boolean): string[] {
  const rows = base.slice()
  // La 'i' pierde su punto cuando lleva acento.
  if (lowercase) rows[1] = mark
  else rows[0] = mark
  return rows
}

const SHEET: string[][] = []
for (const [ch, rows] of Object.entries(GLYPHS)) {
  INDEX.set(ch, ORDER.length)
  ORDER.push(ch)
  SHEET.push(rows)
}
for (const [ch, [baseCh, mark]] of Object.entries(COMPOSED)) {
  const base = GLYPHS[baseCh]
  if (!base) continue
  INDEX.set(ch, ORDER.length)
  ORDER.push(ch)
  SHEET.push(composedRows(base, MARKS[mark], baseCh !== baseCh.toUpperCase()))
}

const sheetCache = new Map<string, HTMLCanvasElement>()

/** Hornea la hoja completa de glifos en un color. Se cachea por color. */
function sheetFor(color: string): HTMLCanvasElement {
  const cached = sheetCache.get(color)
  if (cached) return cached

  const cv = document.createElement('canvas')
  cv.width = GLYPH_W * SHEET.length
  cv.height = GLYPH_H
  const ctx = cv.getContext('2d')!
  ctx.fillStyle = color
  for (let i = 0; i < SHEET.length; i++) {
    const rows = SHEET[i]
    for (let y = 0; y < GLYPH_H; y++) {
      const row = rows[y] ?? ''
      for (let x = 0; x < GLYPH_W; x++) {
        if (row[x] === '#') ctx.fillRect(i * GLYPH_W + x, y, 1, 1)
      }
    }
  }
  sheetCache.set(color, cv)
  return cv
}

export function textWidth(text: string): number {
  return text.length === 0 ? 0 : text.length * ADVANCE - 1
}

export type TextOpts = {
  color?: string
  /** Sombra dura 1px debajo, como en los RPG de la época. */
  shadow?: string
  /** Recorta el texto a los primeros n caracteres (efecto máquina de escribir). */
  reveal?: number
}

export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  opts: TextOpts = {},
): void {
  const color = opts.color ?? '#fdf8e7'
  const limit = opts.reveal ?? text.length
  if (opts.shadow) drawRaw(ctx, text, x, y + 1, opts.shadow, limit)
  drawRaw(ctx, text, x, y, color, limit)
}

function drawRaw(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  limit: number,
): void {
  const sheet = sheetFor(color)
  const n = Math.min(text.length, Math.floor(limit))
  for (let i = 0; i < n; i++) {
    const ch = text[i]
    if (ch === ' ') continue
    const idx = INDEX.get(ch) ?? INDEX.get('?')!
    ctx.drawImage(
      sheet,
      idx * GLYPH_W,
      0,
      GLYPH_W,
      GLYPH_H,
      Math.round(x) + i * ADVANCE,
      Math.round(y),
      GLYPH_W,
      GLYPH_H,
    )
  }
}

/** Centra horizontalmente en un ancho dado. */
export function drawTextCentered(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  y: number,
  opts: TextOpts = {},
): void {
  drawText(ctx, text, Math.round(cx - textWidth(text) / 2), y, opts)
}

/** Parte un texto en líneas que quepan en `maxWidth` píxeles. */
export function wrapText(text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    const next = line ? `${line} ${w}` : w
    if (textWidth(next) > maxWidth && line) {
      lines.push(line)
      line = w
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines
}
