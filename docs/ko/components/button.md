---
title: Button
description: 작업이나 이벤트를 트리거하는 버튼으로, pingo canvas에 렌더링됩니다.
---

# Button

버튼은 하나의 작업을 트리거합니다. 아래 미리보기는 pingo 엔진에 의해 실시간 렌더링됩니다. 클릭하고, 포커스할 수 있으며, 사이트 테마에 따라 밝음/어두움이 전환됩니다.

:::preview button-basic
:::

## 사용법

```tsx
import { createElement } from "@dopejs/pingo";
import { Button } from "@dopejs/pingo-ui";

root.render(
  createElement(Button, {
    children: "저장",
    variant: "default",
    onPress: () => save(),
  }),
);
```

## 예제

### 크기

`size`는 `default`, `sm`, `lg`, `icon`을 지원합니다.

### 비활성화

`disabled`를 전달하면 버튼이 더 이상 포인터와 키보드에 반응하지 않으며 비활성화 스타일이 적용됩니다.

## Props

| Prop            | 유형                                                                | 기본값      | 설명                           |
| --------------- | ------------------------------------------------------------------- | ----------- | ------------------------------ |
| `children`      | `string`                                                            | —           | 버튼 텍스트(필수)              |
| `variant`       | `"default" \| "secondary" \| "outline" \| "ghost" \| "destructive"` | `"default"` | 시각적 변형                    |
| `size`          | `"default" \| "sm" \| "lg" \| "icon"`                               | `"default"` | 크기                           |
| `disabled`      | `boolean`                                                           | `false`     | 비활성화 상태                  |
| `onPress`       | `() => void`                                                        | —           | 포인터/키보드 활성화 콜백      |
| `semanticLabel` | `string`                                                            | `children`  | 접근성 이름                    |
| `className`     | `string`                                                            | —           | 컴포넌트 클래스 이름 뒤에 추가 |

## 접근성

버튼은 button 시맨틱과 키보드 활성화를 지원합니다. `semanticLabel`은 기본적으로 `children`을 사용하며, 아이콘 버튼은 명시적으로 제공해야 합니다.
