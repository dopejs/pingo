---
title: Popover
description: 트리거 옆에 고정되는 플로팅 패널로, 보충 정보와 가벼운 작업을 제공합니다.
---

# Popover

Popover는 트리거 옆에 플로팅 패널을 열며, 페이지를 스크롤해도 패널이 고정된 위치를 유지합니다. 아래 미리보기는 pingo 엔진이 실시간으로 렌더링합니다. 트리거를 클릭하면 패널이 열리고 닫히며, 사이트 테마에 따라 밝은 모드와 어두운 모드가 전환됩니다.

:::preview popover-basic
:::

## 사용법

```tsx
import { createElement } from "@dopejs/pingo";
import { Button, Popover, PopoverContent, PopoverTrigger } from "@dopejs/pingo-ui";

root.render(
  createElement(Popover, {
    defaultOpen: false,
    onOpenChange: (open) => {},
    children: [
      createElement(PopoverTrigger, {
        children: createElement(Button, { children: "패널 열기", onPress: () => {} }),
      }),
      createElement(PopoverContent, {
        children: createElement("text", { value: "임의의 내용" }),
      }),
    ],
  }),
);
```

`PopoverTrigger`와 `PopoverContent`는 context를 통해 루트 컴포넌트 상태를 읽으며, 반드시 같은 `Popover`의 자식 노드여야 합니다. 기본값은 비제어 방식(`defaultOpen`)이며, `open`을 전달하면 제어 방식으로 전환됩니다. 패널은 기본적으로 트리거 아래쪽에 고정되며, 레이아웃 재측정을 활성화하면 공간이 부족할 때 자동으로 반대쪽으로 뒤집힙니다.

## 예제

### 임의의 내용

`PopoverContent`의 `children`은 임의의 `PingoNode`를 받을 수 있으므로 폼, 목록, 타이포그래피 콘텐츠를 넣을 수 있습니다.

:::preview popover-rich
:::

## Props

### Popover

| Prop           | 타입                      | 기본값  | 설명                                |
| -------------- | ------------------------- | ------- | ----------------------------------- |
| `open`         | `boolean`                 | —       | 제어 방식의 열림/닫힘 상태          |
| `defaultOpen`  | `boolean`                 | `false` | 비제어 방식의 초기 열림/닫힘 상태   |
| `onOpenChange` | `(open: boolean) => void` | —       | 열림/닫힘 변경 콜백                 |
| `children`     | `PingoNode`               | —       | Trigger와 Content (필수)            |
| `className`    | `string`                  | —       | 앵커 컨테이너 클래스 이름 뒤에 추가 |

### PopoverTrigger

| Prop        | 타입        | 기본값 | 설명               |
| ----------- | ----------- | ------ | ------------------ |
| `children`  | `PingoNode` | —      | 트리거 요소 (필수) |
| `className` | `string`    | —      | 추가 클래스 이름   |

### PopoverContent

| Prop        | 타입        | 기본값 | 설명             |
| ----------- | ----------- | ------ | ---------------- |
| `children`  | `PingoNode` | —      | 패널 내용 (필수) |
| `className` | `string`    | —      | 추가 클래스 이름 |

## 접근성

트리거는 button 의미 체계를 가지며 expanded/collapsed 상태를 노출합니다. `Escape` 키를 누르면 패널이 닫히고 포커스가 트리거로 돌아갑니다.
