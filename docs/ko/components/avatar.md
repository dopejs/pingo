---
title: Avatar
description: 원형 아바타로, 이미지가 없으면 이니셜로 대체되어 pingo 캔버스에 렌더링합니다.
---

# Avatar

Avatar는 사용자 아바타를 표시합니다. 디코딩된 이미지 리소스를 전달하면 원형으로 잘라 표시하고, 전달하지 않으면 `fallback` 이니셜로 대체합니다. 아래 미리보기는 pingo 엔진이 실시간으로 렌더링하며 사이트 테마에 따라 밝은 모드와 어두운 모드가 전환됩니다.

:::preview avatar-basic
:::

## 사용법

```tsx
import { createElement } from "@dopejs/pingo";
import { Avatar } from "@dopejs/pingo-ui";

root.render(createElement(Avatar, { fallback: "张" }));
```

이미지가 있으면 미리 디코딩된 `PingoImage` 리소스를 전달합니다. 이미지는 `object-fit: cover`로 채워지고 원형으로 잘립니다.

```tsx
createElement(Avatar, { image: decodedImage, fallback: "张" });
```

## 예제

### 크기

`size`는 정사각형 한 변의 길이(px)이며, 동시에 둥근 모서리를 `size / 2`로 설정합니다. 생략하면 스킨 기본값인 40px를 사용합니다. 미리보기에는 순서대로 32, 기본값, 56이 표시됩니다.

```tsx
createElement(Avatar, { fallback: "李", size: 32 });
```

## Props

| Prop        | 타입         | 기본값         | 설명                                                                      |
| ----------- | ------------ | -------------- | ------------------------------------------------------------------------- |
| `image`     | `PingoImage` | —              | 미리 디코딩된 이미지 리소스입니다. 없으면 `fallback` 이니셜을 표시합니다. |
| `fallback`  | `string`     | —              | 이미지가 없을 때 표시할 이니셜 텍스트입니다(필수).                        |
| `size`      | `number`     | 스킨 기본 `40` | 정사각형 한 변의 길이(px)입니다.                                          |
| `className` | `string`     | —              | 컴포넌트 클래스 이름 뒤에 추가로 붙습니다.                                |

## 접근성

`fallback` 이니셜은 접근 가능한 이름의 역할도 함께 수행합니다. 사용자를 대표할 수 있는 문자(예: 성 또는 이름의 첫 글자)를 사용하고, 자리 표시 기호는 전달하지 마십시오.
