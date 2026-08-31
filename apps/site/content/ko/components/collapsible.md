---
title: Collapsible
description: pingo canvas에 렌더링되는, 단일 확장 및 축소 가능한 콘텐츠 영역입니다.
---

# Collapsible

Collapsible은 Accordion의 단일 항목 프리미티브입니다. 하나의 트리거가 한 콘텐츠 블록의 확장과 축소를 제어하므로, 하나의 접힘 영역만 필요한 상황에 적합합니다. 아래 미리보기는 pingo 엔진에 의해 실시간으로 렌더링됩니다. 트리거를 클릭하여 전환할 수 있습니다.

:::preview collapsible-basic
:::

## 사용법

```tsx
import { Collapsible } from "@dopejs/pingo-ui";

root.render(
  <Collapsible trigger="고급 옵션" defaultOpen>
    <text value="접힘 영역 콘텐츠." />
  </Collapsible>,
);
```

비제어(`defaultOpen`)와 제어(`open` + `onOpenChange`) 방식을 모두 지원합니다.

## 예제

### 비활성화

`disabled`를 전달하면 트리거가 더 이상 포인터와 키보드에 반응하지 않으며, 비활성화 스타일이 적용됩니다.

:::preview collapsible-disabled
:::

## Props

| Prop           | 타입                      | 기본값  | 설명                           |
| -------------- | ------------------------- | ------- | ------------------------------ |
| `trigger`      | `string`                  | —       | 트리거 텍스트(필수)            |
| `children`     | `PingoNode`               | —       | 확장 시 표시되는 콘텐츠(필수)  |
| `open`         | `boolean`                 | —       | 제어: 현재 확장 상태           |
| `defaultOpen`  | `boolean`                 | `false` | 비제어: 초기 확장 상태         |
| `onOpenChange` | `(open: boolean) => void` | —       | 확장 상태 변경 콜백            |
| `disabled`     | `boolean`                 | `false` | 트리거 비활성화                |
| `className`    | `string`                  | —       | 컴포넌트 클래스 이름 뒤에 추가 |

## 접근성

트리거는 button 의미론을 가지며, 보조 기술에 expanded/collapsed 상태를 노출합니다. Enter와 스페이스 키로 확장을 전환합니다. 콘텐츠는 접힐 때 언마운트되지 않고 `display: none`으로 숨겨지므로, 내부의 스크롤 위치와 편집 상태가 유지됩니다.
