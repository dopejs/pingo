---
title: StatCard
description: 지표 카드 분자 컴포넌트로, 수치·전월 대비 변화와 추세 색상을 표시하며 pingo canvas에 렌더링합니다.
---

# StatCard

StatCard는 pingo 고유의 제품 분자입니다. 라벨, 수치, 전월 대비 delta, 설명 텍스트로 구성된 지표 타일입니다. `trend`는 delta의 색상에만 영향을 줍니다. `flat`은 중립 회색을 유지하는데, 보합 지표는 좋고 나쁨을 따질 수 없기 때문입니다. 아래 미리보기는 pingo 엔진이 실시간 렌더링하며 사이트 테마에 따라 밝은 모드와 어두운 모드를 전환합니다.

:::preview statcard-basic
:::

shadcn 기본 요소와의 조합 관계: StatCard는 자체 완결형 표시 분자로, 내부적으로 Text/View 원시 요소만 사용하며 슬롯을预留하지 않습니다. 대시보드 레이아웃에서는 보통 `flexDirection: "row"`인 container로 여러 StatCard를 한 줄로 배치하거나, Card·Divider와 조합해 보고서 섹션을 구성합니다. 수치 서식(천 단위 구분, 통화 기호)은 호출 측에서 처리하며 `value`/`delta`는 모두 순수 문자열입니다.

## 사용법

```tsx
import { StatCard } from "@dopejs/pingo-ui";

root.render(
  <StatCard
    label="이번 달 매출"
    value="¥128,400"
    delta="+12.5%"
    trend="up"
    description="지난달 대비"
  />,
);
```

## 예시

### 추세 색상

`trend`는 `"up"` / `"down"` / `"flat"` 값을 가지며 delta를 각각 상승, 하락, 중립 색상으로 표시합니다. `trend`를 전달하지 않으면 `flat`으로 처리합니다.

### delta 없음

`delta`를 생략하면 수치가 한 줄을 독차지하며 `trend`는 적용되지 않습니다. `description`도 마찬가지로 생략할 수 있습니다.

```tsx
<StatCard label="온라인 기기" value="1,024" />
```

## Props

| Prop          | 类型                       | 기본값   | 설명                                       |
| ------------- | -------------------------- | -------- | ------------------------------------------ |
| `label`       | `string`                   | —        | 지표 이름(필수)                            |
| `value`       | `string`                   | —        | 지표 수치, 서식은 호출 측에서 담당(필수)   |
| `delta`       | `string`                   | —        | 전월 대비 변화(예: `+12.5%`)               |
| `trend`       | `"up" \| "down" \| "flat"` | `"flat"` | delta의 색상 방향, 다른 부분에는 영향 없음 |
| `description` | `string`                   | —        | 하단 설명 텍스트(예: 비교 주기)            |
| `className`   | `string`                   | —        | 컴포넌트 클래스 이름 뒤에 추가             |

## 접근성

StatCard는 `group` 의미 역할을 가지며 접근성 이름은 `label`을 사용합니다. 라벨, 수치, delta는 그룹 내 텍스트로 보조 기술이 순서대로 읽습니다. 추세를 색상만으로 표현할 때는 `delta` 텍스트 자체에 방향 정보(예: `+`/`-` 접두사)가 포함되도록 하고, 빨강·초록 색상에만 의존하지 마십시오.
