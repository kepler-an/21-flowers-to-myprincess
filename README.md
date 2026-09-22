# September 21

Un mini videojuego retro de 3–5 minutos. Se camina por un jardín, se cruza una
noche y se plantan veintiuna semillas. Solo al final se entiende que el juego
entero era el regalo.

---

## Lo único que necesitas tocar

**`src/content.ts`** contiene todo el texto del juego y ninguna línea de lógica.
Puedes reescribirlo entero sin romper nada.

Lo importante está en `content.letter`:

```ts
letter: {
  date: '21 DE SEPTIEMBRE',
  lines: [
    'No pude llevarte girasoles.',
    'Así que te hice un sitio donde crecieran.',
    '',                                  // una línea vacía es una pausa
    // ...las que quieras
  ],
  signature: '',      // déjalo en '' si prefieres sin firma
  coda: 'feliz 21',   // aparece al final, casi susurrado
}
```

Las líneas aparecen una a una, escribiéndose. Por debajo de unos 44 caracteres
se leen mucho mejor; una línea vacía funciona como respiración.

El archivo lleva una advertencia que conviene respetar: **las frases del jardín
no deben delatar el propósito del juego**. Cuanto más inocentes parezcan, mejor
funciona el final.

## Ponerlo en marcha

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # deja todo listo en dist/
```

`dist/` es estático puro: súbelo tal cual a Netlify, Vercel, GitHub Pages o
cualquier hosting. No hay servidor, ni base de datos, ni cuentas.
El juego entero pesa unos **20 KB comprimidos** y no descarga ni una imagen:
el pixel art y la tipografía se dibujan en el arranque, y la música se sintetiza
en directo.

## Cómo se juega

Flechas o WASD para caminar; también se puede mantener pulsado el ratón para ir
hacia ese punto. **Espacio** o **Enter** para hablar con los objetos y para
plantar. **M** silencia la música.

La partida se guarda sola: si cierra la pestaña a mitad, vuelve donde estaba. Y
una vez terminado, abrir el enlace lleva directamente al campo florecido y a la
carta — no hay que volver a jugar nada.

## Atajos para revisarlo tú

- `?scene=garden` · `?scene=crossing` · `?scene=field` · `?scene=letter` saltan a
  una escena concreta. Añade `&seeds=21` para llevar semillas encima, o
  `&bloom=1` en el campo para verlo ya florecido.
- **Shift+R** borra la partida guardada y vuelve al título.

El enlace que ella recibe no lleva parámetros, así que empieza por el título.

## Cómo está hecho

TypeScript y un único `<canvas>` de 320×180 escalado por múltiplos enteros. Sin
motor de juego y sin framework: para cuatro escenas, un personaje que camina y
colisiones contra rectángulos, cualquier librería pesaría más que el juego.

```
src/
├─ content.ts          ← todo el texto (lo tuyo)
├─ core/               loop de paso fijo, escenas, input, pantalla,
│                      audio sintetizado, partículas, efectos
├─ art/                paleta, tipografía bitmap 5×9, sprites como datos,
│                      terreno procedural (hierba, árboles, cielos)
├─ game/               estado, jugador, interfaz
└─ scenes/             Title · Garden · Crossing · Field · Letter
```

Dos decisiones que explican casi todo lo demás:

- **El pixel art son datos, no imágenes.** Cada sprite es un array de cadenas
  donde cada carácter es un color de la paleta (`src/art/sprites.ts`). Pesa
  nada, se edita a mano y se ve en los diffs de git.
- **Lo orgánico se pinta por código.** La hierba, los árboles, los arbustos y
  los cielos se generan con una semilla fija (`src/art/terrain.ts`), así que
  ningún árbol es idéntico a otro — que es justo lo que delata a un tileset
  repetido.

Las veintiuna semillas están repartidas 8 en el jardín y 13 en la travesía. La
verja del jardín no deja pasar hasta tener las ocho, y ningún arbusto puede
generarse encima de una semilla: el juego tiene que poder terminarse siempre.
