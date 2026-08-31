---
title: TopBar
description: Componente molecular de la barra superior de la aplicación, compuesto por un título y ranuras delantera y trasera, renderizado en el lienzo de pingo.
---

# TopBar

TopBar es la molécula de producto característica de pingo: combina el título con dos ranuras — `leading` (logo, volver) y `actions` (botones, avatar) — en una única fila que forma la barra superior de la aplicación. La columna del título ocupa siempre el espacio restante (`flexGrow`), empujando las acciones hacia el extremo derecho, sin necesidad de mediciones. La vista previa a continuación es renderizada en tiempo real por el motor de pingo y alterna entre claro y oscuro según el tema del sitio.

:::preview topbar-basic
:::

Relación de composición con los componentes básicos de shadcn: TopBar no proporciona botones ni avatares por sí mismo; define el **esqueleto de diseño**. Las ranuras `leading` y `actions` aceptan cualquier `PingoNode`, normalmente compuestas por [Button](/components/button), IconButton, Avatar y otros componentes básicos. Múltiples acciones se envuelven en un contenedor con `flexDirection: "row"` y se pasan como un único nodo.

## Uso

```tsx
import { Avatar, Button, TopBar } from "@dopejs/pingo-ui";

root.render(
  <TopBar
    title="仪表盘"
    leading={<Avatar fallback="P" size={28} />}
    actions={
      <Button variant="outline" onPress={() => create()}>
        新建
      </Button>
    }
  />,
);
```

## Ejemplos

### Sin título

Al omitir `title`, la columna del título se renderiza igualmente (una columna flexible vacía) y las acciones siguen empujadas al extremo derecho; adecuado para barras de herramientas que solo contienen una zona de acciones.

```tsx
<TopBar actions={<Button onPress={() => {}}>导出</Button>} />
```

## Props

| Prop        | Tipo        | Valor por defecto | Descripción                                                           |
| ----------- | ----------- | ----------------- | --------------------------------------------------------------------- |
| `title`     | `string`    | —                 | Texto del título; al omitirlo se renderiza una columna flexible vacía |
| `leading`   | `PingoNode` | —                 | Ranura delantera para el logo o el botón de volver                    |
| `actions`   | `PingoNode` | —                 | Ranura trasera, empujada al extremo derecho por la columna del título |
| `className` | `string`    | —                 | Se añade después del nombre de clase del componente                   |

## Accesibilidad

TopBar tiene el rol semántico `banner`; cuando se proporciona `title`, el texto del título lleva el rol `heading`. Los atributos de accesibilidad de los componentes dentro de las ranuras (como `semanticLabel` en IconButton) son responsabilidad de cada componente.
