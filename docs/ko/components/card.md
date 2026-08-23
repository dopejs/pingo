---
title: Card
description: "조합형 카드 컨테이너: Header, Title, Description, Content, Footer를 pingo 캔버스에 렌더링합니다."
---

# Card

카드는 관련 콘텐츠를 테두리와 그림자가 있는 컨테이너에 모아 주며, 조합 가능한 여섯 개의 슬롯으로 구성됩니다. 아래 미리보기는 pingo 엔진이 실시간으로 렌더링하며 사이트 테마에 따라 밝기와 어둡기가 전환됩니다.

:::preview card-basic
:::

## 사용법

```tsx
import { createElement } from "@dopejs/pingo";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@dopejs/pingo-ui";

root.render(
  createElement(Card, {
    children: [
      createElement(CardHeader, {
        children: [
          createElement(CardTitle, { children: "계정 설정" }),
          createElement(CardDescription, { children: "계정 환경설정과 알림을 관리합니다." }),
        ],
      }),
      createElement(CardContent, {
        children: createElement("text", { value: "카드 본문 내용입니다." }),
      }),
      createElement(CardFooter, {
        children: createElement(Button, { children: "저장", onPress: () => {} }),
      }),
    ],
  }),
);
```

모든 슬롯은 선택 사항이므로 필요한 부분만 조합하면 됩니다. 슬롯 콘텐츠는 어떠한 래핑도 없이 그대로 전달됩니다.

## Props

`Card`, `CardHeader`, `CardContent`, `CardFooter`는 컨테이너형 props를 받습니다.

| Prop        | 유형        | 기본값 | 설명                           |
| ----------- | ----------- | ------ | ------------------------------ |
| `children`  | `PingoNode` | —      | 슬롯 콘텐츠 (필수)             |
| `className` | `string`    | —      | 컴포넌트 클래스 이름 뒤에 추가 |

`CardTitle`, `CardDescription`은 텍스트형 props를 받습니다.

| Prop        | 유형     | 기본값 | 설명                           |
| ----------- | -------- | ------ | ------------------------------ |
| `children`  | `string` | —      | 텍스트 콘텐츠 (필수)           |
| `className` | `string` | —      | 컴포넌트 클래스 이름 뒤에 추가 |

## 접근성

Card는 순수한 시각적 컨테이너이므로 추가적인 시맨틱을 도입하지 않습니다. 카드의 접근 가능한 이름과 구조는 내부에 배치된 제목, 버튼 등의 컴포넌트가 담당합니다. 제목과 본문의 색상은 카드의 전경색을 상속받아 밝은 테마와 어두운 테마 모두에서 대비를 유지합니다.
