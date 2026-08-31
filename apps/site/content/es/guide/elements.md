---
title: "Elementos básicos: View, Text e Image"
description: Contenedor View y layout flex, renderizado de texto con Text, mapa de bits Image y fuentes explícitas PingoFont.
---

# Elementos básicos: View, Text e Image

Los elementos del host de pingo corresponden directamente a nodos del Scene; no existe el coste
de la cascada CSS ni de la coincidencia de selectores (la capacidad de estilos está en
[estilos](/guide/styling)). Esta página cubre los tres elementos más básicos: la caja genérica
`View`, el texto `Text` y el mapa de bits `Image`. Las vistas previas de abajo se renderizan en
vivo con el motor pingo y siguen el tema del sitio al cambiar entre claro y oscuro.

:::preview elements-layout
:::

## View y el layout

`View` es la caja de agrupación genérica (corresponde al elemento del host `container`) y no
introduce ninguna clase nueva de nodo de Scene:

- `width` / `height` / `minWidth` / `maxWidth` / `padding` / `backgroundColor` / `opacity` /
  `transform` son props directas; `padding` acepta un número o la tupla de cuatro valores
  `[arriba, derecha, abajo, izquierda]`.
- `flexDirection`, `justifyContent`, `alignItems`, los bordes y el radio de esquina van por el
  canal en línea de `style` (el subconjunto de CSS tipado, véase [estilos](/guide/styling)).
- La separación entre hijos se expresa explícitamente con contenedores de tamaño fijo: así están
  implementados los ayudantes `row` / `column` de la vista previa.

## Uso

```tsx
import { Text, View } from "@dopejs/pingo";

root.render(
  <View
    width={420}
    padding={16}
    backgroundColor="#ffffffff"
    style={{ flexDirection: "column", borderRadius: 10 }}
  >
    <Text value="Título" fontSize={24} lineHeight={32} fontWeight={700} />
    <View height={8} />
    <Text value="Cuerpo" fontSize={14} lineHeight={22} />
  </View>,
);
```

## Text: series de texto

El shaping, los saltos de línea y la medición del texto los hace enteramente el Core: la mezcla
de chino e inglés, los emoji y los caracteres combinantes no requieren participación de la Shell.
El contenido se da con `value` o con `children` de tipo string.

:::preview elements-text
:::

### Props (Text)

| Prop         | Tipo               | Valor predeterminado | Descripción                                                                |
| ------------ | ------------------ | -------------------- | -------------------------------------------------------------------------- |
| `value`      | `string`           | —                    | Contenido del texto (alternativa a `children`)                             |
| `children`   | `string \| number` | —                    | Contenido del texto                                                        |
| `color`      | `Color`            | `#000000ff`          | Color del texto, heredable                                                 |
| `fontSize`   | `number`           | —                    | Tamaño de fuente (píxeles lógicos)                                         |
| `lineHeight` | `number`           | —                    | Altura de línea (píxeles lógicos)                                          |
| `fontWeight` | `number`           | —                    | Peso de la fuente                                                          |
| `fontFamily` | `string`           | —                    | Familia de fuentes CSS                                                     |
| `font`       | `PingoFont`        | —                    | Fuente explícita e inmutable; la entrada no soportada degrada por completo |

`Text` además hereda todas las [CommonProps](/api) (tamaño, padding, eventos, `semanticRole` /
`semanticLabel`, etc.).

## Image: mapas de bits

El `source` de `Image` es un `PingoImage`: un **mapa de bits RGBA8 inmutable** que la Shell
mantiene y que se incorpora en línea como recurso del Scene en el límite de commit. Se crea con
`createImage`, que copia y valida los píxeles:

```tsx
import { createImage, Image } from "@dopejs/pingo";

const icon = createImage(pixels, 96, 96, { label: "Icono de la aplicación" });
<Image source={icon} width={48} height={48} />;
```

Sin `width` / `height`, el nodo toma el tamaño en píxeles de la imagen; si se pasan, la imagen se
escala a la caja del nodo. `label` es el nombre accesible; dejarlo vacío indica una imagen
decorativa.

:::preview elements-image
:::

Píxeles en lugar de bytes codificados es una decisión deliberada: la transacción de recursos
surte efecto síncronamente en el límite de commit, mientras que cualquier formato codificado
requiere decodificación asíncrona. Las imágenes pequeñas como las miniaturas de listas encajan en
esta ruta; las imágenes grandes deben usar la ruta codificada con staging asíncrono.

## Fuentes: PingoFont y loadFont

La prop `font` de `Text` y de los elementos editables acepta una fuente SFNT explícita e
inmutable (TTF/OTF/TTC), con shaping determinista en el Core. `createFont` recibe bytes SFNT ya
decodificados; `loadFont` se ocupa además de la carga por red y la decodificación WOFF/WOFF2:

```tsx
import { loadFont } from "@dopejs/pingo";

const inter = await loadFont("/fonts/Inter-Regular.woff2", {
  fallbackFamily: "sans-serif",
});
<Text value="Hello" font={inter} fontSize={16} />;
```

`PingoFontOptions`: `faceIndex` (índice de la cara dentro de una colección TTC, por defecto `0`)
y `fallbackFamily` (familia CSS usada cuando toda la ruta de fuente explícita degrada, por
defecto `"sans-serif"`). Un fallo de carga lanza `PingoFontLoadError` con un `code` estable (p.
ej. `fetch-failed`, `decode-failed`, `unsupported-format`).

## Accesibilidad

`semanticRole` y `semanticLabel` son props comunes a todos los elementos: los encabezados, los
botones y las regiones deben anotar su semántica en el elemento, y el nombre de `Image` viene del
`label` de `createImage`. La instantánea semántica se refleja como un árbol DOM sombra junto al
canvas; véase [accesibilidad](/guide/accessibility).
