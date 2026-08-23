---
title: Progress
description: 작업 완료 진행률을 표시하는 진행률 막대로, pingo 캔버스에 렌더링됩니다.
---

# Progress

Progress는 다운로드, 업로드 또는 여러 단계의 작업과 같은 결정적 진행률을 채워진 트랙 하나로 표시합니다. 아래 미리보기는 pingo 엔진이 실시간으로 렌더링하며, 사이트 테마에 따라 밝은 모드와 어두운 모드가 전환됩니다.

:::preview progress-basic
:::

## 사용법

```tsx
import { createElement } from "@dopejs/pingo";
import { Progress } from "@dopejs/pingo-ui";

root.render(createElement(Progress, { value: 60 }));
```

트랙 너비는 부모 컨테이너를 상속하므로, Progress를 고정 너비의 컨테이너 안에 배치하여 막대 길이를 제어합니다.

```tsx
createElement("container", {
  width: 320,
  children: createElement(Progress, { value: 60 }),
});
```

## 예시

### 사용자 지정 최댓값

`max`의 기본값은 100입니다. 값을 전달하면 `value / max`로 채움 비율을 계산하며, 항상 0–100 사이로 고정합니다.

```tsx
createElement(Progress, { value: 3, max: 10 }); // 30%
```

## Props

| Prop        | 타입     | 기본값 | 설명                                          |
| ----------- | -------- | ------ | --------------------------------------------- |
| `value`     | `number` | —      | 현재 진행률(필수), 범위를 벗어나면 고정됩니다 |
| `max`       | `number` | `100`  | 최댓값, 최소 1로 처리됩니다                   |
| `className` | `string` | —      | 컴포넌트 클래스 이름 뒤에 추가됩니다          |

## 접근성

Progress는 순수 시각적 요소로, 의미론적 역할을 포함하지 않습니다. 진행률이 작업 완료에 중요하다면 현재 백분율이나 단계 이름을 설명하는 텍스트를 옆에 함께 제공해야 합니다.
