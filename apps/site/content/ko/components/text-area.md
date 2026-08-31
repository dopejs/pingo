---
title: Text Area
description: 여러 줄 텍스트 입력란으로, pingo 편집 엔진에 의해 구동되며 canvas에 렌더링됩니다.
---

# Text Area

여러 줄 텍스트 입력으로, 비고, 소개 등 긴 내용에 사용합니다. 아래 미리보기는 pingo 엔진이 실시간으로 렌더링합니다. 클릭하면 실제로 여러 줄 텍스트를 입력할 수 있으며, 사이트 테마에 따라 밝은 화면과 어두운 화면이 전환됩니다.

:::preview text-area-basic
:::

## 사용법

```tsx
import { TextArea } from "@dopejs/pingo-ui";

root.render(
  <TextArea
    semanticLabel="개인 소개"
    width={360}
    rows={4}
    onValueChange={(value) => console.log(value)}
  />,
);
```

`rows`는 표시할 행 수를 결정하고 셸의 최소 높이를 고정합니다(`rows × 행 높이 + 위아래 안쪽 여백`). [Input](/components/input)과 마찬가지로 `TextArea`는 반드시 JSX를 사용하여 컴포넌트 형태로 마운트해야 합니다. 편집 세부 사항은 [텍스트 편집 가이드](/guide/editing)를 참조하십시오.

## 예제

### 비활성화

`disabled`를 전달하면 필드가 더 이상 입력을 받지 않으며 비활성화 스타일이 적용됩니다.

## Props

| Prop            | 타입                                     | 기본값  | 설명                                                        |
| --------------- | ---------------------------------------- | ------- | ----------------------------------------------------------- |
| `value`         | `string`                                 | `""`    | 비제어 방식의 초기값. `controller`를 설정하면 무시됩니다    |
| `onValueChange` | `(value: string) => void`                | —       | 편집 트랜잭션이 적용될 때마다 최신 값을 콜백합니다          |
| `controller`    | `TextEditingController`                  | —       | 고급 이스케이프 해치: 호출자가 보유하는 영속 컨트롤러입니다 |
| `onTransaction` | `(transaction: EditTransaction) => void` | —       | 편집 트랜잭션마다 발생하는 원시 콜백입니다                  |
| `onSubmit`      | `() => void`                             | —       | 제출 콜백입니다                                             |
| `disabled`      | `boolean`                                | `false` | 비활성화 상태입니다                                         |
| `readOnly`      | `boolean`                                | `false` | 읽기 전용 상태입니다                                        |
| `rows`          | `number`                                 | —       | 표시할 행 수로, 셸의 최소 높이를 결정합니다                 |
| `className`     | `string`                                 | —       | 컴포넌트 클래스 이름 뒤에 추가됩니다                        |
| `width`         | `number`                                 | —       | 고정 너비(px)입니다                                         |
| `semanticLabel` | `string`                                 | —       | 접근성 이름입니다                                           |

## 접근성

`semanticLabel`을 통해 필드 이름을 제공합니다. `disabled`와 `readOnly` 모두 필드가 편집 시퀀스에서 빠지도록 합니다. Input과 알려진 공백을 공유합니다. 현재 자리표시자 텍스트와 포커스 링 스타일이 없습니다.
