---
title: Toast
description: 모서리에 표시되는 가벼운 알림으로, ToastViewport가 담당하며 pingo canvas에 렌더링됩니다.
---

# Toast

Toast는 모서리에 잠깐 나타나는 가벼운 알림으로, 저장 성공, 동기화 실패 등 즉각적인 피드백에 적합합니다. 아래 미리보기는 pingo 엔진이 실시간으로 렌더링합니다. 버튼을 클릭하면 toast 하나가 표시되며, 사이트 테마에 따라 밝은 모드와 어두운 모드가 전환됩니다.

:::preview toast-basic
:::

## 사용법

Toast는 `ToastViewport`와 함께 사용해야 합니다. 뷰포트는 절대 위치로 배치된 모서리 컨테이너(기본값: 오른쪽 위)이며, **반드시 루트에 가까운 컨테이너 아래에 배치해야 합니다**. 본 엔진의 포함 블록은 가장 가까운 positioned 조상이 아니라 부모 노드이므로, 작은 컨테이너 안에 배치하면 해당 작은 컨테이너만 덮게 됩니다.

```tsx
import { Button, Toast, ToastViewport } from "@dopejs/pingo-ui";

let open = false;

function scene() {
  return (
    <container width={surfaceWidth} height={surfaceHeight}>
      <Button
        onPress={() => {
          open = true;
          root.render(scene());
        }}
      >
        저장
      </Button>
      <ToastViewport>
        <Toast open={open} title="저장됨" description="구성이 로컬에 기록되었습니다." />
      </ToastViewport>
    </container>
  );
}
```

표시/숨김, 자동 닫힘 시점은 애플리케이션이 직접 제어합니다. `open`을 전환하고 다시 `root.render(...)`를 호출하면 됩니다. 미리보기의 버튼도 이 방식을 사용합니다.

## 예시

### 변형

`variant="destructive"`는 실패 알림에 사용합니다. 이때 설명 텍스트에는 약화된 전경색을 더 이상 사용하지 않습니다. 파괴적 배경이 이미 전경을 반전시켰기 때문에, 여기서 다시 약화하면 빨간 배경에 회색 글자가 되어 버립니다.

:::preview toast-variants
:::

## Props

### Toast

| Prop          | 타입                         | 기본값      | 설명                                               |
| ------------- | ---------------------------- | ----------- | -------------------------------------------------- |
| `open`        | `boolean`                    | —           | 표시 여부. `false`이면 `null`로 렌더링됩니다(필수) |
| `title`       | `string`                     | —           | 제목(필수)                                         |
| `description` | `string`                     | —           | 설명 본문. 생략하면 설명 행이 렌더링되지 않습니다  |
| `variant`     | `"default" \| "destructive"` | `"default"` | 시각적 변형                                        |
| `className`   | `string`                     | —           | 컴포넌트 클래스 이름 뒤에 추가됩니다               |

### ToastViewport

| Prop        | 타입        | 기본값 | 설명                                                                            |
| ----------- | ----------- | ------ | ------------------------------------------------------------------------------- |
| `children`  | `PingoNode` | —      | 뷰포트 안의 toast 목록입니다. 여러 개일 경우 8px 간격으로 세로로 쌓입니다(필수) |
| `className` | `string`    | —      | 컴포넌트 클래스 이름 뒤에 추가됩니다                                            |

## 접근성

Toast는 `status` 시맨틱 역할을 가지므로, 보조 기술이 이를 상태 메시지로 읽어 줍니다. toast는 현재 포커스를 방해하지 않습니다. 중요한 작업의 결과는 페이지에 지속적인 피드백(예: `Alert`)으로도 함께 남겨 두어야 합니다.
