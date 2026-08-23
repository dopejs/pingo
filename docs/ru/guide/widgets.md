---
title: "Widgets: движковые компоненты без стилей"
description: "@dopejs/pingo-widgets предоставляет TextField, TextArea, Pressable, Button и другие движковые компоненты без стилей, а также границы с @dopejs/pingo-ui."
---

# Widgets: движковые компоненты без стилей

`@dopejs/pingo-widgets` — первый слой композиции над движком: он собирает
[редактируемые примитивы](/guide/elements-editing) с фокусом и нативными событиями в готовые
компоненты, добавляя **минимальное** оформление (рамку, состояние ошибки) и не предполагая
никакой дизайн-системы. Бизнес-код не зависит от этого внутреннего пакета напрямую — все
экспорты реэкспортируются через `@dopejs/pingo`. Превью ниже рендерится вживую, в него можно
вводить текст.

:::preview widgets-textfield
:::

## Экспорт и именование

| Экспорт | Описание |
| --- | --- |
| `TextField` | Однострочный ввод: рамка + оформление состояния ошибки, внутри только комбинирует примитив `editableText` |
| `TextArea` | Многострочный вариант; Enter переносит строку, submit остаётся хост-форме |
| `Pressable` | Фокусируемая активируемая поверхность: View + фокус + нативные click/tap |
| `Button` | Удобная текстовая кнопка из `Pressable` + `Text` |

Замечание по именованию: `TextArea` в `@dopejs/pingo` означает именно этот оформленный
widget; многострочный **примитив** экспортируется как `UnstyledTextArea` (`TextAreaProps`
аналогично имеет псевдоним `UnstyledTextAreaProps`).

## TextField и TextArea

Оформление по умолчанию — рамка 1px, внутренний отступ 8px; при передаче строки `error`
рамка переключается на цвет ошибки, а под полем рендерится сообщение об ошибке с ролью
`alert`. Управляемый контракт (`value` + `revision` + `onTransaction`) полностью совпадает
с [редактируемыми элементами](/guide/elements-editing) — widget не вводит нового пути ввода.

```tsx
import { createElement, TextField } from "@dopejs/pingo";

createElement(TextField, {
  value,
  revision,
  semanticLabel: "收件人",
  width: 320,
  error: value === "" ? "收件人不能为空" : undefined,
  onTransaction: (t) => apply(t),
});
```

### Props (TextField)

| Prop | Тип | По умолчанию | Описание |
| --- | --- | --- | --- |
| `value` | `string` | `""` | Управляемый текст |
| `revision` | `number \| bigint` | `0n` | Авторитетная revision управляемого значения |
| `controller` | `TextEditingController` | — | Локальный controller; взаимоисключающий с `value`/`revision` |
| `readOnly` | `boolean` | — | Только чтение |
| `password` | `boolean` | — | Режим пароля (открытый текст не попадает в DisplayList и значения доступности) |
| `maxGraphemes` | `number` | — | Максимум графем |
| `inputMode` | `EditableInputMode` | — | Подсказка раскладки экранной клавиатуры |
| `width` | `number` | `240` | Общая ширина с рамкой |
| `height` | `number` | `lineHeight × rows + 16` | Общая высота с рамкой |
| `fontSize` | `number` | `14` | Размер шрифта |
| `lineHeight` | `number` | `round(fontSize × 1.5)` | Высота строки |
| `color` | `Color` | `#1f2329ff` | Цвет текста |
| `backgroundColor` | `Color` | `#ffffffff` | Цвет фона поля |
| `borderColor` | `Color` | `#c0c4ccff` | Цвет рамки |
| `errorColor` | `Color` | `#d03050ff` | Цвет рамки и сообщения в состоянии ошибки |
| `error` | `string` | — | Непустое значение — состояние ошибки: рамка цвета ошибки + сообщение под полем |
| `onTransaction` | `(t: EditTransaction) => void` | — | Колбэк транзакции редактирования Core |
| `onSubmit` | `() => void` | — | Отправка однострочного ввода по Enter |
| `semanticLabel` | `string` | — | Имя доступности (роль всегда `textbox`) |

`TextArea` дополнительно добавляет `rows` (по умолчанию `3`) для вычисления высоты по
умолчанию.

## Pressable и Button

`Pressable` не вводит новый тип узла Scene: это просто `View` с семантикой `button`, который
автоматически получает фокус при нажатии и отображает нативные click/tap в `onPress`. Стиль
полностью определяется через `style` и `children`; при `disabled` снижается прозрачность и
снимаются события.

| Prop | Тип | По умолчанию | Описание |
| --- | --- | --- | --- |
| `children` | `PingoNode` | — | Содержимое (у Button — `string \| number`, обязательное) |
| `disabled` | `boolean` | `false` | Состояние отключения |
| `onPress` | `() => void` | — | Колбэк активации |
| `className` | `string` | — | Имя класса (подключение таблицы стилей) |
| `style` | `PingoStyle` | — | Инлайн-стиль |
| `width` / `height` | `number` | — | Размеры |
| `semanticLabel` | `string` | `Button` берёт из `children` | Имя доступности |

`Button` дополнительно принимает `color` и `fontSize` (передаются внутреннему тексту).

## Границы с @dopejs/pingo-ui

Два слоя отвечают на разные вопросы:

- **widgets** — корректность поведения: транзакции редактирования, фокус, семантические
  роли, минимальное оформление. Не содержит дизайн-решений, все цвета и размеры шрифта
  можно переопределить.
- **@dopejs/pingo-ui** — дизайн-система: полноценные компоненты в духе shadcn (варианты,
  размеры, темы, таблицы стилей), внутри комбинирует widgets, `@dopejs/pingo-editing` и
  runtime-хуки, без каких-либо изменений движка.

Рекомендации по выбору: нужна готовая дизайн-система — используйте напрямую
[компоненты pingo-ui](/components); есть собственный дизайн-язык, но не хочется трогать
детали транзакций редактирования — используйте widgets как фундамент; нужна полная
кастомизация (например, игровой HUD) — используйте напрямую примитивы
[базовых элементов](/guide/elements).

## Доступность

`TextField` / `TextArea` имеют роль `textbox`, сообщение `error` — роль `alert`;
`Pressable` / `Button` — роль `button`, `disabled` раскрывается через `semanticValue`.
Имена задаются через `semanticLabel` — не опускайте его, когда нет видимой метки.
Подробнее см. [Доступность](/guide/accessibility).
