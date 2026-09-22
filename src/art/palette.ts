/**
 * Paleta única de todo el juego. Los sprites se escriben con estos caracteres
 * (ver art/sprites.ts), así que cambiar un color aquí lo cambia en todas partes.
 *
 * '.' = transparente
 */
export const PALETTE: Record<string, string> = {
  '1': '#0e1018', // negro azulado, noche cerrada
  '2': '#1b2440', // azul nocturno
  '3': '#2f4858', // azul grisáceo, sombra fría
  '4': '#20361f', // verde muy oscuro
  '5': '#33552f', // verde oscuro
  '6': '#4f7a3a', // verde medio
  '7': '#7fa650', // verde claro
  '8': '#b8cf6e', // verde pálido, brillo de hoja
  '9': '#3c2317', // tierra oscura
  a: '#6b4226', // tierra
  b: '#a9703f', // madera, tierra clara
  c: '#e0a13c', // ámbar
  d: '#f6c945', // amarillo girasol
  e: '#f7e3a3', // crema
  f: '#fdf8e7', // crema claro, luz
  g: '#d4543a', // rojo cálido (farol, bufanda)
  h: '#8a93b5', // azul claro, luz de luna
  i: '#5c6a8a', // azul medio
  j: '#2a1b2e', // púrpura oscuro, sombra nocturna
  k: '#7d5f96', // morado apagado, vestido
  l: '#523a68', // morado oscuro, sombra del vestido
  m: '#c9a7e8', // lavanda, pelo
  n: '#ead9f7', // lavanda claro, brillo del pelo
  o: '#9a76c4', // lavanda oscuro, sombra del pelo
}

/** Color de las bandas del letterbox. */
export const LETTERBOX = '#0a0b10'

/** Tinte multiplicativo que aplica la escena nocturna sobre el frame entero. */
export const NIGHT_TINT = { r: 0x5a, g: 0x6a, b: 0xb0 }
