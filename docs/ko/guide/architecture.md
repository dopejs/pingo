# 아키텍처 개요

## 양쪽의 소유권

```
TSX / hooks          →  Mutation Stream  →   Scene / Layout / Paint
（TypeScript Shell）      二进制、批量        （Rust Core，wasm）
                                                    ↓
Canvas2D 回放器      ←   DisplayList      ←    Picture
```

**Shell은 컴포넌트 트리를 소유하고, Core는 Scene을 소유합니다. 둘은 가변 객체를 공유하지 않습니다.**
경계를 넘는 모든 통신은 버전화된 바이너리 스트림입니다. 리틀 엔디언, 4바이트 정렬, 명령화되어 있으며,
수신 측은 메모리에 접근하기 전에 opcode, 길이, 정렬, ID, 산술 검증을 완료합니다. 기형 입력은 부분
적용이 아니라 원자적으로 거부됩니다.

이 경계는 성능 최적화가 아니라 정확성 경계입니다. 바이트가 보통 이 프로젝트 자신의 인코더에서 오더라도
디코더는 신뢰할 수 없는 입력으로 취급하며 fuzz 커버리지를 갖춥니다.

## 두 개의 클록

UI 클록(메인 스레드)과 렌더링 클록(Worker)은 서로 독립적입니다.

- 메인 스레드는 입력을 수집하고, 컴포넌트 트리를 실행하고, Mutation 프레임을 커밋합니다.
- Worker는 스크롤 물리, 애니메이션, 레이아웃, 합성을 구동합니다.

**스크롤 정상 상태에서는 Shell을 호출하지 않습니다.** 아직 없는 데이터는 자리표시자로 렌더링하고
이후 프레임에서 보완합니다. 따라서 메인 스레드가 업무 코드에 200ms 블로킹되어도 스크롤과 애니메이션은
끊기지 않습니다——이 시나리오는 자동화된 장애 주입 테스트가 지킵니다.

## 폴백 체인

능력 탐지는 순서대로 전송 경로를 선택하며, 세 단계 모두 기능이 동등합니다.

1. **SharedArrayBuffer** —— 크로스 오리진 격리(COOP/COEP) 필요
2. **postMessage** —— SAB가 없을 때
3. **메인 스레드 Canvas2D** —— Worker / OffscreenCanvas가 없을 때

```ts
const root = await createHostedCanvasRoot(canvas, {
  transport: { preference: "sab" }, // 선택적 선호도, 충족되지 않으면 여전히 폴백
});
console.log(root.mode); // "sab" | "post-message" | "main-thread"
```

이 사이트의 [Playground](/ko/playground)가 살아 있는 예입니다. GitHub Pages는 COOP/COEP 응답
헤더를 내려줄 수 없으므로 온라인에서는 postMessage 경로로 동작하며, 페이지 상단의 transport
표시가 이를 그대로 보여 줍니다.

## 무효화 모델

**prop 의미가 무효화 범위를 결정합니다.** 호출자가 수동으로 더티를 표시하지 않으며 `forceUpdate`
식의 탈출구도 없습니다.

각 속성은 단일 소스 schema에서 자신이 레이아웃, 페인트, 히트, 의미 중 무엇에 영향을 주는지 선언합니다.
`opacity`를 바꿔도 리플로는 일어나지 않고, `width`를 바꾸면 일어납니다. 더티 비트맵은 도메인별로
유지되며, `onFrame`이 도메인별 더티 노드 수를 노출합니다.

이 선택은 "공격적인 최소 무효화 + 속성 테스트로 받쳐 주기"입니다. 증분 렌더링 결과는 전체 렌더링과
픽셀 단위로 일치해야 하며, 차등 테스트가 반례를 최소 실패 케이스로 수렴시킵니다.

## Scene 표현

Core 안의 Scene은 SoA(구조체 배열을 배열 구조체로)입니다.

- 노드 ID에 **세대**가 포함되어, 슬롯 재사용이 만료된 ID를 다시 살리지 않습니다.
- commit 후에는 **위상 정렬**을 유지합니다. 부모 노드는 항상 자식 노드보다 앞에 옵니다.
- 구조 편집은 mutation마다가 아니라 commit마다 한 번씩 압축합니다.
- 레이아웃 결과는 이중 버퍼 SoA로 일괄 비교하며, 핫 패스에 노드별 클로저나 리스너 할당이 없습니다.

## 플러그형 백엔드

Core는 평탄한 바이너리 DisplayList를 출력하고, 백엔드는 그저 재생기입니다. Canvas2D 백엔드는 할당을
아끼는 typed-array 루프입니다——**그릴 때마다 wasm→JS를 한 번씩 호출하는 것은 받아들일 수 있는
렌더링 경로가 아닙니다**.

같은 DisplayList가 격리된 wgpu 프로토타입에도 공급되며, 둘의 출력을 픽셀 차등 비교합니다.
WebGPU 채택 여부는 데이터로 결정할 사안입니다. [ADR-0006](/adr/0006-webgpu-backend-decision)을
보십시오.

## 결정성

시간, 난수원, 입력 스트림은 모두 주입하거나 재생할 수 있으며, Core 출력은 스레드 스케줄링 순서에
의존하지 않습니다. `DOPR` 아카이브는 Mutation과 Input 스트림을 원래 순서대로 녹화해 브라우저 없이
headless 환경에서 결정적으로 재생할 수 있습니다——온라인 문제를 로컬에서 재현할 수 있는 이유입니다.
민감한 편집 스트림은 명시적으로 녹화를 건너뜁니다.

## 컴포넌트와 스타일

이 커널 위에는 세 겹의 작성자 지향 API가 있습니다.

- **기본 컴포넌트** —— View/Text/Image, Input/TextArea, SVG/Path 같은 엔진 레벨 요소.
  [기본 컴포넌트](/ko/guide/elements)를 보십시오.
- **스타일** —— Shell 쪽에서 파싱하는 버전화된 CSS subset(지원 표는 [여기](/style-support))와 빌드
  타임의 [SCSS/Less 파이프라인](/ko/guide/scss-less). Core는 정규화된 타입 값만 소비하며 CSS 텍스트를
  파싱하지 않습니다.
- **UI 컴포넌트 라이브러리** —— `@dopejs/pingo-ui`, shadcn/ui에 맞춘 완성 컴포넌트이며 모두 canvas로
  렌더링됩니다. [컴포넌트 문서](/ko/components)를 보십시오.

## 더 깊이

전체 알고리즘, 자료 구조, 검수 기준은 [기술 설계 문서](/design)를 보십시오.
