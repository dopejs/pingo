---
title: Sheet
description: 임의의 화면 가장자리에서 슬라이드 인 되는 패널로, 필터·상세 등 보조 콘텐츠에 적합합니다.
---

# Sheet

Sheet는 컨테이너 가장자리에서 패널을 슬라이드 인 시키며, 필터 조건·상세 사이드바 등 메인 흐름을 방해하지 않는 보조 콘텐츠에 자주 사용합니다. 아래 미리보기는 pingo 엔진이 실시간으로 렌더링하며, 사이트 테마에 따라 명암이 전환됩니다.

:::preview sheet-basic
:::

## 사용법

```tsx
import { createElement } from "@dopejs/pingo";
import { Sheet } from "@dopejs/pingo-ui";

root.render(
  createElement(Sheet, {
    open,
    onOpenChange: (next) => setOpen(next),
    side: "right",
    children: createElement("text", { value: "패널 콘텐츠" }),
  }),
);
```

오버레이는 자신의 부모 컨테이너를 가득 채우므로 루트에 가까운 위치에 마운트하십시오. `open`은 제어 prop입니다. 마스크를 클릭하거나 `Escape`를 누르면 `onOpenChange(false)`를 통해 닫기를 요청합니다. 패널 안의 제목/버튼 영역은 `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`를 재사용할 수 있습니다.

## 예제

### 방향

`side`는 `"left"`, `"right"`, `"top"`, `"bottom"`을 지원하며 기본값은 `"right"`입니다. 위아래 가장자리만 필요할 때는 의미가 더 명확한 [Drawer](/components/drawer)를 사용하십시오.

## Props

`DialogProps`(`open`, `onOpenChange`, `children`, `className`)를 상속하며, 추가로 다음이 있습니다.

| Prop   | 타입                                     | 기본값    | 설명                      |
| ------ | ---------------------------------------- | --------- | ------------------------- |
| `side` | `"left" \| "right" \| "top" \| "bottom"` | `"right"` | 슬라이드 인 되는 가장자리 |

## 접근성

패널은 complementary 시맨틱을 가집니다. 열리면 포커스가 패널로 이동하고, `Escape`로 닫으면 포커스가 트리거 요소로 돌아갑니다.
