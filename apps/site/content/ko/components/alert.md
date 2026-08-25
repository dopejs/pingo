---
title: Alert
description: 중요한 알림 정보를 보여 주는 콜아웃 블록. pingo canvas에 렌더링됩니다.
---

# Alert

Alert는 사용자의 주의가 필요하지만 흐름을 끊지 않는 알림 정보를 페이지에 보여 줄 때 사용합니다. 아래
미리보기는 pingo 엔진이 실시간으로 렌더링하며 사이트 테마를 따라 라이트/다크가 전환됩니다.

:::preview alert-basic
:::

## 사용법

```tsx
import { createElement } from "@dopejs/pingo";
import { Alert } from "@dopejs/pingo-ui";

root.render(
  createElement(Alert, {
    title: "알림",
    children: "설정이 자동으로 저장되었습니다.",
  }),
);
```

## 예제

### 파괴적 알림

`variant="destructive"`는 오류나 실패 상황에 사용합니다. 테두리와 제목이 파괴적 색상으로 바뀌고, 설명
텍스트는 가독성을 위해 일반 전경색을 유지합니다.

```tsx
createElement(Alert, {
  title: "동기화 실패",
  variant: "destructive",
  children: "네트워크 연결을 확인한 뒤 다시 시도하십시오.",
});
```

## Props

| Prop        | 타입                         | 기본값      | 설명                           |
| ----------- | ---------------------------- | ----------- | ------------------------------ |
| `title`     | `string`                     | —           | 제목(필수)                     |
| `children`  | `string`                     | —           | 설명 본문(필수)                |
| `variant`   | `"default" \| "destructive"` | `"default"` | 시각적 변형                    |
| `className` | `string`                     | —           | 컴포넌트 클래스 이름 뒤에 추가 |

## 접근성

Alert는 순수한 정적 텍스트 블록으로 포커스를 가져가지 않습니다. 간결한 `title`로 결론을 요약하고 세부
내용은 설명에 두십시오. 사용자의 확인이나 처리가 필요한 상황에는 `AlertDialog`를 사용하십시오.
