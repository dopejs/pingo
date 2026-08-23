---
title: StatCard
description: Subcomponente molecular de tarjeta de métricas que muestra valor, variación interperiódica y color de tendencia, renderizado sobre el canvas de pingo.
---

# StatCard

StatCard es una molécula de producto propia de pingo: un mosaico de métricas compuesto por etiqueta, valor, delta interperiódico y texto descriptivo. `trend` solo afecta al color del delta: `flat` lo mantiene en gris neutro, porque una métrica sin cambios no es ni buena ni mala. La vista previa inferior la renderiza el motor de pingo en tiempo real y sigue el tema del sitio al alternar entre claro y oscuro.

:::preview statcard-basic
:::

Relación de composición con los primitivos de shadcn: StatCard es una molécula de presentación autocontenida; internamente solo usa primitivas Text/View y no reserva slots. En los diseños de paneles se suele disponer varias StatCard en fila mediante un contenedor con `flexDirection: "row"`, o combinarlas con Card y Divider para formar bloques de informes. El formateo de los valores (separadores de miles, símbolos de moneda) corre a cargo de quien invoca el componente; `value` y `delta` son cadenas puras.

## Uso

```tsx
import { createElement } from "@dopejs/pingo";
import { StatCard } from "@dopejs/pingo-ui";

root.render(
  createElement(StatCard, {
    label: "本月营收",
    value: "¥128,400",
    delta: "+12.5%",
    trend: "up",
    description: "较上月",
  }),
);
```

## Ejemplos

### Color de tendencia

`trend` acepta `"up"` / `"down"` / `"flat"`, que tiñen el delta con colores de subida, bajada y neutro respectivamente; si no se pasa `trend`, se trata como `flat`.

### Sin delta

Si se omite `delta`, el valor ocupa una línea propia y `trend` no tiene efecto; `description` también puede omitirse.

```tsx
createElement(StatCard, { label: "在线设备", value: "1,024" });
```

## Props

| Prop          | Tipo                       | Valor por defecto | Descripción                                                                                |
| ------------- | -------------------------- | ----------------- | ------------------------------------------------------------------------------------------ |
| `label`       | `string`                   | —                 | Nombre de la métrica (obligatorio)                                                         |
| `value`       | `string`                   | —                 | Valor de la métrica; el formateo corre a cargo de quien invoca el componente (obligatorio) |
| `delta`       | `string`                   | —                 | Variación interperiódica, p. ej. `+12.5%`                                                  |
| `trend`       | `"up" \| "down" \| "flat"` | `"flat"`          | Dirección del color del delta; no afecta a otras partes                                    |
| `description` | `string`                   | —                 | Texto explicativo inferior, como el período de comparación                                 |
| `className`   | `string`                   | —                 | Se añade después del nombre de clase del componente                                        |

## Accesibilidad

StatCard tiene el rol semántico `group`; su nombre accesible toma el valor de `label`, y la etiqueta, el valor y el delta se leen secuencialmente como texto del grupo por las tecnologías de asistencia. Cuando la tendencia se exprese solo mediante color, asegúrate de que el propio texto de `delta` incluya la información de dirección (por ejemplo, el prefijo `+`/`-`) y no dependas únicamente del coloreado rojo/verde.
