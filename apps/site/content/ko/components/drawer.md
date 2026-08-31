---
title: Drawer
description: 상하 가장자리에서 슬라이드되는 드로어 패널로, 모바일 스타일의 하단 작업에 적합합니다.
---

# Drawer

드로어는 수평 가장자리에서 슬라이드되는 패널입니다. `side`가 `"top" | "bottom"`만 취하는 [Sheet](/components/sheet)와 동일합니다. 아래 미리보기는 pingo 엔진으로 실시간 렌더링되며, 사이트 테마에 따라 명암이 전환됩니다.

:::preview drawer-basic
:::

## 사용법

```tsx
import { Drawer } from "@dopejs/pingo-ui";

root.render(
  <Drawer open={open} onOpenChange={(next) => setOpen(next)} side="bottom">
    <text value="抽屉内容" />
  </Drawer>,
);
```

오버레이는 자신의 부모 컨테이너를 가득 채우므로 루트 노드와 가까운 위치에 마운트하십시오. `open`은 제어 prop입니다. 마스크를 클릭하거나 `Escape`를 누르면 `onOpenChange(false)`를 통해 닫기를 요청합니다. 패널 내부의 제목/버튼 영역은 `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`를 재사용할 수 있습니다.

## 예제

### 방향

`side`는 `"top"`과 `"bottom"`을 지원하며, 기본값은 `"bottom"`입니다.

## Props

`DialogProps`(`open`, `onOpenChange`, `children`, `className`)를 상속하며, 다음이 추가됩니다.

| Prop   | 타입                | 기본값     | 설명                  |
| ------ | ------------------- | ---------- | --------------------- |
| `side` | `"top" \| "bottom"` | `"bottom"` | 슬라이드되는 가장자리 |

## 접근성

패널은 complementary 의미를 가집니다. 열릴 때 초점이 패널 안으로 이동하며, `Escape`로 닫은 후에는 초점이 트리거 요소로 돌아갑니다.
