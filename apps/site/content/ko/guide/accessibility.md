# 접근성과 테스트 용이성

## 첫날부터 아키텍처에 넣는다

canvas 내용은 본질적으로 스크린 리더에 보이지 않습니다. pingo는 접근성을 출시 후에 덧씌우는
레이어로 다루지 않습니다. Core가 시맨틱 트리(role / label / value / bounds / focusable)를 유지하고,
`@dopejs/pingo-a11y`가 이를 canvas 옆의 절대 위치 DOM 섀도 트리로 증분 반영합니다.

섀도 요소는 시각적으로 투명하지만 접근성 트리와 tab 순서에는 존재합니다. 포커스하면 엔진의 편집
세션으로 전달되므로 키보드 사용자가 canvas 안의 입력란을 실제로 조작할 수 있습니다.

## 시맨틱 선언하기

```tsx
<container semanticRole="region" semanticLabel="결제 패널">
  <text value="결제" semanticRole="heading" semanticLabel="결제" />
  {TextField({ semanticLabel: "수신인", value, revision })}
</container>
```

`editableText`는 기본적으로 textbox 시맨틱을 가집니다. 비밀번호 필드의 값은 시맨틱 트리에
**절대 들어가지 않습니다**.

## 시맨틱으로 E2E 작성하기

시맨틱 트리가 실제 DOM으로 반영되므로 E2E는 픽셀 비교 대신 역할과 이름으로 요소를 선택할 수 있습니다.

```ts
import { getByRole, queryAllByRole } from "@dopejs/pingo";

const email = getByRole(document.body, "textbox", { name: "수신인" });
email.focus(); // 엔진 편집 세션으로 전달됩니다
expect(queryAllByRole(document.body, "textbox")).toHaveLength(2);
```

픽셀 스냅샷은 계속 유지하지만 렌더링 정확성에 대한 **보조 증거**이지 유일한 단언은 아닙니다.
이 선택 덕분에 폰트 렌더링이나 안티에일리어싱이 바뀌었다는 이유만으로 UI 테스트가 무더기로
깨지지 않습니다.

## 실제로 그려진 텍스트 단언하기

시맨틱 트리는 "이 노드가 무엇인가"에 답하지만 "이 프레임이 그 문자열을 실제로
그렸는가"에는 답하지 않습니다. 그 사이에는 가시성, 그리기 순서, 가상화, 서브트리
캐시가 있고 주 그리기 경로의 명령에는 문자열이 아예 담기지 않습니다.
`onPaintedText` 가 나머지 절반을 채웁니다.

```ts
let painted: PaintedTextSnapshot | undefined;
const root = await createHostedCanvasRoot(canvas, {
  onPaintedText: (snapshot) => (painted = snapshot),
});

// 시맨틱 트리는 버튼이 있다고, 프로브는 이번 프레임에 그려졌다고 말한다.
getByRole(document.body, "button", { name: "저장" });
expect(painted?.records.some((record) => record.text === "저장")).toBe(true);
```

스냅숏은 프레임마다 한 번 도착하며 `root.paintedText()` 는 가장 최근 것을 돌려줍니다.
각 레코드는 `nodeId`, `text`, 디바이스 좌표 `origin`, 그리기 채널 `channel`,
`originClipped` 를 담습니다. `onPaintedText` 를 넘기지 않으면 엔진은 계산 자체를 하지
않으므로 프레임 비용은 이 기능이 없을 때와 같습니다.

경계가 둘 있습니다. 보고하는 것은 **Core 가 내보낸 것**이지 재생 후에도 보이는 것이
아닙니다. 뷰포트 컬링은 백엔드에서 일어납니다. 비밀번호 필드는 마스크 `•` 를
보고합니다. 실제로 그려진 것이 그것이기 때문입니다.

## 시맨틱 트리 관측하기

```ts
const root = await createHostedCanvasRoot(canvas, {
  onSemantics: (nodes) => inspect(nodes),
  accessibility: true, // 기본 활성화. false로 두면 섀도 트리를 끕니다
});
```

각 노드는 `nodeId`, `role`, `label`, `value`, 월드 `bounds`, `focusable`, `focused`, `password`
플래그를 제공합니다. 프레임 진단의 `dirtySemanticsNodes`로 시맨틱 무효화 빈도를 관찰할 수 있습니다.

## 플랫폼 자격

자동화가 다루는 것은 시맨틱 트리 내보내기, 섀도 트리 매핑, role/label 셀렉터, 키보드 계약입니다.
**실제 스크린 리더(VoiceOver, NVDA, TalkBack)의 동작 매트릭스는 플랫폼 자격 수집**으로 따로
추적하며 엔지니어링 완료 조건에 넣지 않습니다. 이 경계는 검증하지 않은 기기 결론을 지원 약속으로
위장하지 않기 위한 것입니다.

[Playground의 시맨틱 데모](/ko/playground#/semantics)에서 현재 시맨틱 트리를 직접 읽을 수 있습니다.
