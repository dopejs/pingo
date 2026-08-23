---
title: ListRow
description: 목록 행 분자 컴포넌트로, 아바타·배지 등 기본 컴포넌트와 선택/비활성 상태를 조합하여 pingo canvas 위에 렌더링합니다.
---

# ListRow

ListRow는 pingo 고유의 제품 분자입니다. 한 줄짜리 목록 항목으로, 제목과 설명이 가운데 가변 열을 차지하고 `leading`(아바타, 아이콘)과 `trailing`(배지, 스위치, 화살표) 슬롯이 양 끝에 배치됩니다. 아래 미리보기는 pingo 엔진이 실시간으로 렌더링합니다. 클릭 가능한 행은 완전한 포인터 피드백을 가지며, 사이트 테마에 따라 명암이 전환됩니다.

:::preview list-row-basic
:::

shadcn 기본 컴포넌트와의 조합 관계: ListRow는 행 레이아웃과 상호작용 상태를 정의하며, 어떤 콘텐츠 컴포넌트도 내장하지 않습니다. `leading`/`trailing` 슬롯은 임의의 `PingoNode`를 받으며, 일반적으로 Avatar, Badge 또는 Switch를 조합합니다. 인접한 행 사이에 여백이 필요하면 고정 높이의 container로 간격을 만듭니다(pingo에는 gap 속성이 없습니다).

## 사용법

```tsx
import { createElement } from "@dopejs/pingo";
import { Avatar, Badge, ListRow } from "@dopejs/pingo-ui";

root.render(
  createElement(ListRow, {
    title: "张三",
    description: "zhangsan@example.com",
    leading: createElement(Avatar, { fallback: "张", size: 32 }),
    trailing: createElement(Badge, { children: "管理员" }),
    onPress: () => openMember("zhangsan"),
  }),
);
```

## 예시

### 선택 및 비활성

`selected`는 선택 스타일을 적용하고 선택 상태를 외부에 노출합니다. `disabled`인 행은 어떤 이벤트 핸들러도 가지지 않습니다. “핸들러 안에서 다시 판단”하는 것보다 더 강력합니다.

:::preview list-row-states
:::

### 순수 표시 행

`onPress`를 전달하지 않으면 순수 표시 항목으로 동작합니다. 시맨틱 역할은 `listitem`이며, 상호작용 스타일과 이벤트가 없습니다.

## Props

| Prop          | 타입         | 기본값  | 설명                                                               |
| ------------- | ------------ | ------- | ------------------------------------------------------------------ |
| `title`       | `string`     | —       | 제목 텍스트(필수)                                                  |
| `description` | `string`     | —       | 보조 설명 텍스트                                                   |
| `leading`     | `PingoNode`  | —       | 앞쪽 슬롯, 아바타나 아이콘을 배치합니다                            |
| `trailing`    | `PingoNode`  | —       | 뒤쪽 슬롯, 배지·스위치·화살표를 배치합니다                         |
| `selected`    | `boolean`    | —       | 선택 상태. 전달하면 `selected`/`unselected` 시맨틱 값을 노출합니다 |
| `disabled`    | `boolean`    | `false` | 비활성 상태. 어떤 이벤트 핸들러도 등록하지 않습니다                |
| `onPress`     | `() => void` | —       | 클릭 콜백. 전달하면 행이 상호작용 가능해집니다                     |
| `className`   | `string`     | —       | 컴포넌트 클래스 이름 뒤에 추가합니다                               |

## 접근성

상호작용 가능한 행은 `button` 시맨틱 역할을 가지며, 순수 표시 행은 `listitem`입니다. 접근성 이름은 `title`을 사용합니다. `selected`를 전달하면 `selected`/`unselected` 시맨틱 값을 노출합니다. 비활성 행은 어떤 포인터/키보드 핸들러도 가지지 않으므로 보조 기술에는 순수 정적 항목으로 표시됩니다.
