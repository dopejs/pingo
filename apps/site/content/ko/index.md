---
layout: home

hero:
  name: Pingo
  text: canvas 렌더링 엔진
  tagline: Rust/WASM 코어 + TypeScript 셸 + 플러그형 백엔드. 고성능 인터랙션, 네이티브 가상 스크롤, canvas 내 텍스트 편집을 위해 설계되었으며 기본 컴포넌트, CSS 스타일, shadcn 정렬 UI 컴포넌트 라이브러리를 함께 제공합니다.
  image:
    light: /pingo-mark.svg
    dark: /pingo-mark-dark.svg
    alt: Pingo
  actions:
    - theme: brand
      text: 빠른 시작
      link: /guide/getting-started
    - theme: alt
      text: Playground
      link: /playground
    - theme: alt
      text: GitHub
      link: https://github.com/dopejs/pingo

features:
  - title: 듀얼 클록, 메인 스레드가 멈춰도 프레임 손실 없음
    details: UI 클록과 렌더링 클록이 서로 독립적입니다. 스크롤, 애니메이션, 레이아웃, 합성이 Worker 내부에서 폐쇄 루프로 진행되며, 메인 스레드가 200ms 동안 차단되어도 화면은 계속 연속적으로 표시됩니다.
  - title: 네이티브 가상 스크롤
    details: prefix sum 트리, 방향 예측 프리페치, 자리 표시자 보충 생성이 모두 Core 내부에서 이루어집니다. 백만 행 고정 fixture의 20,000프레임 재생에서 P95/P99가 서브 마이크로초 수준이며, 스크롤 정상 상태에서는 셸로 콜백이 전혀 발생하지 않습니다.
  - title: canvas 네이티브 편집
    details: caret, 선택 영역, 드래그 선택, 더블클릭 단어 선택, IME composition, 후보 창 위치 지정, 클립보드, 실행 취소/재실행이 모두 엔진에 의해 구현됩니다. 비즈니스 로직에서 입력 기능을 위해 HTML 컨트롤을 만들 필요가 없습니다.
  - title: 접근성은 아키텍처의 일부
    details: Core가 시맨틱 트리를 내보내고, 호스트는 이를 canvas 옆의 DOM 섀도 트리로 미러링합니다. 스크린 리더를 사용할 수 있으며, E2E에서 픽셀을 비교하는 대신 role/label로 요소를 선택할 수 있습니다.
  - title: 결정성 및 차등 테스트
    details: 버전화된 바이너리 스트림, 주입 가능한 클록과 난수 소스, 녹화 및 재생, 그리고 증분/전체, 최적화/순수 구현, wasm/native 간의 차등 oracle을 제공합니다.
  - title: 자동 폴백, 언제나 대안 존재
    details: SharedArrayBuffer → postMessage → 메인 스레드 Canvas2D 순서로 기능에 따라 자동 선택되며 기능은 동등합니다. 마이그레이션 계층은 페이지별 그레이스케일 롤아웃과 원클릭 롤백을 지원합니다.
  - title: 기본 컴포넌트 즉시 사용 가능
    details: View/Text/Image, Input/TextArea, SVG/Path 등 엔진 수준 요소가 Scene 노드에 직접 대응되며, 텍스트 셰이핑, caret 지오메트리, 편집 기능은 Core에서 제공하므로 DOM 컨트롤을 조합할 필요가 없습니다.
  - title: CSS 및 SCSS/Less 지원
    details: 셸 측에서 파싱하는 버전화된 CSS subset입니다. 클래스 선택자, 인터랙션 상태, 상속, 계산된 스타일에 명확한 경계가 있으며, SCSS/Less는 빌드 시점에 컴파일 및 검증되어 프리프로세서가 브라우저 번들에 포함되지 않습니다.
  - title: shadcn 정렬 UI 컴포넌트 라이브러리
    details: "@dopejs/pingo-ui의 컴포넌트 API와 스킨 시맨틱이 shadcn/ui와 정렬됩니다. Button, Dialog, Table, Calendar 등이 모두 canvas에 렌더링되며 라이트/다크 테마와 스타일시트 오버라이드를 지원합니다."
---

## 30초 시작하기

```sh
pnpm add @dopejs/pingo
```

```ts
import { createElement, createHostedCanvasRoot } from "@dopejs/pingo";

const root = await createHostedCanvasRoot(document.querySelector("canvas")!);

root.render(
  createElement("virtualList", {
    width: 480,
    height: 640,
    itemCount: 1_000_000,
    estimatedItemHeight: 32,
    renderItem: (index) => createElement("text", { value: `第 ${index} 行` }),
  }),
);
```

백만 행이 셸 측에서 구체화되지 않으며, 스크롤 과정에서도 컴포넌트 트리로 콜백이 발생하지 않습니다. 윈도우 계산과 보충 생성은 모두 Core 내부에서 이루어집니다.

## 하지 않는 일

Pingo는 렌더링 엔진이지 브라우저가 아닙니다. SSR/HTML 첫 화면, 범용 CSS 호환성(박스 모델, 캐스케이딩, 선택자), 미니프로그램 또는 네이티브 어댑터 계층, 비즈니스 수준 리치 텍스트 시맨틱(협업, 수식, Markdown 명령)을 **지원하지 않습니다**.

엔진은 caret, 선택 영역, IME, 클립보드, 실행 취소/재실행, 편집 가능한 텍스트 프리미티브를 **실제로 소유합니다**. 이러한 기능은 비즈니스 계층에서 DOM 컨트롤로 조합하도록 밀어내지 않습니다.

실기기 성능, 실제 입력기, 스크린 리더, 미디어 전력 소비 매트릭스는 플랫폼 자격 수집 항목으로 별도 추적됩니다. bidi 시각 내비게이션과 WebGPU 백엔드 기본 활성화는 여전히 [기록된 연기 항목](https://github.com/dopejs/pingo/blob/main/docs/plan.md)입니다.
