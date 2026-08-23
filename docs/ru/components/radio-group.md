---
title: Radio Group
description: Группа переключателей с выбором одного варианта и навигацией клавишами-стрелками, рендерится на холсте pingo.
---

# Radio Group

Группа переключателей служит для выбора одного варианта из множества взаимоисключающих. Превью ниже рендерится движком pingo в реальном времени — варианты можно щёлкать или перемещать выбор клавишами-стрелками; превью переключается между светлой и тёмной темой вслед за темой сайта.

:::preview radio-group-basic
:::

## Использование

```tsx
import { createElement } from "@dopejs/pingo";
import { RadioGroup, RadioGroupItem } from "@dopejs/pingo-ui";

root.render(
  createElement(RadioGroup, {
    defaultValue: "b",
    onValueChange: (value) => console.log(value),
    children: [
      createElement(RadioGroupItem, { value: "a", label: "选项 A" }),
      createElement(RadioGroupItem, { value: "b", label: "选项 B" }),
      createElement(RadioGroupItem, { value: "c", label: "选项 C" }),
    ],
  }),
);
```

`RadioGroup` публикует текущее значение для `RadioGroupItem` через context, поэтому оба должны монтироваться как компоненты через `createElement`. Передача `value` переводит компонент в контролируемый режим; иначе используйте `defaultValue`, чтобы компонент хранил состояние сам.

## Примеры

### Отключённое состояние

Передача `disabled` на `RadioGroup` отключает всю группу, а семантическое значение отдельных пунктов становится `disabled`.

## Пропсы

### RadioGroup

| Prop            | Тип                       | По умолчанию | Описание                                      |
| --------------- | ------------------------- | ------------ | --------------------------------------------- |
| `value`         | `string`                  | —            | Контролируемое выбранное значение             |
| `defaultValue`  | `string`                  | —            | Неконтролируемое начальное выбранное значение |
| `onValueChange` | `(value: string) => void` | —            | Колбэк изменения выбора                       |
| `disabled`      | `boolean`                 | `false`      | Отключает всю группу                          |
| `children`      | `PingoNode`               | —            | Список `RadioGroupItem` (обязателен)          |
| `className`     | `string`                  | —            | Добавляется после имени класса компонента     |

### RadioGroupItem

| Prop        | Тип      | По умолчанию | Описание                                  |
| ----------- | -------- | ------------ | ----------------------------------------- |
| `value`     | `string` | —            | Значение варианта (обязателен)            |
| `label`     | `string` | —            | Текст варианта                            |
| `className` | `string` | —            | Добавляется после имени класса компонента |

## Доступность

Контейнер группы несёт семантику `radiogroup`, отдельные пункты — семантику `radio` с переключением между `checked` / `unchecked` / `disabled`. Согласно WAI-ARIA, в группе переключателей при любом направлении раскладки обе пары клавиш-стрелок перемещают выбор и синхронно переносят фокус.
