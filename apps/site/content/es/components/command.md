---
title: Command
description: Panel de comandos con búsqueda y filtrado, compatible con selección por teclado y confirmación con Enter.
---

# Command

Command es un panel de comandos con cuadro de búsqueda: la entrada filtra las opciones al instante, las flechas mueven el cursor y Enter confirma. La vista previa a continuación se renderiza en tiempo real mediante el motor pingo: escribe directamente en el cuadro de búsqueda para filtrar y sigue el cambio de tema claro/oscuro del sitio.

:::preview command-basic
:::

## Uso

```tsx
import { Command } from "@dopejs/pingo-ui";

root.render(
  <Command
    items={[
      { value: "open", label: "打开文件" },
      { value: "save", label: "保存文件" },
    ]}
    onSelect={(value) => run(value)}
    onDismiss={() => closePalette()}
  />,
);
```

El filtrado es una coincidencia de subcadenas de etiquetas que no distingue entre mayúsculas y minúsculas, y deliberadamente no es difuso: la estrategia de ordenación es una decisión de producto que el componente no asume por quien lo invoca. `onDismiss` responde a `Escape` cuando ninguna tecla de navegación coincide, lo que resulta adecuado para envolver el panel en un Dialog y ofrecer una experiencia «⌘K».

## Props

| Prop          | 类型                      | 默认值     | 说明                                                     |
| ------------- | ------------------------- | ---------- | -------------------------------------------------------- |
| `items`       | `readonly CommandItem[]`  | —          | Opciones de comando (obligatorio)                        |
| `onSelect`    | `(value: string) => void` | —          | Callback al seleccionar una opción (clic o Enter)        |
| `onDismiss`   | `() => void`              | —          | Callback para `Escape`                                   |
| `placeholder` | `string`                  | `"搜索"`   | Nombre accesible del cuadro de búsqueda                  |
| `emptyLabel`  | `string`                  | `"无结果"` | Texto de aviso cuando el filtrado no devuelve resultados |
| `className`   | `string`                  | —          | Nombre de clase adicional                                |

### CommandItem

| 字段    | 类型     | 说明                                                      |
| ------- | -------- | --------------------------------------------------------- |
| `value` | `string` | Valor de la opción (obligatorio)                          |
| `label` | `string` | Texto mostrado y usado para la coincidencia (obligatorio) |

## Accesibilidad

El contenedor tiene semántica de búsqueda, y las opciones tienen semántica de opción con estado seleccionado expuesto; las flechas arriba y abajo mueven el cursor, `Enter` confirma y `Escape` dispara `onDismiss`.
