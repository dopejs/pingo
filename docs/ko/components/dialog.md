---
title: Dialog
description: 모달 대화상자로, 사용자 입력이나 확인을 받기 위해 흐름을 중단하며 pingo 캔버스 위에 렌더링됩니다.
---

# Dialog

대화상자는 현재 콘텐츠 위에 모달 패널과 함께 오버레이를 엽니다. 아래 미리보기는 pingo 엔진이 실시간으로 렌더링합니다. 오버레이를 클릭하거나 `Escape`를 누르면 `onOpenChange(false)`가 트리거되고, 사이트 테마에 따라 밝은 모드와 어두운 모드가 전환됩니다.

:::preview dialog-basic
:::

## 사용법

```tsx
import { createElement } from "@dopejs/pingo";
import {
  Button,
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@dopejs/pingo-ui";

root.render(
  createElement(Dialog, {
    open,
    onOpenChange: (next) => setOpen(next),
    children: [
      createElement(DialogHeader, {
        children: [
          createElement(DialogTitle, { children: "프로필 편집" }),
          createElement(DialogDescription, { children: "변경 사항은 즉시 동기화됩니다." }),
        ],
      }),
      createElement(DialogFooter, {
        children: createElement(Button, { children: "저장", onPress: () => save() }),
      }),
    ],
  }),
);
```

Dialog의 오버레이는 **자신의 부모 컨테이너**(뷰포트가 아님)를 가득 채우므로, 루트 노드 가까운 위치에 마운트하십시오. `open`은 제어 prop입니다. 컴포넌트는 열림/닫힘 상태를 보유하지 않으며, 닫힐 때 `onOpenChange(false)`를 통해 호출자에게 알립니다.

## 예제

### 조합 블록

`DialogHeader` / `DialogTitle` / `DialogDescription` / `DialogFooter`는 순수 레이아웃 및 타이포그래피 컴포넌트로, 필요에 따라 조합합니다. `children`은 임의의 `PingoNode`를 허용하므로 폼이나 목록도 패널 안에 넣을 수 있습니다.

## Props

### Dialog

| Prop           | 타입                      | 기본값 | 설명                                |
| -------------- | ------------------------- | ------ | ----------------------------------- |
| `open`         | `boolean`                 | —      | 열림 여부(필수, 제어)               |
| `onOpenChange` | `(open: boolean) => void` | —      | 닫기/열기를 요청할 때 호출되는 콜백 |
| `children`     | `PingoNode`               | —      | 패널 콘텐츠(필수)                   |
| `className`    | `string`                  | —      | 오버레이 클래스 이름 뒤에 추가      |

### DialogHeader / DialogFooter

| Prop        | 타입        | 기본값 | 설명              |
| ----------- | ----------- | ------ | ----------------- |
| `children`  | `PingoNode` | —      | 블록 콘텐츠(필수) |
| `className` | `string`    | —      | 추가 클래스 이름  |

### DialogTitle / DialogDescription

| Prop        | 타입     | 기본값 | 설명                |
| ----------- | -------- | ------ | ------------------- |
| `children`  | `string` | —      | 텍스트 콘텐츠(필수) |
| `className` | `string` | —      | 추가 클래스 이름    |

## 접근성

패널은 dialog 시맨틱을 갖습니다. 열리면 포커스가 패널 안으로 이동하고, `Escape`로 닫으면 포커스가 트리거 요소로 돌아갑니다. 패널 안의 상호작용 가능한 요소는 Tab 순환에 등록됩니다. 제목에는 `DialogTitle`(heading 시맨틱)을 사용하십시오.
