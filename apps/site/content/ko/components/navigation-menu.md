---
title: Navigation Menu
description: 사이트 내비게이션 스타일의 메뉴 바입니다. 동작은 Menubar와 동일하며 시맨틱은 내비게이션입니다.
---

# Navigation Menu

Navigation Menu는 내비게이션 시맨틱 버전의 [Menubar](/components/menubar)입니다. 동일한 트리거 행과 펼침 패널을 가지지만, 외부에 내비게이션 시맨틱을 노출하므로 사이트 주요 내비게이션에 적합합니다. 아래 미리보기는 pingo 엔진에 의해 실시간으로 렌더링되며, 사이트 테마에 따라 밝은 모드와 어두운 모드가 전환됩니다.

:::preview navigation-menu-basic
:::

## 사용법

```tsx
import { createElement } from "@dopejs/pingo";
import { MenubarMenu, NavigationMenu } from "@dopejs/pingo-ui";

root.render(
  createElement(NavigationMenu, {
    onValueChange: (value) => {},
    children: [
      createElement(MenubarMenu, {
        value: "products",
        label: "产品",
        children: createElement("text", { value: "渲染引擎" }),
      }),
      createElement(MenubarMenu, {
        value: "docs",
        label: "文档",
        children: createElement("text", { value: "快速开始" }),
      }),
    ],
  }),
);
```

항목은 `MenubarMenu`를 재사용합니다. 열림/닫힘은 기본적으로 비제어 방식이며, `value`를 전달하면 제어 방식으로 전환됩니다. 상호작용 동작(키보드 내비게이션, 열림 위치 공유)은 Menubar와 완전히 동일합니다.

## Props

`NavigationMenu`는 `MenubarProps`에서 `navigation`을 제외한 모든 props를 받습니다.

| Prop            | 타입                                   | 기본값 | 설명                                        |
| --------------- | -------------------------------------- | ------ | ------------------------------------------- |
| `value`         | `string`                               | —      | 제어: 현재 열려 있는 메뉴의 값              |
| `onValueChange` | `(value: string \| undefined) => void` | —      | 열린 메뉴 변경 콜백 (닫힐 때는 `undefined`) |
| `children`      | `PingoNode`                            | —      | 여러 `MenubarMenu` (필수)                   |
| `className`     | `string`                               | —      | 추가 클래스 이름                            |

항목 props는 [Menubar](/components/menubar#menubarmenu)를 참조하세요.

## 접근성

컨테이너는 내비게이션 시맨틱을 가지며, 라벨은 menuitem 시맨틱을 가지고 expanded/collapsed 상태를 노출합니다. 좌우 방향키로 항목 간 이동이 가능하며, `Escape` 키를 누르면 닫히고 현재 라벨로 포커스가 이동합니다.
