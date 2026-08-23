---
title: Resizable
description: 드래그 핸들로 비율을 조정하는 2단 레이아웃으로, pingo canvas에 렌더링합니다.
---

# Resizable

Resizable은 컨테이너를 두 개의 패널로 나누며, 가운데의 드래그 핸들을 움직여 비율을 조정할 수 있고 키보드 미세 조정도 지원합니다. 아래 미리보기는 pingo 엔진이 실시간으로 렌더링합니다. 핸들을 드래그해 보십시오.

:::preview resizable-basic
:::

## 사용법

```tsx
import { createElement } from "@dopejs/pingo";
import { Resizable } from "@dopejs/pingo-ui";

root.render(
  createElement(Resizable, {
    defaultSplit: 0.4,
    first: sidebar,
    second: content,
  }),
);
```

컴포넌트 자체의 너비와 높이는 부모 컨테이너의 100%이므로, 크기가 정해진 부모 컨테이너가 필요합니다. 비제어(`defaultSplit`)와 제어(`split` + `onSplitChange`) 두 가지 방식을 모두 지원합니다.

## 예제

### 수직 방향

`direction: "column"`을 전달하면 위아래 분할로 전환되고 핸들이 가로 방향이 됩니다.

:::preview resizable-vertical
:::

## Props

| Prop            | 타입                      | 기본값  | 설명                              |
| --------------- | ------------------------- | ------- | --------------------------------- |
| `first`         | `PingoNode`               | —       | 첫 번째 패널 콘텐츠(필수)         |
| `second`        | `PingoNode`               | —       | 두 번째 패널 콘텐츠(필수)         |
| `split`         | `number`                  | —       | 제어: 첫 번째 패널 비율, `[0, 1]` |
| `defaultSplit`  | `number`                  | `0.5`   | 비제어: 초기 비율                 |
| `onSplitChange` | `(split: number) => void` | —       | 비율 변경 콜백                    |
| `direction`     | `"row" \| "column"`       | `"row"` | 분할 방향                         |
| `minSplit`      | `number`                  | `0.1`   | 최소 비율(하한 클램프)            |
| `maxSplit`      | `number`                  | `0.9`   | 최대 비율(상한 클램프)            |
| `disabled`      | `boolean`                 | `false` | 핸들 상호작용 비활성화            |
| `className`     | `string`                  | —       | 컴포넌트 클래스명 뒤에 추가       |

## 접근성

핸들은 separator 의미를 가지며, 보조 기술에 현재 비율(백분율)을 노출합니다. 핸들에 포커스한 뒤 방향키로 2% 단위 미세 조정이 가능합니다. 가로 레이아웃은 왼쪽/오른쪽, 세로 레이아웃은 위/아래를 사용합니다.
