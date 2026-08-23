---
layout: home

hero:
  name: Pingo
  text: canvas 렌더링 엔진
  tagline: Rust/WASM 코어 + TypeScript 셸 + 플러그형 백엔드. 고성능 인터랙션, 네이티브 가상 스크롤, canvas 안 텍스트 편집을 위해 설계되었으며, 기본 컴포넌트, CSS 스타일, shadcn에 맞춘 UI 컴포넌트 라이브러리를 함께 제공합니다.
  image:
    light: /pingo-mark.svg
    dark: /pingo-mark-dark.svg
    alt: Pingo
  actions:
    - theme: brand
      text: 빠른 시작
      link: /ko/guide/getting-started
    - theme: alt
      text: Playground
      link: /ko/playground
    - theme: alt
      text: GitHub
      link: https://github.com/dopejs/pingo

features:
  - title: 두 개의 클록, 메인 스레드가 멈춰도 프레임 드롭 없음
    details: UI 클록과 렌더링 클록이 서로 독립적입니다. 스크롤, 애니메이션, 레이아웃, 합성이 Worker 안에서 폐쇄 루프로 진행되므로 메인 스레드가 200ms 블로킹되어도 화면은 끊기지 않습니다.
  - title: 네이티브 가상 스크롤
    details: 누적합 트리, 방향 예측 프리페치, 자리표시자 보완이 모두 Core 안에 있습니다. 백만 행 고정 fixture의 20,000 프레임 재생 P95/P99는 마이크로초 미만이며, 스크롤 정상 상태에서는 Shell을 전혀 콜백하지 않습니다.
  - title: canvas 네이티브 편집
    details: 캐럿, 선택 영역, 드래그 선택, 더블클릭 단어 선택, IME 조합, 후보창 위치, 클립보드, 실행 취소/다시 실행이 모두 엔진이 구현합니다. 업무 코드가 입력 능력을 위해 HTML 컨트롤을 만들 일이 없습니다.
  - title: 접근성은 아키텍처의 일부
    details: Core가 의미 트리를 내보내고 호스트가 이를 canvas 옆의 DOM 섀도 트리로 미러링합니다. 스크린 리더가 동작하고, E2E가 픽셀 비교 대신 role/label로 요소를 선택할 수 있습니다.
  - title: 결정성과 차등 테스트
    details: 버전화된 바이너리 스트림, 주입 가능한 클록과 난수원, 녹화 재생, 그리고 증분 대 전체, 최적화 대 단순, wasm 대 native의 차등 오라클.
  - title: 자동 폴백, 언제나 퇴로 확보
    details: SharedArrayBuffer → postMessage → 메인 스레드 Canvas2D를 능력에 따라 자동 선택하며 기능은 동등합니다. 마이그레이션 레이어는 페이지 단위 그레이 롤아웃과 원클릭 롤백을 지원합니다.
  - title: 기본 컴포넌트 즉시 사용
    details: View/Text/Image, Input/TextArea, SVG/Path 같은 엔진 레벨 요소가 Scene 노드에 직접 대응합니다. 텍스트 셰이핑, 캐럿 기하, 편집 능력은 Core에서 오므로 DOM 컨트롤을 끼워 맞출 필요가 없습니다.
  - title: CSS와 SCSS/Less 지원
    details: "Shell 쪽에서 파싱하는 버전화된 CSS subset: 클래스 셀렉터, 인터랙션 상태, 상속과 계산 스타일 모두 명확한 경계가 있습니다. SCSS/Less는 빌드 타임에 컴파일·검증되며 프리프로세서는 브라우저 bundle에 들어가지 않습니다."
  - title: shadcn에 맞춘 UI 컴포넌트 라이브러리
    details: "@dopejs/pingo-ui의 컴포넌트 API와 스킨 의미는 shadcn/ui에 맞춰져 있습니다——Button, Dialog, Table, Calendar 등 모두 canvas로 렌더링되며, 라이트/다크 테마와 스타일시트 오버라이드를 지원합니다."
---

## 30초 만에 시작하기

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
    renderItem: (index) => createElement("text", { value: `${index}번째 행` }),
  }),
);
```

백만 행이 Shell 쪽에 실체화되지 않으며, 스크롤 중에도 컴포넌트 트리를 콜백하지 않습니다——윈도 계산과 보완 생성이 모두 Core 안에서 일어납니다.

## 하지 않는 것

Pingo는 렌더링 엔진이지 브라우저가 아닙니다. SSR/HTML 첫 화면, 범용 CSS 호환(박스 모델, 캐스케이드,
셀렉터), 미니 프로그램이나 네이티브 적응 레이어, 업무 레벨 리치 텍스트 의미(협업, 수식, Markdown 명령)는
**하지 않습니다**.

엔진이 **실제로 소유하는** 것은 캐럿, 선택 영역, IME, 클립보드, 실행 취소/다시 실행, 편집 가능 텍스트
프리미티브입니다——이것들이 업무 레이어로 밀려나 DOM 컨트롤로 끼워 맞춰지는 일은 없습니다.

## 현재 상태

P0–M8 모든 엔지니어링 마일스톤이 완료되었습니다. M9 "프로덕션 자격, 증분 합성, 릴리스 하드닝"은
계획 수립이 끝났지만 구현은 아직 시작하지 않았습니다. 자세한 내용은 [M9 계획](/m9-production-plan)을
보십시오. 현재 저장소 변경 사항은 여전히 Unreleased이며 새 npm 버전이 릴리스되었음을 뜻하지 않습니다.

실기기 성능, 실제 입력기, 스크린 리더, 미디어 전력 소모 매트릭스는 플랫폼 자격 수집에 해당하며 별도로
추적합니다. bidi 시각적 탐색과 WebGPU 백엔드 기본 활성화는 여전히 [기록된 보류 항목](/plan)입니다.
