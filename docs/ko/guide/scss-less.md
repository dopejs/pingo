---
title: SCSS / Less
description: SCSS 또는 Less로 pingo 스타일시트 작성하기——빌드 타임 컴파일 파이프라인, Vite 플러그인, 보안 경계와 오류 진단.
---

# SCSS / Less

pingo의 CSS subset([스타일 가이드](/ko/guide/styling) 참조)는 런타임에 CSS 텍스트나 객체만 받습니다.
변수, mixin, `@use` / import 같은 작성자 경험을 원하면 **빌드 타임 컴파일**을 사용합니다. SCSS/Less는
Node 쪽에서 `@dopejs/pingo-style-preprocess`가 CSS로 컴파일하고, 기존 `compileStyleSheet`로 검증한 뒤,
`PingoStyleSheet`를 기본 export하는 JavaScript 모듈을 생성합니다.

**Sass와 Less는 브라우저 bundle, facade, Core 어디에도 들어가지 않습니다**——런타임에는 프리프로세서가
없고 원래 있던 경량 CSS 컴파일러만 있습니다. subset 경계도 넓어지지 않습니다. 후손 셀렉터, `@media`,
`var()`, `calc()`, `em/rem/vw/vh` 등은 여전히 기존 진단대로 거부되며, 조용히 통과시키는 대신 빌드가
실패합니다.

## 두 가지 import 의미는 반드시 구분해야 합니다

### 일반 DOM 스타일(Vite 네이티브)

```ts
import "./site.scss";
import "./probe.less";
```

이 경로는 Vite에 내장된 CSS 전처리 능력으로, 출력은 **DOM CSS**이며 Vite가 주입하거나 추출합니다.
문서 사이트, Storybook 셸 같은 DOM 페이지에만 적용되고 **`PingoStyleSheet`를 만들지 않습니다**.
canvas 안의 스타일에 사용하지 마십시오.

### pingo 스타일시트(`?pingo-style`)

```ts
import { createHostedCanvasRoot } from "@dopejs/pingo";
import buttonSheet from "./button.scss?pingo-style";
import themeSheet from "./theme.less?pingo-style";

const root = await createHostedCanvasRoot(canvas, {
  styleSheets: [buttonSheet, themeSheet],
});
```

`?pingo-style`은 명시적인 타입 경계입니다. 빌드 타임에 먼저 전처리한 뒤 CSS subset으로 검증하고,
생성된 ESM 모듈은 `PingoStyleSheet`를 기본 export하며 **DOM에 어떤 CSS도 주입하지 않습니다**.

## Vite 플러그인

Node 전용 도구 패키지를 설치합니다(Node >= 22.12, Vite ^8 필요).

```sh
pnpm add -D @dopejs/pingo-style-preprocess
```

`vite.config.ts`에 등록합니다.

```ts
import { pingoStylePreprocess } from "@dopejs/pingo-style-preprocess/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    pingoStylePreprocess({
      // 선택: 추가 Sass load paths / Less paths
      scssLoadPaths: ["styles"],
      lessPaths: ["styles"],
      // 선택: 의존 파일은 반드시 이 디렉터리 안에 있어야 합니다(기본값은 entry가 있는 디렉터리와 load paths뿐)
      allowRoots: ["src", "styles"],
    }),
  ],
});
```

타입 선언은 패키지의 `./client` 엔트리가 제공하며, `tsconfig.json`에서 한 번만 참조하면 됩니다.

```json
{
  "compilerOptions": {
    "types": ["@dopejs/pingo-style-preprocess/client"]
  }
}
```

플러그인의 동작 규칙:

- 정확한 query flag `pingo-style`과 `.scss` / `.less` 확장자만 매치하며, 나머지 파일에는 영향이 없습니다.
- virtual module로 Vite 네이티브 CSS pipeline과 격리되어, 중복 전처리나 DOM CSS 주입이 일어나지 않습니다.
- entry와 모든 partial/import가 watch graph에 들어갑니다——**token이나 mixin을 고치면 HMR과 프로덕션
  재빌드가 일어나며** 캐시를 수동으로 지울 필요가 없습니다.
- error급 진단이 하나라도 있으면 빌드가 실패로 닫히고, warning은 소스 위치와 함께 출력됩니다. HMR 컴파일이
  실패하면 마지막으로 커밋된 모듈을 유지하고 dev server에 오류를 표시합니다.
- 생성된 모듈은 초기화 시 `CSS_SUBSET_VERSION`을 검증합니다. 런타임 facade와 빌드 타임 검증이 사용한
  subset 버전이 다르면 모듈 로딩 즉시 예외를 던져, 두 가지 의미가 섞여 도는 것을 허용하지 않습니다.
- dev, production, SSR 세 환경에서 의미가 일치하는 스타일시트를 생성합니다.

## Node 컴파일 API

Vite가 아닌 빌드 시스템(CLI, codegen)은 Node API를 직접 쓸 수 있습니다.

```ts
import {
  compileLessString,
  compilePingoStyleFile,
  compileScssString,
  createStyleSheetFromLess,
  createStyleSheetFromScss,
} from "@dopejs/pingo-style-preprocess";
```

- `compileScssString(source, options)`: 동기이므로 **import가 없는 소스만 처리합니다**. import가 있으면
  `file-api-required` 진단을 돌려줍니다.
- `compileLessString(source, options)`: 비동기(Less의 `render`가 Promise). 절대 경로의 `sourceName`을
  제공해야 상대 import를 해석합니다.
- `compilePingoStyleFile(filename, options)`: 비동기 파일 API. Vite 플러그인도 이것을 사용하며, 상대 해석
  기준이 명확하고 의존 그래프가 완전합니다.
- `compile*` 계열은 작성자 입력 오류에 **예외를 던지지 않고** `styleSheet: null`과 안정 정렬된 diagnostics를
  돌려줍니다. `createStyleSheetFromScss` / `createStyleSheetFromLess`는 예외를 던지는 편의 래퍼로,
  작성자 오류를 모두 `StylePreprocessError`로 던지면서 diagnostics 전체를 보존합니다.

돌려주는 `StylePreprocessResult`에는 `cssText`, `styleSheet`, `diagnostics`와 `dependencies`(완전한 의존
파일 목록, 자체 watch 구축에 사용 가능)가 들어 있습니다.

## Source map과 오류 진단

모든 진단은 단계 표시를 가집니다.

| `stage`       | 출처                                                  |
| ------------- | ----------------------------------------------------- |
| `"scss"`      | Sass 컴파일 예외(문법 오류, 정의되지 않은 변수 등)    |
| `"less"`      | Less 컴파일 rejection                                 |
| `"pingo-css"` | 결과물이 CSS subset을 벗어난 `compileStyleSheet` 진단 |

두 컴파일러 모두 source map을 켜고, pingo CSS 진단의 생성 위치는 **최선을 다해 원래 SCSS/Less 파일과
행·열로 매핑합니다**(`sourceLocation`). 매핑할 수 없을 때는 생성 위치(`generatedLocation`)와 entry 이름을
유지하며 원래 위치를 꾸며내지 않습니다. 진단은 생성 위치와 code로 안정 정렬되어 CI 출력과 snapshot을
재현할 수 있습니다.

## 보안 경계

프리프로세서는 빌드 타임에 작성자 코드를 실행하므로 기본값을 조여 둡니다.

- **Sass**: custom importer, custom function, Node package importer를 열지 않습니다. `file:` 의존만
  받습니다.
- **Less**: `javascriptEnabled: false`로 고정하고 plugins를 넘기지 않으며, 사전 스캔으로 `@plugin`을
  거부합니다. HTTP(S) 또는 프로토콜 상대 import도 허용하지 않습니다.
- **공통 제한**: 의존 파일은 canonicalize 후 allow roots(entry가 있는 디렉터리 + 명시적 load paths) 안에
  있어야 합니다. symlink 탈출, 파일이 아닌 의존, 원격 의존은 모두 거부합니다. 컴파일된 CSS는 subset 검증에
  들어가기 전에 1,048,576 code-unit 상한을 먼저 통과해야 합니다. entry, 의존 개수, 의존 총 바이트에도 명시적
  예산이 있으며 초과하면 안정적인 빌드 오류가 발생합니다.
- 컴파일러 버전은 lockfile로 고정하고, fixture의 CSS, diagnostics, 의존 목록을 reproducibility snapshot으로
  관리합니다. Sass/Less를 업그레이드하려면 출력 차이를 명시적으로 심사해야 합니다.

이 제한은 `?pingo-style` 도구 체인만 묶습니다. 일반 DOM용 `.scss` / `.less`는 여전히 Vite 자체 설정을
따릅니다.

## 색상 함수

프리프로세서는 색상 함수를 자주 출력하므로, subset은 이를 위해 `rgb()` / `rgba()` / `hsl()` / `hsla()`를
지원합니다(legacy 쉼표 형식과 modern space/slash 형식 모두). 모두 8-bit RGBA로 통일됩니다. 이 집합을
벗어난 출력——`color(display-p3 ...)`, CSS 사용자 정의 속성, `calc()`——은 계속 빌드 실패입니다.
