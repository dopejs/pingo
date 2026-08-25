---
title: Menubar
description: 데스크톱 스타일의 애플리케이션 메뉴 바. 여러 메뉴가 하나의 열림 위치를 공유합니다.
---

# Menubar

Menubar는 하나의 열림 위치를 공유하는 메뉴 모음으로, 데스크톱 애플리케이션의 메뉴 바와 유사합니다. 아래 미리보기는 pingo 엔진에서 실시간으로 렌더링됩니다. 「파일」「편집」 등의 탭을 클릭하면 해당 메뉴가 열리거나 닫히며, 사이트 테마에 따라 밝은 모드와 어두운 모드가 전환됩니다.

:::preview menubar-basic
:::

## 사용법

```tsx
import { createElement } from "@dopejs/pingo";
import { Menubar, MenubarMenu } from "@dopejs/pingo-ui";

root.render(
  createElement(Menubar, {
    onValueChange: (value) => {},
    children: [
      createElement(MenubarMenu, {
        value: "file",
        label: "파일",
        children: createElement("text", { value: "새로 만들기" }),
      }),
      createElement(MenubarMenu, {
        value: "edit",
        label: "편집",
        children: createElement("text", { value: "실행 취소" }),
      }),
    ],
  }),
);
```

`MenubarMenu`는 context를 통해 메뉴 바 상태를 읽으며, 반드시 `Menubar`의 자식 노드여야 합니다. `children`은 열렸을 때 표시되는 패널 콘텐츠입니다. 열림/닫힘 동작은 기본적으로 비제어 방식이며, `value`를 전달하면 제어 방식으로 전환됩니다(값은 현재 열린 메뉴의 `value`입니다).

## 예제

### 제어 방식으로 열기

`value`를 전달하여 열린 메뉴를 고정합니다. 초기 안내나 외부 상태 동기화에 주로 사용합니다.

:::preview menubar-open
:::

## Props

### Menubar

| Prop            | 타입                                   | 기본값  | 설명                                                                          |
| --------------- | -------------------------------------- | ------- | ----------------------------------------------------------------------------- |
| `value`         | `string`                               | —       | 제어: 현재 열린 메뉴의 값                                                     |
| `onValueChange` | `(value: string \| undefined) => void` | —       | 열린 메뉴 변경 콜백(닫힐 때는 `undefined`)                                    |
| `children`      | `PingoNode`                            | —       | 여러 `MenubarMenu`(필수)                                                      |
| `className`     | `string`                               | —       | 추가 클래스 이름                                                              |
| `navigation`    | `boolean`                              | `false` | 탐색 시맨틱 사용([NavigationMenu](/components/navigation-menu) 내부에서 사용) |

### MenubarMenu

| Prop        | 타입        | 기본값 | 설명                          |
| ----------- | ----------- | ------ | ----------------------------- |
| `value`     | `string`    | —      | 메뉴 식별자(필수)             |
| `label`     | `string`    | —      | 바에 표시되는 라벨(필수)      |
| `children`  | `PingoNode` | —      | 열렸을 때의 패널 콘텐츠(필수) |
| `className` | `string`    | —      | 추가 클래스 이름              |

## 접근성

메뉴 바는 menubar 시맨틱을 가지며, 탭은 menuitem 시맨틱을 가지고 expanded/collapsed 상태를 노출합니다. 좌우 방향키로 메뉴 사이를 이동하며, 메뉴가 열려 있을 때도 동일하게 전환됩니다. `Escape` 키는 메뉴를 닫고 현재 탭에 포커스합니다.
