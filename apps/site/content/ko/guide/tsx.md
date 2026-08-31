---
title: TSX
description: TSX 로 pingo 컴포넌트를 작성하는 방법과, 한 저장소에서 React 와 공존시키는 방법.
---

# TSX 로 pingo 작성하기

## 설정

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@dopejs/pingo"
  }
}
```

`jsx` 는 TypeScript 의 자동 런타임을 가리키고, `jsxImportSource` 는 그 대상을 React 가
아니라 pingo 의 `jsx-runtime` 으로 지정합니다. 이름에 있는 `react-jsx` 는 변환 모드의
이름일 뿐 React 와는 무관합니다.

## 태그가 될 수 있는 것

```tsx
import { createContext, memo, Text, useState, View, type PingoNode } from "@dopejs/pingo";
import { Button } from "@dopejs/pingo-ui";

const Theme = createContext("light");

function Row({ label }: { readonly label: string }): PingoNode {
  const [count, setCount] = useState(0);
  return (
    <View width={240} padding={8}>
      <text value={`${label} ${count}`} />
      <Button onPress={() => setCount(count + 1)}>더하기</Button>
    </View>
  );
}

root.render(
  <Theme.Provider value="dark">
    <Row label="클릭 수" />
  </Theme.Provider>,
);
```

다섯 가지 형태를 모두 쓸 수 있습니다.

| 형태                      | 예시                                                  |
| ------------------------- | ----------------------------------------------------- |
| 내장 요소                 | `<container>`, `<text>`, `<scroll>`, `<editableText>` |
| 기초 컴포넌트             | `<View>`, `<Text>`, `<Image>`, `<Input>`              |
| 직접 작성한 함수 컴포넌트 | `<Row label="…" />`                                   |
| `memo` 로 감싼 컴포넌트   | `@dopejs/pingo-ui` 의 모든 컴포넌트                   |
| context provider          | `<Theme.Provider value={…}>`                          |

::: warning hooks 를 쓰는 컴포넌트는 호출하지 말고 마운트해야 합니다
`Row({ label })` 은 타입 검사를 통과하지만
`hooks may only run in a function component` 로 실패합니다. hooks 에는 reconciler 가
만드는 컴포넌트 스코프가 필요합니다. `<Row label="…" />` 로 쓰세요.
:::

반환 타입에 `PingoNode` 를 써도 됩니다. `PingoNode` 는 `undefined` 를 포함하지만 JSX
태그와의 호환은 엔진의 `JSX.ElementType` 선언이 담당하므로 시그니처를 바꿀 필요가 없습니다.

## React 와 공존하기

한 저장소에 React 와 pingo 의 TSX 파일이 함께 있는 것은 흔한 상황입니다. 예를 들어 껍데기는
React 로 쓰고 성능이 필요한 영역만 pingo 로 그리는 경우입니다.

### 메커니즘은 파일 상단 선언

`jsxImportSource` 의 단위는 **파일**입니다. pingo 파일의 첫 줄에 이렇게 씁니다.

```tsx
/** @jsxImportSource @dopejs/pingo */
```

프로젝트의 `tsconfig.json` 은 React 설정 그대로 두고, 이 줄이 있는 파일만 pingo 런타임을
씁니다. `tsc`, esbuild/Vite, babel 모두 이것을 인식합니다.

**다른 두 가지 발상은 성립하지 않습니다**(실측).

| 방법                                                      | 결과                                                                                           |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| 디렉터리에 `jsxImportSource` 를 바꾼 `tsconfig.json` 두기 | `tsc` 는 완전히 무시하고 Vite 는 인식 — 빌드와 타입 검사 결론이 어긋남                         |
| `exclude` 로 파일명 제외하기                              | `exclude` 는 루트 파일 선택에만 영향을 주고, React 파일이 `import` 하는 순간 React 로 컴파일됨 |

파일명이 실제로 툴체인을 결정하게 하려면 composite project references 가 필요합니다
(pingo 프로젝트가 `.d.ts` 를 내고 React 프로젝트는 소스가 아니라 선언을 읽습니다).

이 줄을 빠뜨려도 조용히 깨지지 않고 컴파일 시점에 오류가 납니다.

```
error TS2322: Type 'Element' is not assignable to type 'PingoNode'.
error TS2786: 'View' cannot be used as a JSX component.
```

### 파일명 접미사는 관례

두 종류의 파일이 같은 디렉터리에 있을 때는 pingo 파일에 `scene.pingo.tsx` 같은 접미사를
붙이길 권합니다. 파일 목록에서 바로 구분되고, babel `overrides` 처럼 파일명 기반 설정에도
쓸 수 있습니다. 사람과 설정을 위한 관례일 뿐 **상단 선언을 대체하지는 않습니다**. 디렉터리
전체가 pingo 라면 디렉터리 자체가 신호이므로 접미사는 잡음입니다.

### 경계는 곧 파일 경계

한 파일에는 한 종류의 JSX 만 있으므로 **React 컴포넌트 안에 pingo 태그를 쓸 수 없습니다**.
pingo 파일이 씬을 내보내고 React 파일이 그것을 가져옵니다.

```tsx
/** @jsxImportSource @dopejs/pingo */
// scene.pingo.tsx
import { Text, View, type PingoNode } from "@dopejs/pingo";

export function scene(label: string): PingoNode {
  return (
    <View width={240} height={80} padding={12}>
      <Text value={label} />
    </View>
  );
}
```

### `PingoContainer` 로 마운트하기

```tsx
// App.tsx —— 이 파일의 태그는 React 의 것
import { PingoContainer } from "@dopejs/pingo/react";

import { scene } from "./scene.pingo";

export function App() {
  return <PingoContainer scene={scene("Hello")} style={{ height: 320, width: 480 }} />;
}
```

씬은 children 이 아니라 `scene` 속성으로 전달합니다. 이 파일의 태그는 React 의 것이라
pingo 의 children 을 쓸 수 없기 때문입니다.

`PingoContainer` 는 React 가 canvas 를 렌더링하고 ref 를 받는 대신 스스로 canvas 를
만듭니다. 이는 **필수**입니다. root 는 canvas 를 OffscreenCanvas 로 이양하고 그 이양은
영구적이며, React StrictMode 는 개발 환경에서 effect 를 두 번 실행합니다. React 가 소유한
canvas 는 두 번째 root 에 넘어가 이렇게 실패합니다.

```
this canvas already transferred control to an OffscreenCanvas and cannot host
a second root; create a new canvas element per root
```

컴포넌트가 만든 canvas 는 버려진 마운트와 함께 사라지므로 이 문제가 생기지 않습니다.
크기도 신경 쓸 필요가 없습니다. root 가 canvas 자신의 박스를 따라가므로 컨테이너에 CSS 로
크기를 주면 충분합니다.

root 가 필요할 때(스크롤 제어, 진단 콜백)는 `onRoot` 를, 시작 실패는 `onStartupError` 를
씁니다. 런타임 오류는 여전히 `options.onHostError` 로 갑니다.

### 두 트리는 상태를 공유하지 않습니다

React 의 state 와 context 는 pingo 컴포넌트 트리로 흘러가지 않으며 그 반대도 마찬가지입니다.
서로 독립적인 두 개의 reconciler 입니다. 경계를 넘는 통신은 평범한 데이터 흐름입니다.
React 쪽에서 값을 정해 `scene` 으로 넘기고, pingo 쪽은 이벤트 콜백으로 결과를 돌려줍니다.

## 이 저장소가 곧 예시입니다

`apps/site` 는 React 애플리케이션이면서 동시에 73 개의 pingo TSX 컴포넌트 프리뷰를 담고
있습니다. 두 종류가 함께 있는 디렉터리는
[`apps/site/src/interop`](https://github.com/dopejs/pingo/tree/main/apps/site/src/interop)
이고, 그 테스트는 `StrictMode` 아래에서 실행됩니다.
