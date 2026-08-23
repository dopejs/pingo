---
title: Table
description: Tabla de datos con desplazamiento virtual; las definiciones de columna controlan tanto el encabezado como las filas, renderizada sobre el canvas de pingo.
---

# Table

Tabla con desplazamiento virtual: las definiciones de columna controlan tanto el encabezado como cada fila; diez mil filas y una sola pantalla tienen el mismo costo de renderizado. La vista previa siguiente es renderizada en tiempo real por el motor pingo: puedes desplazarte, hacer clic en las filas y alternar entre tema claro y oscuro según el tema del sitio.

:::preview table-basic
:::

## Uso

`Table` es una función de construcción pura y no un componente memo; se llama directamente y devuelve el nodo de escena. Si se invoca dentro del ámbito de renderizado de un componente (como en el componente de función siguiente), su lectura de tema se suscribirá al cambio de tema del sitio.

```tsx
import { createElement, type PingoNode } from "@dopejs/pingo";
import { Table } from "@dopejs/pingo-ui";

type FileRow = { name: string; size: string };

function FileTable(): PingoNode {
  return Table<FileRow>({
    columns: [
      {
        key: "name",
        header: "Nombre",
        cell: (row) => createElement("text", { value: row.name }),
      },
      {
        key: "size",
        header: "Tamaño",
        width: 96,
        align: "end",
        cell: (row) => createElement("text", { value: row.size }),
      },
    ],
    rowCount: files.length,
    getRow: (index) => files[index],
    onRowPress: (index) => open(files[index]),
  });
}
```

El cuerpo de la tabla es un [VirtualList](/guide/scrolling) y necesita que el contenedor padre le proporcione una altura (en el ejemplo, el contenedor exterior tiene `height: 260`).

## Ejemplos

### Estado vacío

Cuando `rowCount` es `0`, se renderiza `emptyLabel` (por defecto «Sin datos») y no se crea la lista virtual.

:::preview table-empty
:::

## Props

### TableProps\<Row\>

| Prop                 | Tipo                                                     | Valor por defecto | Descripción                                                                                           |
| -------------------- | -------------------------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------- |
| `columns`            | `readonly TableColumn<Row>[]`                            | —                 | Definiciones de columna; controlan tanto el encabezado como las filas (obligatorio)                   |
| `rowCount`           | `number`                                                 | —                 | Número total de filas (obligatorio); cuando es `0` se renderiza el estado vacío                       |
| `getRow`             | `(index: number) => Row`                                 | —                 | Obtiene los datos de la fila por número de fila; solo se invoca para la ventana visible (obligatorio) |
| `estimatedRowHeight` | `number`                                                 | `44`              | Altura estimada de fila, usada para planificar el desplazamiento virtual                              |
| `onRowPress`         | `(index: number) => void`                                | —                 | Callback al hacer clic en una fila; al proporcionarlo, las filas se vuelven enfocables                |
| `emptyLabel`         | `string`                                                 | `"Sin datos"`     | Texto del estado vacío                                                                                |
| `renderHeaderCell`   | `(column: TableColumn<Row>, index: number) => PingoNode` | —                 | Reemplaza la celda de encabezado predeterminada de una columna                                        |
| `className`          | `string`                                                 | —                 | Se agrega después del nombre de clase del componente                                                  |

### TableColumn\<Row\>

| Campo    | Tipo                                     | Valor por defecto | Descripción                                                                              |
| -------- | ---------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------- |
| `key`    | `string`                                 | —                 | Identificador de la columna, usado como key del nodo (obligatorio)                       |
| `header` | `string`                                 | —                 | Texto del encabezado (obligatorio)                                                       |
| `width`  | `number`                                 | —                 | Ancho fijo (en píxeles lógicos); si se omite, el ancho restante se asigna según `flex`   |
| `flex`   | `number`                                 | `1`               | Proporción de asignación del ancho restante cuando no se define `width`                  |
| `align`  | `"start" \| "center" \| "end"`           | `"start"`         | Alineación horizontal del contenido de la columna; se comparte entre encabezado y celdas |
| `cell`   | `(row: Row, index: number) => PingoNode` | —                 | Función que construye el contenido de la celda (obligatorio)                             |

La tabla virtual no puede medir el ancho de las columnas a partir del contenido: las filas no renderizadas no participan en la medición, por lo que el ancho de columna solo puede provenir de la definición de columnas. Esto también hace que el encabezado y las filas queden alineados de forma natural.

## Accesibilidad

La tabla tiene semántica `table`, el encabezado es `columnheader` y cada fila es `row`; al pasar `onRowPress`, las filas pueden enfocarse y activarse mediante el puntero. Para más información, consulta la [guía de accesibilidad](/guide/accessibility).
