---
title: Alert Dialog
description: 파괴적 작업을 위한 확인 대화 상자. 취소/확인 버튼 쌍이 내장되어 있습니다.
---

# Alert Dialog

확인 대화 상자는 「취소 / 확인」 버튼 쌍이 내장된 Dialog로, 되돌릴 수 없는 작업 전에 재확인을 받을 때
사용합니다. 아래 미리보기는 pingo 엔진이 실시간으로 렌더링하며 사이트 테마를 따라 라이트/다크가
전환됩니다.

:::preview alert-dialog-basic
:::

## 사용법

```tsx
import { createElement } from "@dopejs/pingo";
import { AlertDialog } from "@dopejs/pingo-ui";

root.render(
  createElement(AlertDialog, {
    open,
    onOpenChange: (next) => setOpen(next),
    title: "종료하시겠습니까?",
    description: "저장하지 않은 변경 사항은 사라집니다.",
    onCancel: () => {},
    onAction: () => quit(),
    children: null,
  }),
);
```

Dialog와 마찬가지로 오버레이는 자신의 부모 컨테이너를 가득 채우므로 root 노드에 가까운 곳에 마운트하십시오.
`children`은 `DialogProps`에서 상속되어 여전히 필수이지만 컴포넌트에 내장된 제목/설명/버튼 구조에 의해
덮어쓰이므로 `null`을 넘기면 됩니다. 취소나 확인 버튼을 클릭하면 먼저 해당 콜백이 실행된 다음
`onOpenChange(false)`로 닫기를 요청하며, 딤 클릭도 닫습니다.

## 예제

### 파괴적 작업

`destructive`는 확인 버튼을 위험 색으로 렌더링합니다.

:::preview alert-dialog-destructive
:::

## Props

`DialogProps`(`open`, `onOpenChange`, `children`, `className`)를 상속하며, 추가로:

| Prop          | 타입         | 기본값   | 설명                     |
| ------------- | ------------ | -------- | ------------------------ |
| `title`       | `string`     | —        | 제목(필수)               |
| `description` | `string`     | —        | 보충 설명                |
| `cancelLabel` | `string`     | `"취소"` | 취소 버튼 문구           |
| `actionLabel` | `string`     | `"확인"` | 확인 버튼 문구           |
| `onCancel`    | `() => void` | —        | 취소 콜백(이후 닫힘)     |
| `onAction`    | `() => void` | —        | 확인 콜백(이후 닫힘)     |
| `destructive` | `boolean`    | `false`  | 확인 버튼에 위험 색 사용 |

## 접근성

dialog 의미를 갖습니다. 취소와 확인 버튼 모두 Tab 순환에 등록되어 키보드 사용자가 대화 상자에 갇히지
않습니다.
