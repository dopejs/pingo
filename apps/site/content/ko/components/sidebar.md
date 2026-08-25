---
title: Sidebar
description: "제품 내비게이션 사이드바: 그룹, 항목, 선택 상태를 pingo 캔버스에 렌더링합니다."
---

# Sidebar

Sidebar는 애플리케이션 수준의 내비게이션 열로, 그룹(Section)과 항목(Item)으로 구성되며 선택 상태와 키보드 내비게이션을 내장하고 있습니다. 아래 미리보기는 pingo 엔진에 의해 실시간으로 렌더링됩니다. 항목을 클릭하거나 포커스한 뒤 방향키로 전환할 수 있습니다.

:::preview sidebar-basic
:::

## 사용법

```tsx
import { createElement } from "@dopejs/pingo";
import { Sidebar, SidebarItem, SidebarSection } from "@dopejs/pingo-ui";

root.render(
  createElement(Sidebar, {
    defaultValue: "stats",
    onValueChange: (value) => navigate(value),
    children: [
      createElement(SidebarSection, {
        title: "작업 공간",
        children: [
          createElement(SidebarItem, { value: "home", label: "홈" }),
          createElement(SidebarItem, { value: "stats", label: "통계" }),
        ],
      }),
      createElement(SidebarSection, {
        title: "시스템",
        children: createElement(SidebarItem, { value: "settings", label: "설정" }),
      }),
    ],
  }),
);
```

`Sidebar`는 비제어(`defaultValue`)와 제어(`value` + `onValueChange`) 방식을 모두 지원합니다. 사이드바 너비는 테마 토큰에 따라 결정됩니다(기본값 240px).

## Props

### Sidebar

| Prop            | 타입                      | 기본값 | 설명                                 |
| --------------- | ------------------------- | ------ | ------------------------------------ |
| `value`         | `string`                  | —      | 제어: 현재 선택된 항목의 `value`     |
| `defaultValue`  | `string`                  | —      | 비제어: 초기에 선택된 항목의 `value` |
| `onValueChange` | `(value: string) => void` | —      | 선택 변경 콜백                       |
| `children`      | `PingoNode`               | —      | `SidebarSection` 목록(필수)          |
| `className`     | `string`                  | —      | 컴포넌트 클래스 이름 뒤에 추가       |

### SidebarSection

| Prop        | 타입        | 기본값 | 설명                                               |
| ----------- | ----------- | ------ | -------------------------------------------------- |
| `title`     | `string`    | —      | 그룹 제목. 생략하면 제목 행을 렌더링하지 않습니다. |
| `children`  | `PingoNode` | —      | `SidebarItem` 목록(필수)                           |
| `className` | `string`    | —      | 컴포넌트 클래스 이름 뒤에 추가                     |

### SidebarItem

| Prop        | 타입        | 기본값 | 설명                                               |
| ----------- | ----------- | ------ | -------------------------------------------------- |
| `value`     | `string`    | —      | 항목의 고유 식별자(필수)                           |
| `label`     | `string`    | —      | 항목 텍스트이며 접근성 이름으로도 사용됩니다(필수) |
| `icon`      | `PingoNode` | —      | 앞쪽 슬롯으로 아이콘에 사용                        |
| `className` | `string`    | —      | 컴포넌트 클래스 이름 뒤에 추가                     |

## 접근성

사이드바는 navigation 시맨틱을 가지며, 항목은 link 시맨틱을 가집니다. `label`을 접근성 이름으로 사용하고 selected/unselected 상태를 노출합니다. 위아래 방향키와 Home/End로 항목 사이를 이동하며, 선택과 포커스가 함께 이동합니다.

사이드바 너비와 색상 사용자 지정은 [스타일 가이드](/guide/styling)를 참조하십시오.
