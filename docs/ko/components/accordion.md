---
title: Accordion
description: 한 번에 한 항목만 펼치는 수직 스택 아코디언. pingo canvas에 렌더링됩니다.
---

# Accordion

아코디언은 관련 내용을 펼치고 접을 수 있는 수직 그룹으로 조직하며, 같은 시각에 한 항목만 펼쳐집니다.
아래 미리보기는 pingo 엔진이 실시간으로 렌더링합니다——제목을 클릭해 전환하거나, 방향키로 포커스를
옮기고 Enter/스페이스로 펼쳐 보십시오.

:::preview accordion-basic
:::

## 사용법

```tsx
import { createElement } from "@dopejs/pingo";
import { Accordion, AccordionItem } from "@dopejs/pingo-ui";

root.render(
  createElement(Accordion, {
    defaultOpenValue: "intro",
    children: [
      createElement(AccordionItem, {
        value: "intro",
        title: "pingo-ui란 무엇인가요?",
        children: createElement("text", {
          value: "pingo canvas에 렌더링되는 컴포넌트 라이브러리입니다.",
        }),
      }),
      createElement(AccordionItem, {
        value: "theme",
        title: "다크 테마를 지원하나요?",
        children: createElement("text", { value: "지원합니다. 테마를 따라 자동으로 전환됩니다." }),
      }),
    ],
  }),
);
```

`Accordion`은 비제어(`defaultOpenValue`)와 제어(`openValue` + `onValueChange`) 두 가지 사용법을 모두
지원합니다.

## Props

### Accordion

| Prop               | 타입                                   | 기본값 | 설명                                           |
| ------------------ | -------------------------------------- | ------ | ---------------------------------------------- |
| `openValue`        | `string`                               | —      | 제어: 현재 펼쳐진 항목의 `value`               |
| `defaultOpenValue` | `string`                               | —      | 비제어: 처음 펼쳐진 항목의 `value`             |
| `onValueChange`    | `(value: string \| undefined) => void` | —      | 펼쳐진 항목 변경 콜백. 모두 접히면 `undefined` |
| `children`         | `PingoNode`                            | —      | `AccordionItem` 목록(필수)                     |
| `className`        | `string`                               | —      | 컴포넌트 클래스 이름 뒤에 추가                 |

### AccordionItem

| Prop        | 타입        | 기본값 | 설명                           |
| ----------- | ----------- | ------ | ------------------------------ |
| `value`     | `string`    | —      | 항목의 고유 식별자(필수)       |
| `title`     | `string`    | —      | 트리거 제목(필수)              |
| `children`  | `PingoNode` | —      | 펼쳤을 때 보여 줄 내용(필수)   |
| `className` | `string`    | —      | 컴포넌트 클래스 이름 뒤에 추가 |

## 접근성

방향키(위/아래)는 제목 사이에서 포커스만 옮기고 펼침 상태는 바꾸지 않으며, Home/End는 처음과 끝으로
이동합니다. Enter 또는 스페이스가 펼침을 전환합니다——포커스와 선택의 분리에 대한 WAI-ARIA 요구를
따릅니다. 내용 영역은 접혀 있을 때 언마운트되지 않고 `display: none`으로 숨겨져 펼침 상태가 유지됩니다.
