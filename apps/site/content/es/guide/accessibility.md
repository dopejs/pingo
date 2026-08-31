# Accesibilidad y testabilidad

## En la arquitectura desde el primer día

El contenido de un canvas es, por naturaleza, invisible para un lector de pantalla. pingo no trata la
accesibilidad como una capa que se añade después de publicar: el Core mantiene un árbol semántico
(role / label / value / bounds / focusable) y `@dopejs/pingo-a11y` lo proyecta de forma incremental
como un árbol DOM en la sombra, posicionado en absoluto junto al canvas.

Los elementos en la sombra son visualmente transparentes pero existen en el árbol de accesibilidad y
en el orden de tabulación; al enfocarlos, el foco se reenvía a la sesión de edición del motor, de modo
que quien usa teclado puede manejar de verdad los campos dentro del canvas.

## Declarar semántica

```tsx
<container semanticRole="region" semanticLabel="Panel de pago">
  <text value="Pago" semanticRole="heading" semanticLabel="Pago" />
  {TextField({ semanticLabel: "Destinatario", value, revision })}
</container>
```

`editableText` tiene semántica de textbox por defecto. El valor de un campo de contraseña **nunca**
entra en el árbol semántico.

## Tests E2E basados en semántica

Como el árbol semántico se refleja en DOM real, los tests E2E pueden seleccionar por rol y nombre en
lugar de comparar píxeles:

```ts
import { getByRole, queryAllByRole } from "@dopejs/pingo";

const email = getByRole(document.body, "textbox", { name: "Destinatario" });
email.focus(); // se reenvía a la sesión de edición del motor
expect(queryAllByRole(document.body, "textbox")).toHaveLength(2);
```

Las capturas de píxeles se mantienen, pero como **prueba complementaria** de la corrección del
renderizado, no como única aserción. Gracias a ello los tests de interfaz no se rompen en bloque
cuando cambia el rasterizado de fuentes o el antialiasing.

## Afirmar lo que realmente se dibujó

El árbol semántico dice qué es un nodo, no si esa frame dibujó realmente la cadena.
Entre ambos están la visibilidad, el orden de dibujo, la virtualización y la caché
de subárboles, y las instrucciones del camino de dibujo principal ni siquiera
llevan la cadena. `onPaintedText` aporta la otra mitad:

```ts
let painted: PaintedTextSnapshot | undefined;
const root = await createHostedCanvasRoot(canvas, {
  onPaintedText: (snapshot) => (painted = snapshot),
});

// El árbol semántico dice que el botón está; la sonda dice que se dibujó.
getByRole(document.body, "button", { name: "Guardar" });
expect(painted?.records.some((record) => record.text === "Guardar")).toBe(true);
```

La instantánea llega una vez por frame y `root.paintedText()` devuelve la última.
Cada registro da `nodeId`, `text`, el origen en coordenadas de dispositivo `origin`,
el canal de dibujo `channel` y `originClipped`. Sin `onPaintedText` el motor no lo
calcula: una frame cuesta exactamente lo mismo que antes.

Dos límites: se informa de lo que el **Core emitió**, no de lo que sigue visible
tras el replay -- el culling de viewport ocurre en el backend. Y un campo de
contraseña informa de la máscara `•`, porque eso es lo que se dibuja.

## Observar el árbol semántico

```ts
const root = await createHostedCanvasRoot(canvas, {
  onSemantics: (nodes) => inspect(nodes),
  accessibility: true, // activo por defecto; con false se desactiva el árbol en la sombra
});
```

Cada nodo aporta `nodeId`, `role`, `label`, `value`, los `bounds` en coordenadas de mundo,
`focusable`, `focused` y la marca `password`. En el diagnóstico de fotograma, `dirtySemanticsNodes`
permite observar la frecuencia de invalidación semántica.

## Cualificación de plataforma

Lo automatizado cubre la exportación del árbol semántico, la proyección al árbol en la sombra, los
selectores por rol y etiqueta y el contrato de teclado.
**La matriz de comportamiento de lectores de pantalla reales (VoiceOver, NVDA, TalkBack) pertenece a
la cualificación de plataforma**, se registra aparte y no cuenta como condición de salida de
ingeniería. La línea evita presentar conclusiones de dispositivo sin verificar como una promesa de
soporte.

En la [demo de semántica del Playground](/es/playground#/semantics) puedes leer directamente el árbol
semántico actual.
