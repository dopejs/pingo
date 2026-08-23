---
title: 스타일
description: pingo의 CSS subset——클래스 셀렉터, 캐스케이드와 우선순위, 상속 경계, 그리고 pingo-ui의 테마와 오버라이드 규칙.
---

# 스타일

pingo의 스타일은 **버전화된 CSS subset**(현재 1.6.0)입니다. CSS 텍스트는 Shell 쪽에서 파싱·계산되고,
Core는 정규화된 타입 값만 소비합니다——CSS 텍스트와 셀렉터 매칭은 절대 Core에 들어가지 않습니다.
전체 속성 지원 표는 [CSS subset 지원](/style-support)을 보고, 이 페이지에서는 사용법과 경계를 다룹니다.

## 스타일시트 만들고 등록하기

`createStyleSheet`로 CSS 텍스트를 컴파일하고(입력이 잘못되면 `StyleSheetCompileError`를 던집니다),
root를 만들 때 등록합니다.

```ts
import { createElement, createHostedCanvasRoot, createStyleSheet } from "@dopejs/pingo";

const sheet = createStyleSheet(
  `
  .card {
    background-color: #ffffff;
    border-radius: 8px;
    padding: 16px;
  }
  `,
  { sourceName: "app.css" },
);

const root = await createHostedCanvasRoot(canvas, { styleSheets: [sheet] });

root.render(
  createElement("container", {
    className: "card",
    width: 320,
    children: createElement("text", { value: "안녕하세요", fontSize: 14 }),
  }),
);
```

예외를 처리하고 싶지 않다면 `compileStyleSheet`를 쓸 수 있습니다. 작성자 입력에 예외를 던지지 않고
안정적인 diagnostics를 돌려줍니다. 스타일시트는 타입 안전한 객체 형태(`PingoStyleSheetObject`)로도
작성할 수 있습니다. 키는 앞에 점이 있든 없든 되는 클래스 셀렉터이고 값은 `PingoStyle`입니다.

```ts
const sheet = createStyleSheet({
  card: { backgroundColor: "#ffffffff", borderRadius: 8, padding: 16 },
  "card:hover": { backgroundColor: "#f5f5f5ff" },
});
```

요소는 `className` prop으로 클래스를 걸고(ASCII 공백으로 구분한 여러 클래스 이름), `style` prop으로
인라인 선언(`PingoStyle`, Shell이 파싱한 뒤 Core로 전달)을 씁니다.

## 셀렉터와 캐스케이드

subset은 **같은 노드 위의 클래스 셀렉터**와 네 개의 인터랙션 상태 의사 클래스만 지원합니다.

- 단일 클래스 `.card`, 복합 클래스 `.pui-card.pui-dark`(노드가 모든 클래스를 갖춰야 매치).
- 상태 `:hover`, `:active`, `:focus`, `:focus-visible`. 클래스와 복합할 수 있습니다(예: `.btn:hover`).

지원하지 않는 것: 요소 셀렉터, 후손/자식 등 결합자, `@media` / `@supports` / `@keyframes`,
`var()` / `calc()`. 길이 단위는 `px`와 `%`뿐이며(`em` / `rem` / `vw` / `vh`는 거부), 색상은 hex 또는
`rgb()` / `rgba()` / `hsl()` / `hsla()`로 씁니다(신구 두 문법 모두 허용). 색상 키워드(예: `red`)는
지원하지 않습니다.

캐스케이드 규칙은 CSS와 같은 모양이지만 더 단순합니다.

1. **우선순위(specificity) = 클래스 수 + 상태 수**. `.pui-card.pui-dark`(2)가 `.card`(1)를 이깁니다.
2. **같은 우선순위에서는 source order**: 나중에 등록된 스타일시트, 같은 시트 안에서는 뒤에 있는 규칙이
   적용됩니다.
3. **인라인 `style` prop이 모든 스타일시트 규칙을 이깁니다.** 요소의 직접 props(예: `width`,
   `backgroundColor`)가 가장 우선순위가 높아 `style`도 이깁니다.

2번의 따름정리에 주의하십시오. 오버라이드가 먹히는 근거는 **스타일시트의 등록 순서**이며, 클래스 이름이
`className` 문자열 안에서 앞서고 뒤서는 것과는 무관합니다.

## 상속과 계산 스타일 경계

상속되는 속성은 소수뿐입니다: `color`, `visibility`, `font-family` / `font-size` / `font-weight` /
`font-style`, `line-height`, `text-align`, `white-space`, `overflow-wrap`, `pointer-events`, `cursor`.
나머지 속성(모든 레이아웃 속성 포함)은 노드마다 초깃값에서 시작합니다——쓰지 않으면 없는 것이며,
"부모로부터 너비를 상속받는" 같은 동작은 존재하지 않습니다.

각 속성은 단일 소스 schema에서 자신의 무효화 범위(레이아웃/페인트/히트/의미)를 선언합니다.
`opacity`를 바꿔도 리플로는 일어나지 않고 `width`를 바꾸면 일어납니다. 이는 [아키텍처](/ko/guide/architecture)의
무효화 모델과 같은 메커니즘입니다.

### 인터랙션 상태에서 선언할 수 있는 속성은 제한됩니다

상태 규칙(예: `.btn:hover`)에는 페인트류 속성만 쓸 수 있습니다: `background-color`, `color`,
`opacity`, 각 변의 `border-*-color`, `border-radius`, `box-shadow`, `visibility`,
`transform` / `transform-origin`, `pointer-events`, `cursor`. 상태 규칙에 레이아웃 속성을 쓰면
컴파일 타임에 거부됩니다——상태 전환은 레이아웃 변화를 일으킬 수 없습니다.

## CSS와의 주요 차이

subset은 의도적으로 완전한 CSS 호환을 하지 않습니다. 핵심 차이(전체 목록은 [CSS subset 지원](/style-support)):

- `position: absolute`의 containing block은 **부모 노드**이며 가장 가까운 positioned 조상이 아닙니다.
  `position: relative`는 없고, 시각적 오프셋은 `transform`을 씁니다.
- `flex-wrap`이 없습니다. flex 컨테이너는 한 줄이며 주축 넘침은 잘리거나 스크롤됩니다.
- flex item에는 automatic minimum size가 없어 0까지 압축될 수 있습니다(브라우저에서 `min-width: 0`을
  쓴 것과 동등). `min-width: auto` / `min-height: auto`는 바로 컴파일에 실패합니다.
- 주축 크기가 확정되지 않으면 퍼센트는 CSS의 `auto`가 아니라 `0`으로 해석됩니다.
- `box-shadow`는 바깥 그림자만 지원하고 노드당 최대 4겹이며, `inset`은 거부됩니다.
- `z-index`는 형제 사이에서만 안정적으로 재정렬되며 stacking context는 없습니다.

## pingo-ui의 테마와 오버라이드 규칙

`@dopejs/pingo-ui` 컴포넌트 라이브러리의 스킨은 위 메커니즘으로 컴파일된 한 장의 스타일시트입니다.

```ts
import { createHostedCanvasRoot, createStyleSheet } from "@dopejs/pingo";
import { createPingoUiStyleSheet } from "@dopejs/pingo-ui";

const myOverrides = createStyleSheet(`
  .pui-button { border-radius: 4px; }
`);

const root = await createHostedCanvasRoot(canvas, {
  styleSheets: [createPingoUiStyleSheet(), myOverrides], // 순서를 뒤집으면 안 됩니다
});
```

- **`createPingoUiStyleSheet()`는 root마다 독립적인 불변 sheet를 만듭니다.**
- **사용자 sheet는 반드시 pingo-ui sheet 뒤에 등록해야 합니다.** 같은 우선순위에서는 source order로
  오버라이드되므로 뒤에 쓴 것이 적용됩니다. 컴포넌트의 `className` prop은 컴포넌트 자체 클래스 이름 뒤에
  추가되지만(예: `pui-input pui-input--disabled mine`), 오버라이드 성패는 위의 등록 순서에만 달려 있습니다.
- 오버라이드 우선순위를 높이고 싶다면 복합 클래스로 specificity를 올리십시오(예: `.pui-button.mine`).
  쓰는 위치에 의존하지 마십시오.

### 라이트/다크 테마

```ts
import { setTheme, useTheme } from "@dopejs/pingo-ui";

setTheme("dark"); // 구독 중인 모든 컴포넌트가 자동으로 다시 렌더링됩니다
useTheme();       // 컴포넌트 render 안에서 읽고 구독합니다
```

테마는 모듈 레벨 signal입니다. 컴포넌트 render에서 `useTheme()`이 자동으로 구독하고, `setTheme`이
구독 중인 모든 컴포넌트의 재렌더링을 일으킵니다. 다크는 compound class로 구현됩니다——dark 테마에서
컴포넌트는 `pui-dark` 마커 클래스를 걸고, 스킨의 `.pui-x.pui-dark` 복합 규칙이 매치됩니다
(예: `.pui-card.pui-dark`).

**브랜드 커스터마이징은 빌드 타임 동작입니다.** 새 preset을 만들려면
`@use "@dopejs/pingo-ui/styles/tokens" with ($primary: ...)`로 token을 오버라이드한 뒤
`@dopejs/pingo-style-preprocess`의 Vite 플러그인으로 컴포넌트 스킨을 다시 컴파일합니다——브랜드 색을
바꾸는 것 = 다시 빌드하는 것이며 런타임에 바꿀 수 없습니다. token 값의 색상도 hex 또는
`rgb()` / `rgba()` / `hsl()` / `hsla()`만 쓸 수 있습니다. SCSS/Less 파이프라인은
[SCSS / Less 가이드](/ko/guide/scss-less)를 보십시오.
