---
title: Scroll Area
description: 그리기형 스크롤바를 갖춘 스크롤 컨테이너로, pingo canvas 위에 렌더링됩니다.
---

# Scroll Area

Scroll Area는 고정 크기 뷰포트 안에서 너무 긴 내용을 스크롤하고, 테마와 일치하는 스크롤바를 그립니다. 아래 미리보기는 pingo 엔진이 실시간으로 렌더링합니다. 목록 위에서 스크롤해 보십시오.

:::preview scroll-area-basic
:::

## 사용법

```tsx
import { ScrollArea } from "@dopejs/pingo-ui";

root.render(
  <ScrollArea>
    {items.map((item) => (
      <text value={item} />
    ))}
  </ScrollArea>,
);
```

컴포넌트 자체의 너비와 높이는 부모 컨테이너의 100%이므로, 크기가 정해진 부모 컨테이너가 필요합니다. 내용이 뷰포트를 넘어설 때만 스크롤바가 나타납니다.

## Props

| Prop            | 타입        | 기본값  | 설명                                                |
| --------------- | ----------- | ------- | --------------------------------------------------- |
| `children`      | `PingoNode` | —       | 스크롤 내용 (필수)                                  |
| `hideScrollbar` | `boolean`   | `false` | 그려지는 스크롤바를 숨깁니다 (스크롤 기능은 유지됨) |
| `className`     | `string`    | —       | 컴포넌트 클래스 이름 뒤에 추가됩니다                |

## 접근성

스크롤 동작은 엔진 Core가 제공하며, 뷰포트는 포커스 가능 상태와 키보드 스크롤 기능을 유지합니다. 스크롤바는 뷰포트와 내용의 실제 측정 기하 정보로부터 유도되므로, 빠르게 드래그하면 스크롤바 슬라이더가 한 프레임 정도 뒤처질 수 있습니다.

스크롤과 관련된 엔진 동작은 [스크롤 가이드](/guide/scrolling)를 참조하십시오.
