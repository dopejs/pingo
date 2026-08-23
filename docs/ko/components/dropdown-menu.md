---
title: Dropdown Menu
description: 클릭 트리거로 펼쳐지는 동작 메뉴이며, 키보드 탐색을 지원합니다.
---

# Dropdown Menu

Dropdown Menu는 트리거 아래에 동작 항목 집합을 펼칩니다. 아래 미리보기는 pingo 엔진이 실시간 렌더링합니다. 트리거를 클릭하면 열고 닫히며, 사이트 테마에 따라 밝음/어두움이 전환됩니다.

:::preview dropdown-menu-basic
:::

## 사용법

```tsx
import { createElement } from "@dopejs/pingo";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@dopejs/pingo-ui";

root.render(
  createElement(DropdownMenu, {
    onValueChange: (value) => run(value),
    children: [
      createElement(DropdownMenuTrigger, {
        children: createElement(Button, { children: "打开菜单", onPress: () => {} }),
      }),
      createElement(DropdownMenuContent, {
        children: [
          createElement(DropdownMenuItem, { value: "profile", children: "个人资料" }),
          createElement(DropdownMenuItem, { value: "settings", children: "设置" }),
        ],
      }),
    ],
  }),
);
```

Trigger와 Content는 context를 통해 루트 컴포넌트 상태를 읽으므로, 반드시 같은 `DropdownMenu`의 자식 노드여야 합니다. 항목을 하나 선택하면 `onValueChange`가 호출되고 메뉴가 자동으로 닫힙니다. 열림/닫힘은 기본적으로 비제어(`defaultOpen`)이며, 컴포넌트는 제어용 `open` prop을 제공하지 않습니다. 완전히 제어되는 목록 선택이 필요하면 Select를 사용하십시오(둘은 같은 구현을 공유합니다).

## Props

### DropdownMenu

| Prop | 유형 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `value` | `string` | — | 현재 선택된 값(해당 항목 강조) |
| `defaultOpen` | `boolean` | `false` | 초기 열림/닫힘 |
| `onValueChange` | `(value: string) => void` | — | 메뉴 항목 선택 콜백 |
| `onOpenChange` | `(open: boolean) => void` | — | 열림/닫힘 변경 콜백 |
| `children` | `PingoNode` | — | Trigger와 Content(필수) |
| `className` | `string` | — | 앵커 컨테이너 클래스 이름 뒤에 추가 |

### DropdownMenuTrigger

| Prop | 유형 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `children` | `PingoNode` | — | 트리거 요소. 생략하면 현재 값/자리표시자 텍스트를 렌더링합니다 |
| `placeholder` | `string` | — | 선택된 값이 없을 때의 자리표시자 텍스트 |
| `className` | `string` | — | 추가 클래스 이름 |

### DropdownMenuContent

| Prop | 유형 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `children` | `PingoNode` | — | 메뉴 항목(필수) |
| `className` | `string` | — | 추가 클래스 이름 |

### DropdownMenuItem

| Prop | 유형 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `value` | `string` | — | 메뉴 항목 값(필수) |
| `children` | `string` | — | 표시 텍스트(필수) |
| `className` | `string` | — | 추가 클래스 이름 |

## 접근성

메뉴는 menu 의미 체계를, 메뉴 항목은 menuitem 의미 체계를 가집니다. 열린 뒤 방향키로 위아래 이동하고, `Enter`/`Space`로 선택하며, `Escape`로 닫고 포커스를 트리거로 되돌립니다.
