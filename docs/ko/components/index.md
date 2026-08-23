---
title: 컴포넌트
description: shadcn 마인드의 pingo 네이티브 UI 컴포넌트 라이브러리, 전부 캔버스에서 실시간 렌더링합니다.
---

# 컴포넌트

`@dopejs/pingo-ui`는 shadcn/ui와 정렬된 컴포넌트 라이브러리입니다. API와 스킨 의미 체계를 일치시키며, 렌더링 대상은 DOM이 아닌 pingo 캔버스 엔진입니다. 아래 각 컴포넌트 페이지에는 **실시간 렌더링** 프리뷰가 포함되어 있습니다. 프리뷰 자체가 엔진이 그린 캔버스로, 상호작용할 수 있고 테마 전환을 따릅니다.

## 사용법

```ts
import { createHostedCanvasRoot } from "@dopejs/pingo";
import { Button, createPingoUiStyleSheet } from "@dopejs/pingo-ui";

const root = await createHostedCanvasRoot(canvas, {
  styleSheets: [createPingoUiStyleSheet()],
});
root.render(createElement(Button, { children: "保存" }));
```

사용자 정의 스타일시트는 반드시 pingo-ui 스타일시트 **다음에** 등록해야 하며, 동일 우선순위 규칙은 등록 순서대로 덮어씁니다. 테마 및 브랜드 커스터마이징은 [스타일 가이드](/guide/styling)와 [SCSS 및 Less](/guide/scss-less)를 참조하십시오.

왼쪽 목차에서 컴포넌트를 선택하여 시작하십시오.
