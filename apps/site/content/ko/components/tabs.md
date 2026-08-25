---
title: Tabs
description: 탭은 동일한 영역에서 여러 동위 콘텐츠 패널을 전환하며, pingo canvas에 렌더링합니다.
---

# Tabs

탭은 동일한 영역에서 여러 동위 콘텐츠 패널을 전환합니다. 아래 미리보기는 pingo 엔진이 실시간으로 렌더링합니다. 탭을 클릭하여 전환하거나, 좌우 방향키로 탭 사이를 이동할 수 있습니다.

:::preview tabs-basic
:::

## 사용법

```tsx
import { createElement } from "@dopejs/pingo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@dopejs/pingo-ui";

root.render(
  createElement(Tabs, {
    defaultValue: "account",
    children: [
      createElement(TabsList, {
        children: [
          createElement(TabsTrigger, { value: "account", children: "账户" }),
          createElement(TabsTrigger, { value: "password", children: "密码" }),
        ],
      }),
      createElement(TabsContent, {
        value: "account",
        children: createElement("text", { value: "管理你的账户信息。" }),
      }),
      createElement(TabsContent, {
        value: "password",
        children: createElement("text", { value: "修改你的登录密码。" }),
      }),
    ],
  }),
);
```

`Tabs`는 비제어(`defaultValue`)와 제어(`value` + `onValueChange`) 두 가지 방식을 모두 지원합니다.

## Props

### Tabs

| Prop            | 타입                      | 기본값 | 설명                                    |
| --------------- | ------------------------- | ------ | --------------------------------------- |
| `value`         | `string`                  | —      | 제어 방식: 현재 선택된 탭의 `value`     |
| `defaultValue`  | `string`                  | —      | 비제어 방식: 초기에 선택된 탭의 `value` |
| `onValueChange` | `(value: string) => void` | —      | 선택 변경 콜백                          |
| `children`      | `PingoNode`               | —      | `TabsList`와 여러 `TabsContent` (필수)  |
| `className`     | `string`                  | —      | 컴포넌트 클래스명 뒤에 추가             |

### TabsList

| Prop        | 타입        | 기본값 | 설명                        |
| ----------- | ----------- | ------ | --------------------------- |
| `children`  | `PingoNode` | —      | `TabsTrigger` 목록 (필수)   |
| `className` | `string`    | —      | 컴포넌트 클래스명 뒤에 추가 |

### TabsTrigger

| Prop        | 타입     | 기본값 | 설명                                        |
| ----------- | -------- | ------ | ------------------------------------------- |
| `value`     | `string` | —      | 해당 `TabsContent`와 연결되는 식별자 (필수) |
| `children`  | `string` | —      | 탭 텍스트 (필수)                            |
| `className` | `string` | —      | 컴포넌트 클래스명 뒤에 추가                 |

### TabsContent

| Prop        | 타입        | 기본값 | 설명                                        |
| ----------- | ----------- | ------ | ------------------------------------------- |
| `value`     | `string`    | —      | 해당 `TabsTrigger`와 연결되는 식별자 (필수) |
| `children`  | `PingoNode` | —      | 패널 콘텐츠 (필수)                          |
| `className` | `string`    | —      | 컴포넌트 클래스명 뒤에 추가                 |

## 접근성

탭 목록은 tablist 의미를 가지며, 탭은 tab 의미를 갖고 보조 기술에 선택 상태를 노출합니다. 좌우 방향키와 Home/End 키로 탭 사이를 이동하며 동시에 선택하고, 포커스는 선택과 함께 이동합니다. 비활성 패널은 언마운트하지 않고 `display: none`으로 숨기므로 패널 내부의 스크롤 위치와 편집 상태가 유지됩니다.
