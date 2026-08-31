---
title: Data Table
description: Tabla virtual con encabezados ordenables; el ordenamiento se reporta mediante un callback y se renderiza sobre el canvas de pingo.
---

# Data Table

Agrega encabezados ordenables sobre [Table](/components/table). El ordenamiento **se reporta, no se ejecuta**: el componente informa el nuevo estado mediante `onSortChange` y tú reordenas la fuente de datos de `getRow`; en las tablas virtuales los datos de las filas suelen estar en el servidor o en un store, por lo que el componente no materializa todas las filas para ordenar. La siguiente vista previa se renderiza en tiempo real con el motor de pingo: haz clic en los encabezados «Miembro», «Commits» o «Actividad reciente» para alternar entre ascendente → descendente → sin ordenar, y sigue el tema claro u oscuro del sitio.

:::preview data-table-sortable
:::

## Uso

```tsx
import { useSignal, type PingoNode } from "@dopejs/pingo";
import { DataTable, type SortState } from "@dopejs/pingo-ui";

function MemberTable(): PingoNode {
  const sort = useSignal<SortState | undefined>(undefined);
  const current = sort.get();
  const rows = sortMembers(members, current); // reordena tú mismo la fuente de datos
  return DataTable<Member>({
    columns: [
      {
        key: "name",
        header: "Miembro",
        sortable: true,
        cell: (row) => <text value={row.name} />,
      },
      {
        key: "commits",
        header: "Commits",
        width: 80,
        align: "end",
        sortable: true,
        cell: (row) => <text value={String(row.commits)} />,
      },
    ],
    sort: current,
    onSortChange: (next) => sort.set(next),
    rowCount: rows.length,
    getRow: (index) => rows[index],
  });
}
```

Al hacer clic en una columna ya ordenada se alterna ascendente → descendente → sin ordenar (regla de `nextSort`); el tercer estado existe porque quien activa el ordenamiento por error necesita una forma de volver al orden original de los datos. Al igual que en Table, el cuerpo de la tabla es una lista virtual y el contenedor padre debe tener una altura definida.

## Props

### DataTableProps\<Row\>

Hereda todos los campos de `TableProps<Row>` (con `columns` reemplazado por una versión ordenable):

| Prop                 | Tipo                                     | Valor predeterminado | Descripción                                                                                                                                    |
| -------------------- | ---------------------------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `columns`            | `readonly DataTableColumn<Row>[]`        | —                    | Definición de columnas (obligatorio); agrega `sortable` respecto de `TableColumn`                                                              |
| `sort`               | `SortState`                              | —                    | Estado de ordenamiento actual; si se omite, significa sin ordenar                                                                              |
| `onSortChange`       | `(sort: SortState \| undefined) => void` | —                    | Callback de cambio de ordenamiento; `undefined` significa cancelar el ordenamiento. Si no se pasa, los encabezados no son clicables            |
| `rowCount`           | `number`                                 | —                    | Número total de filas (obligatorio)                                                                                                            |
| `getRow`             | `(index: number) => Row`                 | —                    | Obtiene los datos de la fila según el índice (obligatorio)                                                                                     |
| `estimatedRowHeight` | `number`                                 | `44`                 | Altura estimada de fila                                                                                                                        |
| `onRowPress`         | `(index: number) => void`                | —                    | Callback al hacer clic en una fila                                                                                                             |
| `emptyLabel`         | `string`                                 | `"暂无数据"`         | Texto del estado vacío                                                                                                                         |
| `renderHeaderCell`   | `(column, index) => PingoNode`           | —                    | Existe en el tipo, pero el componente lo usa internamente para implementar el encabezado ordenable; cualquier valor que se pase se sobrescribe |
| `className`          | `string`                                 | —                    | Se agrega después del nombre de clase del componente                                                                                           |

### DataTableColumn\<Row\>

Extensión de `TableColumn<Row>` que agrega:

| Campo      | Tipo      | Valor predeterminado | Descripción                                          |
| ---------- | --------- | -------------------- | ---------------------------------------------------- |
| `sortable` | `boolean` | `false`              | Indica si el encabezado se puede clicar para ordenar |

### SortState

| Campo       | Tipo                          | Descripción                  |
| ----------- | ----------------------------- | ---------------------------- |
| `key`       | `string`                      | `key` de la columna ordenada |
| `direction` | `"ascending" \| "descending"` | Dirección del ordenamiento   |

El encabezado de la columna actualmente ordenada muestra un indicador `▲` / `▼`.

## Accesibilidad

Las celdas de encabezado tienen semántica `columnheader`; el estado de ordenamiento de las columnas ordenables (`ascending` / `descending` / `none`) se expone a las tecnologías de asistencia mediante valores semánticos, y el encabezado se enfoca antes del clic. Para más información, consulta la [guía de accesibilidad](/guide/accessibility).
