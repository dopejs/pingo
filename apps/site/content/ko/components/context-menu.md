---
title: 컨텍스트 메뉴
description: 우클릭으로 실행되는 컨텍스트 메뉴로, 포인터를 누른 위치에 메뉴가 나타납니다.
---

# Context Menu

Context Menu는 대상 영역에서 우클릭(`contextmenu` 이벤트) 시 포인터 위치에 메뉴를 엽니다. 아래 미리보기는 pingo 엔진이 실시간으로 렌더링합니다. 텍스트 영역에서 우클릭하면 메뉴가 열리며 사이트 테마에 따라 밝은 모드와 어두운 모드가 전환됩니다.

:::preview context-menu-basic
:::

## 사용법

```tsx
import { createElement } from "@dopejs/pingo";
import { ContextMenu } from "@dopejs/pingo-ui";

root.render(
  createElement(ContextMenu, {
    items: [
      { value: "copy", label: "复制" },
      { value: "paste", label: "粘贴", disabled: true },
      { value: "delete", label: "删除" },
    ],
    onSelect: (value) => run(value),
    children: createElement("text", { value: "在此右键" }),
  }),
);
```

메뉴는 트리거 모서리가 아니라 포인터를 누른 위치에 배치되며, `Escape`를 누르거나 항목을 하나 선택하면 닫힙니다. 비활성화된 항목은 키보드 탐색에 포함되지 않으며 클릭에도 반응하지 않습니다. 정적 렌더링에서는 트리거 영역만 표시되고 메뉴는 우클릭 시 나타납니다.

## Props

| Prop           | 타입                          | 기본값 | 설명                     |
| -------------- | ----------------------------- | ------ | ------------------------ |
| `children`     | `PingoNode`                   | —      | 트리거 영역 콘텐츠(필수) |
| `items`        | `readonly ContextMenuEntry[]` | —      | 메뉴 항목(필수)          |
| `onSelect`     | `(value: string) => void`     | —      | 메뉴 항목 선택 콜백      |
| `onOpenChange` | `(open: boolean) => void`     | —      | 열림/닫힘 변경 콜백      |
| `className`    | `string`                      | —      | 추가 클래스 이름         |

### ContextMenuEntry

| 필드       | 타입      | 기본값  | 설명               |
| ---------- | --------- | ------- | ------------------ |
| `value`    | `string`  | —       | 메뉴 항목 값(필수) |
| `label`    | `string`  | —       | 표시 텍스트(필수)  |
| `disabled` | `boolean` | `false` | 비활성화 상태      |

## 접근성

메뉴는 menu 시맨틱을 가지며 메뉴 항목은 menuitem 시맨틱을 가집니다. 열린 후에는 방향키로 위아래 이동할 수 있고 `Escape`로 닫습니다.
