/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  TODO EL TEXTO DEL JUEGO VIVE AQUÍ.
 *  Puedes editar este archivo entero sin tocar nada más. No hay lógica dentro.
 *
 *  Reglas que conviene respetar al editar:
 *   · Las líneas del jardín NO deben delatar el propósito del juego.
 *     Cuanto más inocentes parezcan, mejor funciona el final.
 *   · Cada línea del jardín se parte sola si es larga, pero por debajo de
 *     ~44 caracteres se lee mucho mejor.
 *   · La carta final admite las líneas que quieras; si pones muchas, el juego
 *     las va mostrando una a una y ajusta el interlineado.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const content = {
  /** Pantalla de título. */
  title: {
    name: 'SEPTEMBER 21',
    subtitle: 'A tiny game for someone far away.',
    start: 'PRESS START',
    hint: 'flechas o WASD para moverte',
  },

  /** Pequeños mensajes de los objetos del jardín. Tono seco, nada de romance. */
  garden: {
    sign: 'JARDÍN.\nNo pisar lo que apenas empieza.',
    bench: 'Un banco para dos.\nCasi siempre lo usa el gato.',
    cat: 'Duerme.\nHa decidido que hoy tampoco.',
    can: 'Una regadera vacía.\nAlguien se olvidó de llenarla otra vez.',
    mailbox: 'Un buzón.\nDentro no hay nada. Todavía.',
    gate: 'La verja está abierta.\nEl camino sigue hacia el este.',
    gateLocked: 'Todavía queda algo entre la hierba.',
  },

  /** Único texto de la travesía nocturna. Aparece una vez y se va. */
  crossing: {
    prompt: 'sigue la luz',
  },

  /** Escena del terreno. Lo mínimo para que se entienda qué hacer. */
  field: {
    prompt: 'ESPACIO para plantar',
    done: '',
  },

  /** ═══ LA CARTA. Esto es lo único que ella va a releer. ═══ */
  letter: {
    date: '21 DE SEPTIEMBRE',
    lines: [
      'No pude llevarte girasoles.',
      'Así que te hice un sitio donde crecieran.',
      '',
      'VEres lo más hermoso de la vida, y me haces feliz.',
      '',
      'Están lejos, como nosotros.',
      'Pero mira: igual florecen.',
      '',
      'Te amo mi princesa hermosa de hermosos sentimientos.',
    ],
    /** Se dibuja al pie, más pequeño. Déjalo en '' si prefieres sin firma. */
    signature: '',
    /** Aparece al final del todo, casi susurrado. */
    coda: 'feliz 21',
  },

  /** Número de semillas. El juego se recuadra solo si lo cambias. */
  seedCount: 21,
}

export type Content = typeof content
