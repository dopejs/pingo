---
title: Breadcrumb
description: shadcn 스타일의 브레드크럼 내비게이션으로, 마지막 항목은 현재 페이지여서 클릭할 수 없으며 pingo canvas에 렌더링됩니다.
---

# Breadcrumb

브레드크럼 내비게이션: 마지막 항목을 제외한 모든 항목은 클릭 가능한 링크이며, 마지막 항목은 현재 페이지를 나타냅니다. 링크로 렌더링되지 않으며 보조 기술에 "현재 위치로 이동" 작업을 제공하지도 않습니다. 아래 미리보기는 pingo 엔진이 실시간으로 렌더링합니다. 이전 항목을 클릭하거나 키보드로 활성화할 수 있으며, 사이트 테마에 따라 밝은/어두운 모드가 전환됩니다.

:::preview breadcrumb-basic
:::

## 사용법

```tsx
import { createElement } from "@dopejs/pingo";
import { Breadcrumb } from "@dopejs/pingo-ui";

root.render(
  createElement(Breadcrumb, {
    items: [
      { label: "홈", onNavigate: () => navigate("/") },
      { label: "컴포넌트", onNavigate: () => navigate("/components") },
      { label: "Breadcrumb" }, // 마지막 항목은 현재 페이지이므로 onNavigate가 필요 없습니다
    ],
  }),
);
```

## 예시

### 사용자 지정 구분자

`separator` 기본값은 `/`이며, 임의의 텍스트 기호로 변경할 수 있습니다(아이콘 세트가 도입되기 전까지 구분자는 텍스트 글리프입니다):

:::preview breadcrumb-separator
:::

## Props

### BreadcrumbProps

| Prop        | 타입                        | 기본값 | 설명                                                          |
| ----------- | --------------------------- | ------ | ------------------------------------------------------------- |
| `items`     | `readonly BreadcrumbItem[]` | —      | 브레드크럼 항목. 마지막 항목은 현재 페이지로 간주합니다(필수) |
| `separator` | `string`                    | `"/"`  | 항목 사이의 구분자                                            |
| `className` | `string`                    | —      | 컴포넌트 클래스 이름 뒤에 추가합니다                          |

### BreadcrumbItem

| 필드         | 타입         | 기본값 | 설명                                                                                                                                       |
| ------------ | ------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `label`      | `string`     | —      | 항목 텍스트(필수)                                                                                                                          |
| `onNavigate` | `() => void` | —      | 클릭 콜백. 제공하지 않으면 해당 항목에 활성화 동작이 연결되지 않습니다(마지막 항목은 원래 현재 페이지로 간주하므로 제공할 필요가 없습니다) |

## 접근성

브레드크럼 전체는 `navigation` 의미 체계를 가지며 이름은 "breadcrumb"입니다. 클릭 가능한 항목은 link 의미 체계로, `Enter` / `Space` 키보드 활성화를 지원하며 클릭 전에 먼저 포커스됩니다. 현재 페이지는 순수 텍스트로 렌더링되고 `current` 의미 값을 가지므로, 스크린 리더는 이를 이동 가능한 링크로 취급하지 않습니다. 자세한 내용은 [접근성 가이드](/guide/accessibility)를 참조하십시오.
