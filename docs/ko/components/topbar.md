---
title: TopBar
description: 앱 상단 바 분자 컴포넌트로, 제목과 앞뒤 슬롯으로 구성되며 pingo canvas에 렌더링됩니다.
---

# TopBar

TopBar는 pingo 고유의 제품 분자입니다. 제목과 `leading`(로고, 뒤로 가기), `actions`(버튼, 아바타) 두 슬롯을 한 줄의 앱 상단 바로 조합합니다. 제목 열은 항상 남은 공간을 차지하고(`flexGrow`) actions를 가장 오른쪽으로 밀어냅니다. 별도의 측정이 필요하지 않습니다. 아래 미리보기는 pingo 엔진이 실시간으로 렌더링하며, 사이트 테마에 따라 밝은 모드와 어두운 모드가 전환됩니다.

:::preview topbar-basic
:::

shadcn 기본 컴포넌트와의 조합 관계: TopBar 자체는 버튼이나 아바타를 제공하지 않으며 **레이아웃 골격**을 정의합니다. `leading`과 `actions` 슬롯은 임의의 `PingoNode`를 허용하며, 일반적으로 [Button](/components/button), IconButton, Avatar 등의 기본 컴포넌트와 조합합니다. 여러 action은 `flexDirection: "row"`인 container로 감싸서 전달합니다.

## 사용법

```tsx
import { createElement } from "@dopejs/pingo";
import { Avatar, Button, TopBar } from "@dopejs/pingo-ui";

root.render(
  createElement(TopBar, {
    title: "대시보드",
    leading: createElement(Avatar, { fallback: "P", size: 28 }),
    actions: createElement(Button, {
      children: "새로 만들기",
      variant: "outline",
      onPress: () => create(),
    }),
  }),
);
```

## 예제

### 제목 없음

`title`을 생략해도 제목 열은 렌더링되며(빈 가변 열), actions는 여전히 가장 오른쪽으로 밀립니다. 작업 영역만 있는 도구 모음에 적합합니다.

```tsx
createElement(TopBar, {
  actions: createElement(Button, { children: "내보내기", onPress: () => {} }),
});
```

## Props

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `title` | `string` | — | 제목 텍스트. 생략하면 빈 가변 열을 렌더링합니다. |
| `leading` | `PingoNode` | — | 앞쪽 슬롯. 로고나 뒤로 가기 버튼을 배치합니다. |
| `actions` | `PingoNode` | — | 뒤쪽 슬롯. 제목 열에 의해 가장 오른쪽으로 밀립니다. |
| `className` | `string` | — | 컴포넌트 클래스 이름 뒤에 추가합니다. |

## 접근성

TopBar는 `banner` 시맨틱 역할을 가집니다. `title`을 제공하면 제목 텍스트에 `heading` 역할이 부여됩니다. 슬롯 내부 컴포넌트의 접근성 속성(예: IconButton의 `semanticLabel`)은 각 컴포넌트가 담당합니다.
