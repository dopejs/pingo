# Scroll y virtualización

## El scroll nace de overflow

En cuanto un View declara `overflow-x` / `overflow-y` como `auto`, `scroll` o `hidden` en
un eje, es un contenedor de scroll en ese eje. No hace falta cambiarlo por otro elemento:

```ts
View({
  style: { height: 480, overflowY: "auto" },
  children: rows,
});
```

Gestos, rueda, encadenamiento y barra de scroll salen todos de esa única declaración: el
camino de hit sube hasta el ancestro desplazable más cercano, y la barra la dibuja el Core
con el estado de scroll que ya posee, así que una frame de scroll no llega al Shell.
`hidden` se comporta como en CSS: sin barra para el usuario, pero el scroll programático
sigue funcionando.

**Hacer scroll no es virtualizar.** `overflow` solo hace desplazable la caja y no adivina
si quieres ventanar los datos. El `virtual` de abajo es un contrato explícito, nunca
inferido de `overflow` ni de los hijos ya materializados.

## Por qué la virtualización vive en el motor

La latencia de cola de las listas virtuales en DOM viene de la cadena: el evento de scroll vuelve al
hilo principal, dispara setState, hay diff y reflow. En cuanto el hilo principal se ocupa, se pierden
fotogramas.

pingo mete el cálculo de la ventana en el Core: el scroll en régimen permanente **no llama nunca a la
capa TypeScript**. Ésta sólo materializa el rango visible siguiendo la ventana de precarga que
planifica el Core; si los datos aún no están, se dibuja un marcador y se completa en fotogramas
posteriores.

## Dar una ventana de datos a un View

La virtualización es una propiedad del View, no otro componente: la misma caja desplazable lleva hijos normales o un millón de filas.

```ts
View({
  style: { width: 480, height: 640, overflowY: "auto" },
  virtual: {
    axis: "y",
    itemCount: 1_000_000,
    estimatedItemSize: 32,
    getItemKey: (index: number) => `order-${index}`,
    renderItem: (index: number) =>
      View({
        style: { height: 32 },
        children: Text({ value: `Fila ${index}` }),
      }),
  },
});
```

`estimatedItemSize` es solo una estimación inicial. Cuando se mide el tamaño real, el Core
corrige la posición del ancla con un árbol de sumas de prefijos (Fenwick) y la barra no da
saltos.

`axis` es de un solo eje: una ventana sirve `x` o `y`, no ambos.

El componente `VirtualList` sigue existiendo: es el atajo para una lista vertical y acaba en el
mismo contrato del Core. Para el eje horizontal, para `getItemKey`, o cuando la misma caja debe
llevar contenido normal y una ventana, usa `virtual` en el View.

## Parámetros ajustables

| Campo de `virtual`       | Función                                                        |
| ------------------------ | -------------------------------------------------------------- |
| `axis`                   | Eje único de la ventana, `x` o `y` (por defecto `y`)           |
| `itemCount`              | Total de elementos lógicos                                     |
| `estimatedItemSize`      | Estimación inicial, corregida por el Core tras medir           |
| `getItemKey`             | Identidad estable del elemento, para reutilizar entre ventanas |
| `renderItem`             | Materializa un elemento, solo para los índices de la ventana   |
| `baseOverscanViewports`  | Rango de precalentamiento simétrico (múltiplos del viewport)   |
| `velocityHorizonSeconds` | Tiempo de proyección de la velocidad, para predecir dirección  |
| `maximumAheadViewports`  | Tope de precalentamiento en una dirección                      |

La predicción de dirección precarga preferentemente hacia donde va el movimiento en un desplazamiento
rápido, en vez de gastar el presupuesto por igual a ambos lados.

## Scroll programático

`scrollX` / `scrollY` son propiedades del propio View, independientes de la
virtualización. Solo un cambio de valor emite una mutación `ScrollTo`:

```ts
View({ style: { height: 480, overflowY: "auto" }, scrollY: 500_000 * 32, children: rows });
```

O bien la API de manipulación directa del root, pensada para gestos propios:

```ts
root.beginScroll(handle);
root.scrollBy(handle, 0, deltaY, elapsedMs);
root.endScroll(handle); // el Core estima la velocidad del impulso
```

`handle` procede del callback `ref` del elemento (`NodeHandle`).

## Rueda y trackpad

La **distancia** de la rueda coincide con la del navegador, pero la curva de transferencia se separa
según la fuente: los deltas de alta precisión (trackpad) se aplican 1:1 de inmediato y la inercia la
sigue aportando el flujo de eventos del sistema operativo; los saltos discretos de rueda se acumulan
en un destino animado al que se llega con una curva exponencial, limitada estrictamente a los bordes
del contenido y sin overscroll, igual que en el navegador.

## Anidamiento y edición

La rueda desplaza el ancestro desplazable más cercano, es decir, el View más cercano que
declara `overflow`. Si un arrastre del puntero empieza sobre texto editable, la selección
de texto tiene prioridad sobre el arrastre de scroll. Esta prioridad la decide la
profundidad en el camino de hit; la aplicación no interviene.

## Criterio de rendimiento

El benchmark automático sobre un fixture fijo (un millón de filas, 20.000 fotogramas) forma parte de
la puerta de mezcla. Hoy el P95/P99 de reproducción está por debajo del microsegundo y treinta
minutos de scroll continuo no muestran crecimiento de memoria descontrolado.

El P95/P99 en dispositivos reales y la latencia de entrada pertenecen a la cualificación de
plataforma y no son condición de salida de ingeniería. La línea es deliberada: evita bloquear el
trabajo con datos de dispositivo no reproducibles y evita también presentar cifras de ingeniería
como una promesa sobre dispositivos.

En la [demo de scroll del Playground](/es/playground#/scroll) se ven las métricas de fotograma en vivo.
