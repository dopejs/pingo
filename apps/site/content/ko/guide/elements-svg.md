---
title: "벡터 그래픽: Path와 SVG"
description: Path 벡터 외곽선과 SVG 문서 subset——d 문법, viewBox 스케일링, 스트로크와 currentColor 아이콘.
---

# 벡터 그래픽: Path와 SVG

pingo의 벡터 그래픽은 엔진이 그리는 일급 기능입니다. 경로는 Core 쪽에 불변 리소스로 존재하며, 같은
아이콘을 50번 그려도 기하는 한 벌뿐입니다. 진입점은 두 개입니다. `Path`는 SVG path 데이터 한 토막을
직접 받고, `Svg`는 `createSvg` / `loadSvg`가 파싱한 문서 전체를 받습니다. 아래 미리보기는 엔진이
실시간으로 렌더링하며, 아이콘 색상은 사이트 테마를 따릅니다.

:::preview elements-svg-icon
:::

## Path: 외곽선 하나

```tsx
import { createElement, Path, View } from "@dopejs/pingo";

createElement(View, {
  style: { color: "#3157dfff" }, // 외곽선은 노드의 color에 그려지며, 글자처럼 상속됩니다
  children: createElement(Path, {
    d: "M20 6 9 17l-5-5",
    viewBox: [0, 0, 24, 24],
    width: 24,
    height: 24,
    strokeWidth: 2,
  }),
});
```

- `d`는 완전한 SVG path 문법을 지원합니다(`M L H V C S Q T A Z`와 소문자 상대 형식). 원호 `A`는 파싱
  시점에 삼차 베지어로 변환되므로 Core에는 별도의 곡선 타입이 필요 없습니다.
- `viewBox`는 작성자 공간의 박스로, 그릴 때 노드 박스에 맞게 스케일됩니다——같은 리소스가 16px 노드와
  48px 노드 모두에서 그대로 쓸 수 있고 호출자가 환산할 필요가 없습니다.
- `strokeWidth`를 넘기지 않으면 외곽선을 채우고, 0이 아닌 값을 넘기면 그 너비로 스트로크합니다
  (round cap/join).
- `geometryTransform`은 인코딩 전에 기하 점에 구워 넣습니다(SVG 문서에서 group transform이 옮기는 것은
  그래픽이지 그것이 놓인 박스가 아닙니다). 노드의 시각적 `transform`과는 다른 이야기입니다.

:::preview elements-path
:::

## Svg: 문서 subset

`createSvg(markup)`은 `DOMParser`가 아니라 손으로 쓴 파서를 사용합니다——엔진은 브라우저, Worker,
headless 차등 테스트에서 완전히 같은 기하를 만들어 내야 하는데 `DOMParser`는 Worker에 존재하지
않기 때문입니다. subset은 아이콘 세트가 실제로 담고 있는 내용입니다.

- 도형 요소: `path` `circle` `ellipse` `rect` `line` `polyline` `polygon`
- 구조 요소: `svg` `g` `title` `desc` `defs` `metadata`
- 속성: `fill` `stroke` `stroke-width` `fill-rule` `transform`
  (`translate`/`scale`/`rotate`/`matrix`, skew는 subset에 없음)

subset 밖의 요소는 **이름을 보고 거부**하며 `PingoSvgError`를 던집니다——호출자는 빈 박스를 마주하는
대신 무엇이 빠졌는지 명확히 알게 됩니다. 이름 붙은 CSS 색상도 같은 이유로 거부됩니다. 반쪽짜리 색상표는
일부 문서는 정상으로, 다른 일부는 조용히 검게 만들기 때문입니다. 16진수 색상, `none`, `transparent`,
`currentColor`는 모두 subset 안에 있습니다. `currentColor`는 "노드 색상 상속"으로 해석되므로 아이콘이
글자처럼 테마를 따라 색을 바꿀 수 있습니다(미리보기에서 쓴 방법).

`Svg` 컴포넌트는 문서를 **도형마다 path 노드 하나**로 펼치고, 도형 사이는 절대 위치로 겹칩니다.
채우기와 스트로크를 모두 하는 도형은 두 개의 노드가 됩니다——채우기와 스트로크는 한 노드의 두 반쪽이
아니라 두 종류의 paint이기 때문입니다.

```ts
import { createSvg, loadSvg, Svg } from "@dopejs/pingo";

const icon = createSvg(`<svg viewBox="0 0 24 24" stroke="currentColor" …>…</svg>`);
createElement(Svg, { source: icon, width: 24, height: 24, style: { color: "#3157df" } });

const remote = await loadSvg("/assets/logo.svg");
```

프로그램적 접근이 필요하면 `PingoSvg.shapes`가 도형마다 `d`, `transform`, 채우기/스트로크, `fillRule`을
제공하고, `shapeData(name, attributes)`는 도형 요소 하나를 등가의 path 데이터로 변환합니다.

## Props(Path)

| Prop                | 타입                                                        | 기본값      | 설명                                          |
| ------------------- | ----------------------------------------------------------- | ----------- | --------------------------------------------- |
| `d`                 | `string`                                                    | —           | SVG path 데이터(필수, 경로 문법만, 문서 아님) |
| `viewBox`           | `readonly [number, number, number, number]`                 | —           | 작성자 공간 박스, 노드 박스에 맞게 스케일     |
| `strokeWidth`       | `number`                                                    | —           | 0이 아니면 채우지 않고 스트로크               |
| `fillRule`          | `"nonzero" \| "evenodd"`                                    | `"nonzero"` | 채우기 규칙                                   |
| `geometryTransform` | `readonly [number, number, number, number, number, number]` | 단위 행렬   | 인코딩 전에 기하에 구워 넣는 변환             |

## Props(Svg)

| Prop     | 타입       | 기본값 | 설명                                        |
| -------- | ---------- | ------ | ------------------------------------------- |
| `source` | `PingoSvg` | —      | `createSvg` / `loadSvg`가 파싱한 문서(필수) |

둘 모두 [CommonProps](/api)(`width`/`height`, 이벤트, 의미 props 등)를 상속합니다.

## 접근성

벡터 그래픽 자체에는 의미가 없습니다. 장식용 아이콘은 표기할 필요가 없습니다. 클릭 가능한 아이콘 버튼에는
`semanticRole: "button"`과 `semanticLabel`을 주십시오. 자세한 내용은 [접근성](/ko/guide/accessibility)을
보십시오.
