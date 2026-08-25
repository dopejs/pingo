---
title: Divider
description: pingo canvas에 렌더링되는 수평 또는 수직 시각적 구분선입니다.
---

# Divider

구분선은 콘텐츠 사이에 시각적 그룹화를 제공합니다. 아래 미리보기는 pingo 엔진에 의해 실시간으로 렌더링되며, 사이트 테마에 따라 밝은 모드와 어두운 모드가 전환됩니다.

:::preview divider-horizontal
:::

## 사용법

```tsx
import { createElement } from "@dopejs/pingo";
import { Divider } from "@dopejs/pingo-ui";

root.render(createElement(Divider, {}));
```

## 예시

### 수직 구분선

`orientation: "vertical"`을 전달하면 수직 구분선이 생성됩니다. 수직 구분선의 높이는 부모 컨테이너의 100%이므로, 부모 컨테이너에 명확한 높이가 지정되어 있어야 합니다.

:::preview divider-vertical
:::

## Props

| Prop          | 타입                         | 기본값         | 설명                                 |
| ------------- | ---------------------------- | -------------- | ------------------------------------ |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | 구분선 방향                          |
| `className`   | `string`                     | —              | 컴포넌트 클래스 이름 뒤에 추가됩니다 |

수평 구분선의 너비는 부모 컨테이너의 100%, 높이는 1px입니다. 수직 구분선의 높이는 부모 컨테이너의 100%, 너비는 1px입니다.

## 접근성

Divider는 순수한 시각적 요소로 의미론적 역할을 갖지 않으므로 보조 기술에서 무시됩니다. 콘텐츠 그룹화는 제목과 같은 의미론적 구조를 통해 표현해야 합니다.
