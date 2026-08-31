---
title: Pagination
description: Control de paginación estilo shadcn con elipsis de números de página y estados deshabilitados en los límites, renderizado en el canvas de pingo.
---

# Pagination

Control de paginación: la página actual se resalta, las secuencias largas de números se pliegan automáticamente en puntos suspensivos, y las flechas correspondientes se deshabilitan al llegar a la primera o última página. La vista previa inferior se renderiza en tiempo real con el motor pingo: puedes hacer clic en los números y las flechas para cambiar de página, y seguir el tema del sitio alternando entre claro y oscuro.

:::preview pagination-basic
:::

## Uso

El número de página es **controlado**: `page` comienza en 1 y el cambio de página se comunica mediante `onPageChange`, para que tú lo reescribas.

```tsx
import { useSignal, type PingoNode } from "@dopejs/pingo";
import { Pagination } from "@dopejs/pingo-ui";

function PagedList(): PingoNode {
  const page = useSignal(1);
  return <Pagination page={page.get()} pageCount={12} onPageChange={(next) => page.set(next)} />;
}
```

## Ejemplos

### Modo compacto

`siblingCount` controla cuántos números de página se muestran a cada lado de la página actual (sin contar la primera y la última, que siempre se muestran). Al establecerlo en `0`, solo se conservan la primera, la última y la página actual; en la primera página, la flecha de página anterior se deshabilita.

:::preview pagination-compact
:::

La regla de plegado de la secuencia de números la implementa la función pura exportada `paginationRange(page, pageCount, siblingCount)`, que puede usarse de forma aislada en pruebas.

## Props

| Prop            | Tipo                     | Valor predeterminado | Descripción                                                                                                                               |
| --------------- | ------------------------ | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `page`          | `number`                 | —                    | Página actual, comienza en 1 (obligatorio); los valores fuera de rango se ajustan a `[1, pageCount]`                                      |
| `pageCount`     | `number`                 | —                    | Número total de páginas (obligatorio); si es menor que 1 no se renderiza ningún número de página                                          |
| `onPageChange`  | `(page: number) => void` | —                    | Devolución de llamada al cambiar de página; no se activa al hacer clic en la página actual o en destinos fuera de rango                   |
| `siblingCount`  | `number`                 | `1`                  | Cantidad de números de página mostrados a cada lado de la página actual                                                                   |
| `previousLabel` | `string`                 | —                    | Texto de página anterior reservado en el tipo; la versión actual lo renderiza como icono y este campo aún no participa en el renderizado  |
| `nextLabel`     | `string`                 | —                    | Texto de página siguiente reservado en el tipo; la versión actual lo renderiza como icono y este campo aún no participa en el renderizado |
| `className`     | `string`                 | —                    | Se añade después del nombre de clase del componente                                                                                       |

## Accesibilidad

El control en su conjunto tiene semántica de `navigation`; la página actual lleva el valor semántico `current`, y los nombres accesibles de los botones de página anterior y siguiente son "previous page" / "next page". Al llegar a los límites se deshabilitan y no responden al puntero. Con el teclado, `ArrowLeft` / `ArrowRight` cambian de página desde cualquier foco dentro del control. Consulta más en la [guía de accesibilidad](/guide/accessibility).
