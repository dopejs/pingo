---
title: Combobox
description: 검색 가능한 드롭다운 선택기로, 입력으로 옵션 목록을 필터링하며 pingo 캔버스에 렌더링합니다.
---

# Combobox

콤보박스는 선택된 값을 표시하는 트리거와 검색 가능한 옵션 목록을 하나로 묶습니다. 아래 미리보기는 pingo 엔진이 실시간으로 렌더링합니다. 목록이 펼쳐져 있어 입력으로 필터링하고, 방향키로 선택하며, 사이트 테마에 따라 밝고 어두운 모드가 전환됩니다.

:::preview combobox-basic
:::

## 사용법

```tsx
import { Combobox } from "@dopejs/pingo-ui";

root.render(
  <Combobox
    items={[
      { value: "next", label: "Next.js" },
      { value: "remix", label: "Remix" },
      { value: "astro", label: "Astro" },
    ]}
    placeholder="프레임워크 선택"
    onValueChange={(value) => console.log(value)}
  />,
);
```

`items`는 `{ value, label }` 배열입니다. 필터링은 `label`에 대한 대소문자 구분 없는 부분 문자열 매칭입니다. 일부러 퍼지 정렬은 하지 않습니다. 잘못된 정렬은 정렬을 하지 않는 것보다 더 나쁘기 때문입니다. 선택 후 목록은 자동으로 접히며, 쿼리어는 **닫힐 때** 비워져 다시 열 때 이미 잊어버린 필터어와 마주하지 않도록 합니다.

## 예제

### 제어 방식

`value` / `onValueChange`와 `open` / `onOpenChange`는 모두 제어할 수 있습니다. 생략하면 컴포넌트가 `defaultValue` / `defaultOpen`으로 자체 상태를 유지합니다.

### 빈 상태

`emptyLabel`로 필터 결과가 없을 때의 안내 문구를 지정합니다.

## Props

| Prop            | 타입                                          | 기본값         | 설명                                  |
| --------------- | --------------------------------------------- | -------------- | ------------------------------------- |
| `items`         | `readonly { value: string; label: string }[]` | —              | 옵션 목록(필수)                       |
| `value`         | `string`                                      | —              | 제어되는 선택 값                      |
| `defaultValue`  | `string`                                      | —              | 비제어 초기 선택 값                   |
| `onValueChange` | `(value: string) => void`                     | —              | 선택 변경 콜백(선택 후 자동으로 접힘) |
| `open`          | `boolean`                                     | —              | 제어되는 열림/닫힘                    |
| `defaultOpen`   | `boolean`                                     | `false`        | 비제어 초기 열림/닫힘                 |
| `onOpenChange`  | `(open: boolean) => void`                     | —              | 열림/닫힘 콜백                        |
| `placeholder`   | `string`                                      | `"선택하세요"` | 미선택 시 트리거의 플레이스홀더 문구  |
| `emptyLabel`    | `string`                                      | —              | 필터 결과가 없을 때의 안내 문구       |
| `className`     | `string`                                      | —              | 컴포넌트 클래스명 뒤에 추가           |

## 접근성

트리거는 button 시맨틱을 가지며 `expanded` / `collapsed` 상태를 전환합니다. 목록이 열리면 포커스가 검색창으로 이동하고, 방향키로 하이라이트를 움직이며, 엔터로 선택하고 닫습니다. 닫힌 후에는 포커스가 트리거로 돌아갑니다.
