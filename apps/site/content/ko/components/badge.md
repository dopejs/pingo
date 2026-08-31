---
title: Badge
description: 비상호작용 상태 라벨로, pingo 캔버스에 렌더링합니다.
---

# Badge

Badge는 상태, 분류 또는 수량을 표시하는 비상호작용 상태 라벨입니다. 예를 들어 "관리자", "Beta"와 같이 사용합니다. 아래 미리보기는 pingo 엔진에 의해 실시간으로 렌더링되며, 사이트 테마에 따라 밝은 모드와 어두운 모드가 전환됩니다.

:::preview badge-variants
:::

## 사용법

```tsx
import { Badge } from "@dopejs/pingo-ui";

root.render(<Badge>Beta</Badge>);
```

## 예시

### 변형

네 가지 변형이 일반적인 의미를 다룹니다: `default`(강조), `secondary`(약화), `destructive`(오류/위험), `outline`(외곽선). 미리보기에 순서대로 표시되어 있습니다.

```tsx
<Badge variant="secondary">읽기 전용</Badge>
```

### 다른 컴포넌트와 함께 사용

Badge는 목록 행이나 카드의 trailing 요소로 자주 사용되며, `Avatar`, `ListRow`와 조합하여 사용합니다:

```tsx
<ListRow
  title="장삼"
  leading={<Avatar fallback="장" size={32} />}
  trailing={<Badge>관리자</Badge>}
  onPress={() => {}}
/>
```

## Props

| Prop            | 타입                                                     | 기본값      | 설명                                        |
| --------------- | -------------------------------------------------------- | ----------- | ------------------------------------------- |
| `children`      | `string`                                                 | —           | 라벨 텍스트(필수)                           |
| `variant`       | `"default" \| "secondary" \| "destructive" \| "outline"` | `"default"` | 시각적 변형                                 |
| `semanticLabel` | `string`                                                 | —           | 접근성 이름. 생략 시 기본 의미를 사용합니다 |
| `className`     | `string`                                                 | —           | 컴포넌트 클래스 이름 뒤에 추가합니다        |

## 접근성

Badge는 포인터와 키보드에 반응하지 않는 순수 표시 요소입니다. 텍스트만으로 의미를 전달하기에 부족한 경우(예: 숫자만 있는 배지) `semanticLabel`을 사용하여 전체 설명을 제공합니다.
