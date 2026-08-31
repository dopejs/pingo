---
title: Calendar
description: Calendario mensual al estilo shadcn, con rejilla fija de seis filas y fechas expresadas por partes de año/mes/día para evitar desplazamientos de zona horaria.
---

# Calendar

Calendario mensual al estilo shadcn. Las fechas se expresan con las tres partes
`{ year, month, day }` (`month` empieza en 1), de modo que ninguna zona horaria desplaza la fecha;
la rejilla tiene seis filas fijas, así que la altura del componente no cambia al pasar de mes. La
vista previa de abajo se renderiza en vivo con el motor pingo: puedes hacer clic para elegir fecha,
cambiar de mes con las flechas, y sigue el tema del sitio al cambiar entre claro y oscuro.

:::preview calendar-basic
:::

## Uso

La selección es **controlada**: hacer clic en una fecha dispara `onSelect` y te toca escribir de
vuelta `value`. El mes puede autogestionarse dentro del componente (`defaultMonth`) o controlarse
por completo con `month` + `onMonthChange`.

```tsx
import { useSignal, type PingoNode } from "@dopejs/pingo";
import { Calendar, type CalendarDate } from "@dopejs/pingo-ui";

function DateField(): PingoNode {
  const selected = useSignal<CalendarDate>({ year: 2026, month: 8, day: 22 });
  return (
    <Calendar
      defaultMonth={{ year: 2026, month: 8, day: 1 }}
      value={selected.get()}
      onSelect={(date) => selected.set(date)}
    />
  );
}
```

## Ejemplos

### Fechas deshabilitadas

`isDisabled` decide por fecha si es seleccionable; las fechas deshabilitadas no responden al
puntero ni al teclado. Abajo se deshabilitan los fines de semana:

:::preview calendar-disabled
:::

## Props

### CalendarProps

| Prop            | Tipo                              | Valor predeterminado                   | Descripción                                                               |
| --------------- | --------------------------------- | -------------------------------------- | ------------------------------------------------------------------------- |
| `value`         | `CalendarDate`                    | —                                      | Fecha seleccionada (controlada)                                           |
| `month`         | `CalendarDate`                    | —                                      | Mes mostrado (controlado); si se omite lo gestiona el estado interno      |
| `defaultMonth`  | `CalendarDate`                    | `value` ?? enero de 2026               | Mes inicial en modo no controlado                                         |
| `onSelect`      | `(date: CalendarDate) => void`    | —                                      | Callback de clic en una fecha                                             |
| `onMonthChange` | `(month: CalendarDate) => void`   | —                                      | Callback de cambio de mes (se dispara en modo controlado y no controlado) |
| `weekdayLabels` | `readonly string[]`               | `["日","一","二","三","四","五","六"]` | Cabeceras de día de la semana, empezando por el domingo                   |
| `monthLabel`    | `(month: CalendarDate) => string` | formato `"2026 年 8 月"`               | Título de mes personalizado                                               |
| `isDisabled`    | `(date: CalendarDate) => boolean` | —                                      | Deshabilita ciertas fechas                                                |
| `className`     | `string`                          | —                                      | Se añade tras las clases del propio componente                            |

### CalendarDate

| Campo   | Tipo     | Descripción |
| ------- | -------- | ----------- |
| `year`  | `number` | Año         |
| `month` | `number` | Mes, 1–12   |
| `day`   | `number` | Día, 1–31   |

El paquete exporta además funciones puras como `daysInMonth`, `monthGrid`, `shiftMonth` y
`sameDate` para facilitar la lógica de fechas personalizada.

## Accesibilidad

El calendario en conjunto tiene semántica `group`; las flechas de cambio de mes tienen los nombres
accesibles "previous month" / "next month", las celdas de fecha tienen semántica button y la fecha
seleccionada lleva el valor semántico `selected`. Con el teclado, `PageUp` / `PageDown` cambian de
mes desde cualquier posición de la rejilla, sin atrapar al usuario de teclado en el mes actual.
Más detalles en la [guía de accesibilidad](/guide/accessibility).
