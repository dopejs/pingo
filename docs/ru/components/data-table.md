---
title: Data Table
description: Виртуальная прокрутка таблицы с сортируемыми заголовками, сортировка передается через обратный вызов, рендеринг выполняется на pingo canvas.
---

# Data Table

Надстройка над [Table](/components/table) с сортируемыми заголовками. Сортировка **сообщается, а не выполняется**: компонент сообщает новое состояние сортировки через `onSortChange`, а вы переупорядочиваете источник данных `getRow` — для виртуальной таблицы строки часто находятся на сервере или в store, и компонент не материализует все строки ради сортировки. Превью ниже отрисовывается движком pingo в реальном времени: клик по заголовкам «Участник», «Коммиты», «Последняя активность» переключает порядок по возрастанию → убыванию → отмене и следует переключению светлой/темной темы сайта.

:::preview data-table-sortable
:::

## Использование

```tsx
import { createElement, useSignal, type PingoNode } from "@dopejs/pingo";
import { DataTable, type SortState } from "@dopejs/pingo-ui";

function MemberTable(): PingoNode {
  const sort = useSignal<SortState | undefined>(undefined);
  const current = sort.get();
  const rows = sortMembers(members, current); // переупорядочьте источник данных самостоятельно
  return DataTable<Member>({
    columns: [
      {
        key: "name",
        header: "Участник",
        sortable: true,
        cell: (row) => createElement("text", { value: row.name }),
      },
      {
        key: "commits",
        header: "Коммиты",
        width: 80,
        align: "end",
        sortable: true,
        cell: (row) => createElement("text", { value: String(row.commits) }),
      },
    ],
    sort: current,
    onSortChange: (next) => sort.set(next),
    rowCount: rows.length,
    getRow: (index) => rows[index],
  });
}
```

Клик по уже отсортированной колонке переключает по циклу: возрастание → убывание → отмена (правило `nextSort`); третье состояние существует потому, что пользователь, случайно включивший сортировку, нуждается в способе вернуться к исходному порядку данных. Как и в Table, тело таблицы — виртуальный список, родительскому контейнеру необходимо задать высоту.

## Props

### DataTableProps\<Row\>

Наследует все поля `TableProps<Row>` (вместо `columns` используется сортируемая версия):

| Prop | Тип | По умолчанию | Описание |
| --- | --- | --- | --- |
| `columns` | `readonly DataTableColumn<Row>[]` | — | Определение колонок (обязательное), отличается от `TableColumn` наличием `sortable` |
| `sort` | `SortState` | — | Текущее состояние сортировки; если опущено — сортировка не задана |
| `onSortChange` | `(sort: SortState \| undefined) => void` | — | Обратный вызов при изменении сортировки; `undefined` означает отмену сортировки. Если не передан, заголовки некликабельны |
| `rowCount` | `number` | — | Общее количество строк (обязательное) |
| `getRow` | `(index: number) => Row` | — | Получение данных строки по её номеру (обязательное) |
| `estimatedRowHeight` | `number` | `44` | Оценочная высота строки |
| `onRowPress` | `(index: number) => void` | — | Обратный вызов при клике по строке |
| `emptyLabel` | `string` | `"Нет данных"` | Текст пустого состояния |
| `renderHeaderCell` | `(column, index) => PingoNode` | — | Присутствует в типе, но компонент использует его внутренне для сортируемых заголовков; переданное значение будет перезаписано |
| `className` | `string` | — | Добавляется после имени класса компонента |

### DataTableColumn\<Row\>

Расширение `TableColumn<Row>`, добавлено:

| Поле | Тип | По умолчанию | Описание |
| --- | --- | --- | --- |
| `sortable` | `boolean` | `false` | Можно ли кликнуть по заголовку для сортировки |

### SortState

| Поле | Тип | Описание |
| --- | --- | --- |
| `key` | `string` | `key` сортируемой колонки |
| `direction` | `"ascending" \| "descending"` | Направление сортировки |

Заголовок текущей сортируемой колонки получает индикатор `▲` / `▼`.

## Доступность

Ячейки заголовков имеют семантику `columnheader`; состояние сортировки сортируемых колонок (`ascending` / `descending` / `none`) раскрывается вспомогательным технологиям через семантические значения, перед кликом заголовок получает фокус. Подробнее см. [руководство по доступности](/guide/accessibility).
