# 빠른 시작

## 설치

```sh
pnpm add @dopejs/pingo
```

비즈니스는 `@dopejs/pingo` 하나의 패키지만 의존합니다. `@dopejs/pingo-host`, `@dopejs/pingo-jsx` 등은 내부 구현 패키지로,
공개 계약에 속하지 않습니다—[마이그레이션 스캐너](/guide/migration)가 직접 import하는 것을 거부합니다.

## 첫 번째 캔버스 마운트

```tsx
import { createHostedCanvasRoot } from "@dopejs/pingo";

const canvas = document.querySelector<HTMLCanvasElement>("#app")!;
canvas.width = 800;
canvas.height = 600;

const root = await createHostedCanvasRoot(canvas);

root.render(
  <container width={800} height={600} backgroundColor="#ffffffff" padding={24}>
    <text value="Hello pingo" fontSize={24} lineHeight={32} color="#1f2329ff" />
  </container>,
);
```

`createHostedCanvasRoot`는 브라우저 기능을 자동으로 탐지하여 SharedArrayBuffer, postMessage와 메인 스레드
Canvas2D 사이에서 전송 경로를 선택하므로, 폴백을 위한 분기를 작성할 필요가 없습니다. `root.mode`는 실제 선택된 경로를 반환합니다.

## TSX 사용

`tsconfig.json`을 설정합니다:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@dopejs/pingo"
  }
}
```

이후 다음과 같이 작성할 수 있습니다:

```tsx
function OrderRow({ index }: { index: number }) {
  return (
    <container width={480} height={32} padding={[6, 12, 6, 12]}>
      <text value={`订单 #${index}`} fontSize={13} lineHeight={20} />
    </container>
  );
}

root.render(<OrderRow index={1} />);
```

## 호스트 요소

엔진에는 다섯 개의 내장 요소만 있으며, 이들은 Scene 노드에 직접 대응하고 CSS 계층이나 선택자는 존재하지 않습니다:

| 요소           | 용도                                                        |
| -------------- | ----------------------------------------------------------- |
| `container`    | 범용 그룹, 배경, 패딩, 변환                                 |
| `text`         | 텍스트 런(shaping, 줄바꿈, caret 기하 정보는 Core에서 제공) |
| `scroll`       | Core가 소유하는 스크롤 가능한 컨테이너                      |
| `virtualList`  | Core가 창을 계획하는 가상 스크롤 목록                       |
| `editableText` | 편집 가능한 텍스트 프리미티브                               |

`TextField`와 `TextArea`는 `editableText` 위에 조합된 위젯(테두리, 오류 상태)으로,
새로운 입력 경로를 도입하지 않습니다.

## 상태와 부수 효과

```tsx
import { signal, useEffect, useSignal, useState } from "@dopejs/pingo";

function Counter() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setCount((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, []);
  return <text value={`已过 ${count} 秒`} />;
}
```

사용 가능한 반응형 프리미티브: `signal`, `computed`, `effect`, `batch`, `untracked`,
그리고 hooks `useState`, `useSignal`, `useMemo`, `useCallback`, `useRef`, `useEffect`.

::: warning 동기 레이아웃 읽기 없음
`useLayoutEffect` 방식의 동기 Worker 레이아웃 읽기는 지원되지 않습니다—레이아웃은 다른 클록에서 발생합니다.
레이아웃 결과가 필요하면 비동기 계약을 사용하고, 렌더링 중에 동기적으로 기하 정보를 읽으려 하지 마십시오.
:::

## 실행 상태 관측

```ts
const root = await createHostedCanvasRoot(canvas, {
  onFrame: (report) => {
    console.log(report.commands, report.displayListBytes, report.core?.sceneNodes);
  },
  onHostError: (error) => report(error),
});
```

`onFrame`은 매 프레임마다 명령 수, DisplayList 바이트 수, Core 측의 더티 영역 카운트, 레이아웃 작업량, picture hash를 제공하므로,
성능 문제를 진단하는 최우선 데이터입니다. 자세한 내용은 [진단](/guide/diagnostics)을 참조하십시오.

## 기능 둘러보기

다섯 개의 내장 요소 위에서 pingo는 또한 작성자 대상의 세 가지 계층을 제공합니다:

- [기본 컴포넌트](/guide/elements): View/Text/Image, Input/TextArea, SVG/Path 등 엔진 수준 요소.
- [스타일](/guide/styling): 버전화된 CSS 하위 집합—클래스 선택자, 상호작용 상태, 계층과 상속의 명확한 경계;
  변수와 mixin이 필요하면 빌드 시점의 [SCSS / Less 파이프라인](/guide/scss-less)을 사용합니다.
- [UI 컴포넌트 라이브러리](/components): `@dopejs/pingo-ui`, shadcn/ui에 맞춘 완성 컴포넌트로, 모두 canvas에 렌더링됩니다.

## 다음 단계

- [아키텍처 개요](/guide/architecture): Shell과 Core의 역할 분담
- [스크롤과 가상화](/guide/scrolling), [텍스트와 편집](/guide/editing)
- [Playground](/playground): 인터랙티브 실시간 데모
