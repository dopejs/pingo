---
title: "기본 요소: View, Text, Image"
description: View 컨테이너와 flex 레이아웃, Text 텍스트 렌더링, Image 비트맵과 PingoFont 명시적 폰트.
---

# 기본 요소: View, Text, Image

pingo의 호스트 요소는 Scene 노드에 직접 대응하며, CSS 캐스케이드나 셀렉터 매칭 비용이 없습니다(스타일
기능은 [스타일](/ko/guide/styling) 참조). 이 페이지는 가장 기본적인 세 요소——범용 박스 `View`, 텍스트
`Text`, 비트맵 `Image`——를 다룹니다. 아래 미리보기는 pingo 엔진이 실시간으로 렌더링하며 사이트 테마를
따라 라이트/다크가 전환됩니다.

:::preview elements-layout
:::

## View와 레이아웃

`View`는 범용 그룹 박스(`container` 호스트 요소에 대응)로, 새로운 Scene 노드 종류를 도입하지 않습니다.

- `width` / `height` / `minWidth` / `maxWidth` / `padding` / `backgroundColor` / `opacity` /
  `transform`은 직접 props이며, `padding`은 숫자나 `[위, 오른쪽, 아래, 왼쪽]` 네 값 튜플을 받습니다.
- `flexDirection`, `justifyContent`, `alignItems`, 테두리와 둥근 모서리는 `style` 인라인 채널을
  사용합니다(타입화된 CSS subset, [스타일](/ko/guide/styling) 참조).
- 자식 간 간격은 고정 크기 컨테이너로 명시적으로 표현하며, 미리보기의 `row` / `column` 헬퍼도 그렇게
  구현되어 있습니다.

## 사용법

```tsx
import { createElement, Text, View } from "@dopejs/pingo";

root.render(
  createElement(View, {
    width: 420,
    padding: 16,
    backgroundColor: "#ffffffff",
    style: { flexDirection: "column", borderRadius: 10 },
    children: [
      createElement(Text, { value: "제목", fontSize: 24, lineHeight: 32, fontWeight: 700 }),
      createElement(View, { height: 8 }),
      createElement(Text, { value: "본문", fontSize: 14, lineHeight: 22 }),
    ],
  }),
);
```

## Text: 텍스트 런

텍스트의 셰이핑, 줄바꿈, 측정은 모두 Core가 수행합니다——중국어·영어 혼합 조판, 이모지, 결합 문자
모두 Shell이 관여할 필요가 없습니다. 내용은 `value` 또는 문자열 `children`으로 전달합니다.

:::preview elements-text
:::

### Props(Text)

| Prop | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `value` | `string` | — | 텍스트 내용(`children`과 택일) |
| `children` | `string \| number` | — | 텍스트 내용 |
| `color` | `Color` | `#000000ff` | 텍스트 색상, 상속 가능 |
| `fontSize` | `number` | — | 글자 크기(논리 픽셀) |
| `lineHeight` | `number` | — | 줄 높이(논리 픽셀) |
| `fontWeight` | `number` | — | 글자 굵기 |
| `fontFamily` | `string` | — | CSS 폰트 패밀리 |
| `font` | `PingoFont` | — | 명시적 불변 폰트. 지원하지 않는 입력은 전체가 폴백 |

`Text`는 모든 [CommonProps](/api)(크기, padding, 이벤트, `semanticRole` / `semanticLabel` 등)도
상속합니다.

## Image: 비트맵

`Image`의 `source`는 `PingoImage`입니다——Shell 쪽이 들고 있는 **불변 RGBA8 비트맵**으로, 커밋 경계에서
동기적으로 Scene 리소스로 인라인됩니다. `createImage`로 만들며, 픽셀을 복사하고 검증합니다.

```ts
import { createImage, Image } from "@dopejs/pingo";

const icon = createImage(pixels, 96, 96, { label: "앱 아이콘" });
createElement(Image, { source: icon, width: 48, height: 48 });
```

`width` / `height`를 넘기지 않으면 노드가 이미지의 픽셀 크기를 취하고, 넘기면 노드 박스에 맞게
스케일됩니다. `label`은 접근성 이름이며, 비워 두면 장식용 이미지라는 뜻입니다.

:::preview elements-image
:::

인코딩된 바이트가 아니라 픽셀을 받는 것은 의도된 trade-off입니다. 리소스 트랜잭션은 커밋 경계에서
동기적으로 효력이 생기지만, 어떤 인코딩 포맷이든 비동기 디코딩이 필요하기 때문입니다. 리스트 썸네일
같은 작은 이미지에는 이 경로가 적합하고, 큰 이미지는 비동기 staging이 있는 인코딩 경로를 사용해야 합니다.

## 폰트: PingoFont와 loadFont

`Text` / 편집 가능 요소의 `font` prop은 명시적인 불변 SFNT 폰트(TTF/OTF/TTC)를 받으며, Core가 결정적으로
셰이핑합니다. `createFont`는 이미 디코딩된 SFNT 바이트를 받고, `loadFont`는 네트워크 로딩과 WOFF/WOFF2
디코딩까지 처리합니다.

```ts
import { loadFont } from "@dopejs/pingo";

const inter = await loadFont("/fonts/Inter-Regular.woff2", {
  fallbackFamily: "sans-serif",
});
createElement(Text, { value: "Hello", font: inter, fontSize: 16 });
```

`PingoFontOptions`: `faceIndex`(TTC 컬렉션 안의 면 인덱스, 기본값 `0`)와 `fallbackFamily`(명시적 폰트
경로가 전체 폴백할 때 쓰는 CSS 패밀리, 기본값 `"sans-serif"`). 로딩 실패 시 안정적인 `code`를 가진
`PingoFontLoadError`를 던집니다(예: `fetch-failed`, `decode-failed`, `unsupported-format`).

## 접근성

`semanticRole`과 `semanticLabel`은 모든 요소가 공유하는 props입니다. 제목, 버튼, 영역 모두 요소에
의미를 표기해야 하며, `Image`의 이름은 `createImage`의 `label`에서 옵니다. 의미 스냅숏은 canvas 옆의
DOM 섀도 트리로 미러링됩니다. 자세한 내용은 [접근성](/ko/guide/accessibility)을 보십시오.
