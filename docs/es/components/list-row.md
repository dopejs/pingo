---
title: ListRow
description: Subcomponente molecular de fila de lista que combina componentes básicos como avatar e insignia con estados de selección/desactivación, renderizado en el lienzo de pingo.
---

# ListRow

ListRow es una molécula de producto exclusiva de pingo: una fila de elemento de lista, en la que el título y la descripción ocupan la columna flexible central, mientras que las ranuras `leading` (avatar, icono) y `trailing` (insignia, interruptor, flecha) se sitúan en los extremos. La siguiente vista previa se renderiza en tiempo real mediante el motor de pingo: las filas clicables cuentan con retroalimentación completa del puntero y alternan entre modo claro y oscuro según el tema del sitio.

:::preview list-row-basic
:::

Relación de composición con los componentes básicos de shadcn: ListRow define el diseño de la fila y los estados de interacción, sin incorporar ningún componente de contenido; las ranuras `leading`/`trailing` aceptan cualquier `PingoNode`, siendo las combinaciones típicas Avatar, Badge o Switch. Cuando se necesita espacio entre filas adyacentes, se utiliza un contenedor de altura fija como espaciado (pingo no tiene propiedad gap).

## Uso

```tsx
import { createElement } from "@dopejs/pingo";
import { Avatar, Badge, ListRow } from "@dopejs/pingo-ui";

root.render(
  createElement(ListRow, {
    title: "张三",
    description: "zhangsan@example.com",
    leading: createElement(Avatar, { fallback: "张", size: 32 }),
    trailing: createElement(Badge, { children: "管理员" }),
    onPress: () => openMember("zhangsan"),
  }),
);
```

## Ejemplos

### Selección y desactivación

`selected` aplica el estilo de selección y expone externamente el estado de selección; las filas con `disabled` no llevan ningún manejador de eventos, lo cual es más contundente que "comprobarlo dentro del manejador".

:::preview list-row-states
:::

### Fila solo de presentación

Cuando no se pasa `onPress`, la fila se comporta como un elemento puramente de presentación: su rol semántico es `listitem` y no tiene estilos ni eventos de interacción.

## Props

| Prop | Tipo | Valor por defecto | Descripción |
| --- | --- | --- | --- |
| `title` | `string` | — | Texto del título (obligatorio) |
| `description` | `string` | — | Texto descriptivo secundario |
| `leading` | `PingoNode` | — | Ranura delantera, para colocar un avatar o un icono |
| `trailing` | `PingoNode` | — | Ranura trasera, para colocar una insignia, un interruptor o una flecha |
| `selected` | `boolean` | — | Estado de selección; al pasarlo se exponen los valores semánticos `selected`/`unselected` |
| `disabled` | `boolean` | `false` | Estado de desactivación, no registra ningún manejador de eventos |
| `onPress` | `() => void` | — | Callback de clic; al pasarlo, la fila se vuelve interactiva |
| `className` | `string` | — | Se añade después del nombre de clase del componente |

## Accesibilidad

Las filas interactivas tienen el rol semántico `button`, mientras que las filas solo de presentación tienen `listitem`; el nombre accesible toma el valor de `title`. Al pasar `selected` se exponen los valores semánticos `selected`/`unselected`. Las filas desactivadas no llevan ningún manejador de puntero/teclado y se presentan a las tecnologías de asistencia como elementos puramente estáticos.
