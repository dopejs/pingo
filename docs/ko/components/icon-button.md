---
title: Icon Button
description: 아이콘만 담는 버튼입니다. 접근성 이름을 반드시 제공해야 하며 pingo 캔버스 위에 렌더링됩니다.
---

# Icon Button

아이콘 버튼은 텍스트 라벨이 없는 컴팩트한 작업에 사용합니다. 아래 미리보기는 pingo 엔진이 실시간으로 렌더링합니다. 클릭과 포커스가 가능하며 사이트 테마에 따라 밝은 화면과 어두운 화면이 전환됩니다.

:::preview icon-button-basic
:::

## 사용법

```tsx
import { createElement } from "@dopejs/pingo";
import { IconButton } from "@dopejs/pingo-ui";

root.render(
  createElement(IconButton, {
    icon: createElement("text", { value: "★" }),
    semanticLabel: "收藏",
    variant: "outline",
    onPress: () => toggleFavorite(),
  }),
);
```

`icon`은 그대로 전달되는 슬롯으로 임의의 `PingoNode`를 받습니다. 아이콘 폰트, SVG, 텍스트 글리프 모두 가능합니다. 보이는 텍스트가 없으므로 `semanticLabel`은 필수입니다.

## 예제

### 변형

`variant`는 [Button](/components/button)과 완전히 일치합니다. `default`, `secondary`, `outline`, `ghost`, `destructive`를 지원합니다.

### 알려진 제한 사항

`size`는 `default`, `sm`, `lg`를 지원하지만 현재 스킨에는 icon 변형을 위한 `sm`/`lg` 복합 규칙이 작성되어 있지 않습니다. 아이콘 크기가 크기 수정자를 덮어쓰므로 `sm`/`lg`는 현재 시각적 효과가 없습니다.

## Props

| Prop            | 类型                                                                | 默认值      | 说明                                           |
| --------------- | ------------------------------------------------------------------- | ----------- | ---------------------------------------------- |
| `icon`          | `PingoNode`                                                         | —           | 아이콘 슬롯이며 원래 그대로 전달됩니다(필수)   |
| `semanticLabel` | `string`                                                            | —           | 접근성 이름(필수)                              |
| `variant`       | `"default" \| "secondary" \| "outline" \| "ghost" \| "destructive"` | `"default"` | 시각 변형                                      |
| `size`          | `"default" \| "sm" \| "lg"`                                         | `"default"` | 크기(`sm`/`lg`는 현재 효과 없음, 위 내용 참조) |
| `disabled`      | `boolean`                                                           | `false`     | 비활성화 상태                                  |
| `onPress`       | `() => void`                                                        | —           | 포인터/키보드 활성화 콜백                      |
| `className`     | `string`                                                            | —           | 컴포넌트 클래스 이름 뒤에 추가됩니다           |

## 접근성

아이콘 버튼에는 보이는 텍스트가 없으므로 화면 읽기 도구는 `semanticLabel`에만 의존합니다. 따라서 해당 prop은 필수입니다. 버튼은 button 의미 체계와 키보드 활성화를 지원합니다.
