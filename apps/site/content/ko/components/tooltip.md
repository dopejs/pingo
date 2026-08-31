---
title: Tooltip
description: 호버 시 표시되는 짧은 설명 텍스트로, 대상 요소 위에 고정됩니다.
---

# Tooltip

Tooltip은 포인터를 올렸을 때 짧은 설명 텍스트를 표시하며, 기본적으로 대상 위에 고정됩니다. 아래 미리보기는 pingo 엔진에서 실시간으로 렌더링합니다. 버튼 위에 포인터를 올리면 말풍선이 나타나고 사이트 테마에 따라 밝게 또는 어둡게 전환됩니다.

:::preview tooltip-basic
:::

## 사용법

```tsx
import { Button, Tooltip } from "@dopejs/pingo-ui";

root.render(
  <Tooltip content="클라우드에 저장">
    <Button onPress={() => save()}>저장</Button>
  </Tooltip>,
);
```

Tooltip은 포인터 진입과 이탈(`pointerenter` / `pointerleave`)에 의해 동작하며 제어용 props는 없습니다. 정적 렌더링 시에는 트리거 요소만 표시되고 말풍선은 호버할 때 나타납니다.

## Props

| Prop        | 타입        | 기본값 | 설명                                |
| ----------- | ----------- | ------ | ----------------------------------- |
| `content`   | `string`    | —      | 말풍선 텍스트(필수)                 |
| `children`  | `PingoNode` | —      | 트리거 요소(필수)                   |
| `className` | `string`    | —      | 앵커 컨테이너 클래스 이름 뒤에 추가 |

## 접근성

말풍선은 tooltip 시맨틱을 갖습니다. Tooltip은 호버 시에만 나타나며 키보드 포커스에는 반응하지 않습니다. 중요한 정보는 Tooltip에만 넣지 마십시오.
