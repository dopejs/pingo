---
title: Label
description: 폼 라벨 텍스트로, 입력 컨트롤과 함께 사용하며 pingo canvas에 렌더링됩니다.
---

# Label

라벨은 폼 컨트롤에 보이는 이름을 제공하는 데 사용합니다. 아래 미리보기는 pingo 엔진이 실시간으로 렌더링하며 사이트 테마에 따라 밝기 모드와 어두운 모드가 전환됩니다.

:::preview label-basic
:::

## 사용법

```tsx
import { Input, Label } from "@dopejs/pingo-ui";

root.render(
  <container style={{ flexDirection: "column" }}>
    <Label>邮箱</Label>
    <container height={8} />
    <Input semanticLabel="邮箱" width={320} />
  </container>,
);
```

pingo에는 `gap` 속성이 없으므로 라벨과 컨트롤 사이 간격은 고정 크기 컨테이너로 구현합니다.

## 예시

### 시맨틱 이름

pingo에는 아직 컨트롤 연결 기능이 없으므로 라벨과 컨트롤의 연결은 규칙에 따라 처리합니다. 컨트롤에 라벨과 동일한 `semanticLabel`을 전달하여 스크린 리더가 같은 이름을 읽을 수 있도록 합니다.

## Props

| Prop            | 타입     | 기본값 | 설명                                     |
| --------------- | -------- | ------ | ---------------------------------------- |
| `children`      | `string` | —      | 라벨 텍스트(필수)                        |
| `className`     | `string` | —      | 컴포넌트 클래스 이름 뒤에 추가           |
| `semanticLabel` | `string` | —      | 접근성 이름 재정의. 기본값은 라벨 텍스트 |

## 접근성

pingo에는 아직 라벨–컨트롤 연결 메커니즘이 없으므로 Label은 스타일이 적용된 텍스트일 뿐입니다. 접근성 이름이 시각적 근접 관계에 의존하지 않도록 항상 해당 컨트롤에 `semanticLabel`을 설정하십시오.
