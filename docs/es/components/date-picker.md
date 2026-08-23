---
title: Date Picker
description: Selector de calendario emergente vinculado a una fecha, renderizado sobre el lienzo de pingo.
---

# Date Picker

El selector de fechas es un [Calendar](/components/calendar) vinculado a un valor: un disparador más un calendario mensual emergente. La vista previa siguiente es renderizada en tiempo real por el motor de pingo: el calendario ya está expandido, permite cambiar de página, elegir una fecha y alternar entre tema claro y oscuro según el sitio.

:::preview date-picker-basic
:::

## Uso

```tsx
import { createElement } from "@dopejs/pingo";
import { DatePicker, type CalendarDate } from "@dopejs/pingo-ui";

root.render(
  createElement(DatePicker, {
    placeholder: "选择日期",
    onSelect: (date: CalendarDate) => console.log(date),
  }),
);
```

La fecha se representa como `CalendarDate` (`{ year, month, day }`): se guarda en campos separados, de modo que ninguna zona horaria puede desplazarla un día. Al seleccionar una fecha, el panel emergente se cierra automáticamente: si el selector permaneciera abierto, sería solo un calendario.

## Ejemplos

### Formato y marcador de posición

El disparador muestra por defecto la fecha seleccionada según `YYYY-MM-DD`; `format` permite personalizar el renderizado y `placeholder` personaliza el texto cuando no hay selección.

### Apertura controlada

`open` y `onOpenChange` forman una apertura controlada; por defecto, el componente mantiene su propio estado de apertura.

## Props

| Prop | Tipo | Valor predeterminado | Descripción |
| --- | --- | --- | --- |
| `value` | `CalendarDate` | — | Fecha seleccionada |
| `month` | `CalendarDate` | — | Mes mostrado de forma controlada |
| `defaultMonth` | `CalendarDate` | `value ?? 2026-01-01` | Mes inicial no controlado |
| `onSelect` | `(date: CalendarDate) => void` | — | Devolución de llamada al seleccionar una fecha (luego se cierra automáticamente) |
| `onMonthChange` | `(month: CalendarDate) => void` | — | Devolución de llamada al cambiar de página |
| `weekdayLabels` | `readonly string[]` | `["日","一","二","三","四","五","六"]` | Encabezado de días de la semana |
| `monthLabel` | `(month: CalendarDate) => string` | — | Título de mes personalizado |
| `isDisabled` | `(date: CalendarDate) => boolean` | — | Deshabilita fechas específicas |
| `open` | `boolean` | — | Apertura controlada |
| `onOpenChange` | `(open: boolean) => void` | — | Devolución de llamada al abrir o cerrar |
| `placeholder` | `string` | `"选择日期"` | Texto de marcador de posición cuando no hay selección |
| `format` | `(date: CalendarDate) => string` | `formatDate` (`YYYY-MM-DD`) | Renderizado de la fecha en el disparador |
| `className` | `string` | — | Se añade después del nombre de clase del componente |

## Accesibilidad

El disparador tiene semántica de botón y alterna entre `expanded` y `collapsed`; la parte del calendario hereda la semántica de cuadrícula de Calendar. Al abrirse el panel emergente, el foco entra en el panel; al cerrarse, vuelve al disparador.
