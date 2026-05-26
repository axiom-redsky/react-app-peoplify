# 디자인 시스템 구현 플랜 (primitive/semantic 2계층)

## Context

현재 `app.css`(136줄)와 `layout/default/layout.css`(787줄)에 토큰·테마·유틸이 혼재되어 있다.
`layout.css` 첫 줄 주석에도 "분리하는 게 좋다"고 명시되어 있다.

프로젝트는 이미 다크모드를 지원하므로 **primitive/semantic 2계층이 필수**다.
1계층(단일 파일)으로 구성하면 다크모드 전환 시 토큰 값을 모두 재정의해야 한다.
2계층으로 나누면 semantic 파일만 교체하여 테마를 전환할 수 있다.

### 토큰 파이프라인 흐름

```
Figma Variables / Tokens Studio (추후 연동 가능)
         ↓
src/design-tokens/
  primitive/*.json   ← W3C DTCG 원시값 (hex, px 등)
  semantic/
    light.json       ← primitive 참조, 라이트 시맨틱
    dark.json        ← primitive 참조, 다크 시맨틱
         ↓  npm run build:tokens
src/assets/styles/tokens/
  primitive.css      ← @theme { --color-brand-500: #465fff; ... }  [generated]
  theme-light.css    ← :root { --color-primary: var(--color-brand-500); ... }  [generated]
  theme-dark.css     ← .dark { --color-primary: var(--color-brand-400); ... }  [generated]
src/design-tokens/types.ts   ← TypeScript 타입  [generated] (소스 JSON과 동일 디렉터리)
         ↓
Tailwind v4 유틸 + shadcn CSS vars + 개발자 코드에서 사용
```

**핵심 원칙:** 토큰 값은 JSON에서만 수정. generated 파일은 직접 편집 금지.

---

## 최종 디렉토리 구조

```
src/
├── design-tokens/                   ← (신규) 토큰 소스 — W3C DTCG JSON
│   ├── primitive/
│   │   ├── color.json               ← raw hex 팔레트 (brand, gray, success 등)
│   │   ├── typography.json          ← 폰트 크기·브레이크포인트 raw 값
│   │   ├── shadow.json              ← 그림자 raw 값
│   │   └── spacing.json             ← z-index raw 값
│   ├── semantic/
│   │   ├── light.json               ← primitive 참조, 라이트 시맨틱
│   │   └── dark.json                ← primitive 참조, 다크 시맨틱
│   ├── style-dictionary.config.js
│   └── types.ts                         ← (신규, ⚠ 자동생성) 토큰 TS 타입
│
├── assets/styles/
│   ├── tokens/                      ← (신규, ⚠ 자동생성 — 직접 편집 금지)
│   │   ├── primitive.css            ← @theme { --color-brand-500: #465fff; ... }
│   │   ├── theme-light.css          ← :root { --color-primary: ...; ... }
│   │   └── theme-dark.css           ← .dark { --color-primary: ...; ... }
│   ├── themes/                      ← (신규) shadcn 시맨틱 + Tailwind 브리지
│   │   ├── theme-default.css        ← :root/.dark OKLch shadcn vars + @theme inline
│   │   └── theme-example-project.css ← 브랜드 override 예시 템플릿
│   ├── base/                        ← (신규) 전역 초기화·유틸
│   │   ├── reset.css
│   │   ├── typography.css
│   │   ├── layout.css               ← 빈 파일 (향후 전역 레이아웃 헬퍼)
│   │   └── utilities.css
│   ├── layout/default/layout.css    ← 기존, 서드파티 오버라이드만 남김
│   └── app.css                      ← @import 진입점으로 리팩토링
│
└── publishing/                      ← (신규) 퍼블리셔 React 컴포넌트 스테이징
    ├── README.md
    ├── templates/
    │   └── example/
    │       ├── ExamplePage.tsx              ← React 페이지 컴포넌트
    │       └── ExamplePage.stories.tsx      ← Storybook 스토리 (팀 프리뷰)
    └── components/
        └── example/
            ├── ExampleCard.tsx              ← React UI 컴포넌트, Tailwind 유틸 사용
            └── ExampleCard.stories.tsx      ← Storybook 스토리
```

---

## 구현 단계

### Phase 1 — Style Dictionary 설치 및 토큰 JSON 작성

**1-1. 패키지 설치**
```bash
npm install -D style-dictionary
```

**1-2. `src/design-tokens/primitive/color.json`** — raw hex 팔레트

`layout.css @theme {}` 블록의 `--color-*` 값을 W3C DTCG 형식으로 이관:
```json
{
  "color": {
    "brand": {
      "25":  { "$value": "#f2f7ff", "$type": "color" },
      "50":  { "$value": "#ecf3ff", "$type": "color" },
      "100": { "$value": "#dde9ff", "$type": "color" },
      "200": { "$value": "#c2d6ff", "$type": "color" },
      "300": { "$value": "#9cb9ff", "$type": "color" },
      "400": { "$value": "#7592ff", "$type": "color" },
      "500": { "$value": "#465fff", "$type": "color" },
      "600": { "$value": "#3641f5", "$type": "color" },
      "700": { "$value": "#2a31d8", "$type": "color" },
      "800": { "$value": "#252dae", "$type": "color" },
      "900": { "$value": "#262e89", "$type": "color" },
      "950": { "$value": "#161950", "$type": "color" }
    },
    "gray": { "...": "gray-25 ~ gray-950 + gray-dark 이관" },
    "blue-light": { "...": "blue-light-25 ~ blue-light-950 이관" },
    "orange": { "...": "orange-25 ~ orange-950 이관" },
    "success": { "...": "success-25 ~ success-950 이관" },
    "error": { "...": "error-25 ~ error-950 이관" },
    "warning": { "...": "warning-25 ~ warning-950 이관" },
    "theme-pink": { "500": { "$value": "#ee46bc", "$type": "color" } },
    "theme-purple": { "500": { "$value": "#7a5af8", "$type": "color" } },
    "white": { "$value": "#ffffff", "$type": "color" },
    "black": { "$value": "#101828", "$type": "color" }
  }
}
```

**1-3. `src/design-tokens/primitive/typography.json`**

`layout.css @theme {}` 블록의 font/breakpoint/text 값 이관:
```json
{
  "font": {
    "outfit": { "$value": "Outfit, sans-serif", "$type": "fontFamily" }
  },
  "breakpoint": {
    "2xsm": { "$value": "375px", "$type": "dimension" },
    "xsm":  { "$value": "425px", "$type": "dimension" },
    "sm":   { "$value": "640px", "$type": "dimension" },
    "md":   { "$value": "768px", "$type": "dimension" },
    "lg":   { "$value": "1024px", "$type": "dimension" },
    "xl":   { "$value": "1280px", "$type": "dimension" },
    "2xl":  { "$value": "1536px", "$type": "dimension" },
    "3xl":  { "$value": "2000px", "$type": "dimension" }
  },
  "text": {
    "title": {
      "2xl": { "$value": "72px", "$type": "dimension" },
      "xl":  { "$value": "60px", "$type": "dimension" },
      "lg":  { "$value": "48px", "$type": "dimension" },
      "md":  { "$value": "36px", "$type": "dimension" },
      "sm":  { "$value": "30px", "$type": "dimension" }
    },
    "theme": {
      "xl": { "$value": "20px", "$type": "dimension" },
      "sm": { "$value": "14px", "$type": "dimension" },
      "xs": { "$value": "12px", "$type": "dimension" }
    }
  }
}
```

**1-4. `src/design-tokens/primitive/shadow.json`**

`layout.css @theme {}` 블록의 `--shadow-*` 값 이관:
```json
{
  "shadow": {
    "theme": {
      "xs": { "$value": "0px 1px 2px 0px rgba(16,24,40,0.05)", "$type": "shadow" },
      "sm": { "$value": "0px 1px 3px 0px rgba(16,24,40,0.1), 0px 1px 2px 0px rgba(16,24,40,0.06)", "$type": "shadow" },
      "md": { "$value": "0px 4px 8px -2px rgba(16,24,40,0.1), 0px 2px 4px -2px rgba(16,24,40,0.06)", "$type": "shadow" },
      "lg": { "$value": "0px 12px 16px -4px rgba(16,24,40,0.08), 0px 4px 6px -2px rgba(16,24,40,0.03)", "$type": "shadow" },
      "xl": { "$value": "0px 20px 24px -4px rgba(16,24,40,0.08), 0px 8px 8px -4px rgba(16,24,40,0.03)", "$type": "shadow" }
    },
    "focus-ring": { "$value": "0px 0px 0px 4px rgba(70,95,255,0.12)", "$type": "shadow" },
    "slider-navigation": { "$value": "0px 1px 2px 0px rgba(16,24,40,0.1), 0px 1px 3px 0px rgba(16,24,40,0.1)", "$type": "shadow" },
    "tooltip": { "$value": "0px 4px 6px -2px rgba(16,24,40,0.05), -8px 0px 20px 8px rgba(16,24,40,0.05)", "$type": "shadow" }
  }
}
```

**1-5. `src/design-tokens/primitive/spacing.json`**

`layout.css @theme {}` 블록의 `--z-index-*` 값 이관:
```json
{
  "z-index": {
    "1":      { "$value": 1,      "$type": "number" },
    "9":      { "$value": 9,      "$type": "number" },
    "99":     { "$value": 99,     "$type": "number" },
    "999":    { "$value": 999,    "$type": "number" },
    "9999":   { "$value": 9999,   "$type": "number" },
    "99999":  { "$value": 99999,  "$type": "number" },
    "999999": { "$value": 999999, "$type": "number" }
  }
}
```

**1-6. `src/design-tokens/semantic/light.json`** — 라이트 시맨틱 (primitive 참조)

```json
{
  "color": {
    "primary":    { "$value": "{color.brand.500}",  "$type": "color" },
    "primary-lt": { "$value": "{color.brand.400}",  "$type": "color" },
    "accent":     { "$value": "{color.blue-light.500}", "$type": "color" },
    "success":    { "$value": "{color.success.500}", "$type": "color" },
    "error":      { "$value": "{color.error.500}",   "$type": "color" },
    "warning":    { "$value": "{color.warning.500}", "$type": "color" }
  }
}
```

**1-7. `src/design-tokens/semantic/dark.json`** — 다크 시맨틱 (밝은 shade 참조)

```json
{
  "color": {
    "primary":    { "$value": "{color.brand.400}",  "$type": "color" },
    "primary-lt": { "$value": "{color.brand.300}",  "$type": "color" },
    "accent":     { "$value": "{color.blue-light.400}", "$type": "color" },
    "success":    { "$value": "{color.success.400}", "$type": "color" },
    "error":      { "$value": "{color.error.400}",   "$type": "color" },
    "warning":    { "$value": "{color.warning.400}", "$type": "color" }
  }
}
```

**1-8. `src/design-tokens/style-dictionary.config.js`**

Tailwind v4 `@theme {}` 포매터와 `:root`/`.dark` 포매터를 모두 등록:

```js
import StyleDictionary from 'style-dictionary';

// Tailwind v4 @theme 블록 (primitive 토큰용)
StyleDictionary.registerFormat({
  name: 'css/tailwind-v4-theme',
  format: ({ dictionary }) => {
    const vars = dictionary.allTokens
      .map(t => `  ${t.name}: ${t.value};`)
      .join('\n');
    return `/* AUTO-GENERATED — do not edit manually */\n@theme {\n${vars}\n}\n`;
  },
});

// CSS :root 블록 (시맨틱 라이트용)
StyleDictionary.registerFormat({
  name: 'css/semantic-root',
  format: ({ dictionary }) => {
    const vars = dictionary.allTokens
      .map(t => `  ${t.name}: ${t.value};`)
      .join('\n');
    return `/* AUTO-GENERATED — do not edit manually */\n:root {\n${vars}\n}\n`;
  },
});

// CSS .dark 블록 (시맨틱 다크용)
StyleDictionary.registerFormat({
  name: 'css/semantic-dark',
  format: ({ dictionary }) => {
    const vars = dictionary.allTokens
      .map(t => `  ${t.name}: ${t.value};`)
      .join('\n');
    return `/* AUTO-GENERATED — do not edit manually */\n.dark {\n${vars}\n}\n`;
  },
});

// token path → CSS 변수명: color.brand.500 → --color-brand-500
StyleDictionary.registerTransform({
  name: 'name/css/kebab',
  type: 'name',
  transform: (token) =>
    '--' + token.path.join('-').toLowerCase().replace(/_/g, '-'),
});

export default {
  platforms: {
    // Primitive: @theme {} 블록
    css_primitive: {
      source: ['src/design-tokens/primitive/**/*.json'],
      transforms: ['name/css/kebab'],
      buildPath: 'src/assets/styles/tokens/',
      files: [
        {
          destination: 'primitive.css',
          format: 'css/tailwind-v4-theme',
        },
      ],
    },
    // Semantic light: :root {} 블록
    css_light: {
      source: ['src/design-tokens/primitive/**/*.json', 'src/design-tokens/semantic/light.json'],
      transforms: ['name/css/kebab'],
      buildPath: 'src/assets/styles/tokens/',
      files: [
        {
          destination: 'theme-light.css',
          format: 'css/semantic-root',
          filter: t => t.filePath.includes('semantic/light'),
        },
      ],
    },
    // Semantic dark: .dark {} 블록
    css_dark: {
      source: ['src/design-tokens/primitive/**/*.json', 'src/design-tokens/semantic/dark.json'],
      transforms: ['name/css/kebab'],
      buildPath: 'src/assets/styles/tokens/',
      files: [
        {
          destination: 'theme-dark.css',
          format: 'css/semantic-dark',
          filter: t => t.filePath.includes('semantic/dark'),
        },
      ],
    },
    // TypeScript 타입 선언 — 소스 JSON과 같은 디렉터리에 배치
    ts: {
      source: ['src/design-tokens/primitive/**/*.json'],
      transforms: ['name/css/kebab'],
      buildPath: 'src/design-tokens/',
      files: [{ destination: 'types.ts', format: 'typescript/es6-declarations' }],
    },
  },
};
```

**1-9. `package.json` 스크립트 추가**

```json
"scripts": {
  "build:tokens": "style-dictionary build --config src/design-tokens/style-dictionary.config.js",
  "dev": "npm run build:tokens && vite"
}
```

---

### Phase 2 — 테마 파일 생성 (shadcn 시맨틱 분리)

**`src/assets/styles/themes/theme-default.css`**

`app.css`의 `:root {}`, `.dark {}`, `@theme inline {}` 블록을 이 파일로 이동.
이 파일은 자동생성 대상 아님 — 직접 편집 허용.

```css
/*
 * theme-default.css — shadcn 시맨틱 테마 + Tailwind 브리지
 * 투입 시: 이 파일 복사 → theme-[project].css 로 브랜드 override
 */

@theme inline {
  --font-heading: var(--font-sans);
  --font-sans: 'Geist Variable', sans-serif;
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  /* ... app.css @theme inline 블록 전체 이동 */
}

:root {
  --background: oklch(1 0 0);
  --primary: oklch(0.205 0 0);
  /* ... app.css :root 블록 전체 이동 */
}

.dark {
  --background: oklch(0.145 0 0);
  /* ... app.css .dark 블록 전체 이동 */
}
```

**`src/assets/styles/themes/theme-example-project.css`**

투입 시 브랜드 색상 override 예시 (전체 주석 처리):
```css
/* 예시: 브랜드 primary를 토큰 값으로 교체 */
/* :root { */
/*   --primary: var(--color-brand-500);        */
/*   --primary-foreground: var(--color-white); */
/*   --ring: var(--color-brand-500);           */
/* } */
/* .dark { */
/*   --primary: var(--color-brand-400);        */
/* } */
```

---

### Phase 3 — 베이스 파일 생성 (layout.css 분리)

`layout/default/layout.css`에서 아래 섹션을 추출:

**`src/assets/styles/base/reset.css`**
- `@layer base` → `*`, `::after`, `::before`, `::backdrop`, `::file-selector-button` border-color 호환 리셋
- `button:not(:disabled)` cursor 규칙

**`src/assets/styles/base/typography.css`**
- `layout.css @layer base` body, html 규칙
- `body { @apply relative font-normal font-outfit z-1 bg-gray-50; }`

**`src/assets/styles/base/utilities.css`**
- `layout.css @utility` 블록 전체 (menu-item*, menu-dropdown-*, no-scrollbar, custom-scrollbar)
- `layout.css @layer utilities` (input date/time 브라우저 아이콘 제거)
- `tableCheckbox`, `taskCheckbox`, `.task` 컴포넌트 스타일 (서드파티 의존 없는 것만)

**`src/assets/styles/base/layout.css`**
- 빈 파일로 생성 (향후 전역 레이아웃 헬퍼 클래스용)

---

### Phase 4 — layout.css 정리

추출 후 `layout/default/layout.css`에 남기는 것:
- 서드파티 CSS 오버라이드 (ApexCharts, jVectorMap, Flatpickr, FullCalendar, Swiper, Simplebar)
- 파일 상단 주석 업데이트: "서드파티 라이브러리 오버라이드 전용"

제거 항목:
- `@theme {}` 블록 전체 (→ `tokens/primitive.css`로 이관됨)
- `@layer base {}` (→ `base/reset.css`, `base/typography.css`로 이관됨)
- `@utility` 블록 전체 (→ `base/utilities.css`로 이관됨)
- `@layer utilities {}` (→ `base/utilities.css`로 이관됨)

---

### Phase 5 — app.css 리팩토링 (@import 진입점)

```css
/* app.css — CSS 진입점. 선언 없이 @import만. */

/* 1. External */
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
@import 'tailwindcss';
@import 'tw-animate-css';
@import 'shadcn/tailwind.css';
@import '@fontsource-variable/geist';

/* 2. Design Tokens (Style Dictionary 자동생성) */
@import './tokens/primitive.css';
@import './tokens/theme-light.css';
@import './tokens/theme-dark.css';

/* 3. Theme (shadcn 시맨틱 vars + Tailwind 브리지) */
@import './themes/theme-default.css';
/* @import './themes/theme-[project].css'; ← 투입 시 주석 해제 */

/* 4. Base */
@import './base/reset.css';
@import './base/typography.css';
@import './base/layout.css';
@import './base/utilities.css';

/* 5. Layout (서드파티 오버라이드) */
@import './layout/default/layout.css';

/* @custom-variant은 반드시 루트 파일에 직접 선언 */
@custom-variant dark (&:is(.dark *));
```

수정 사항:
- `tw-animate-css` 중복 import 제거 (현재 app.css에 2번 있음)
- `@theme inline {}`, `:root {}`, `.dark {}`, `@layer base {}` 블록 삭제 (→ themes/, base/로 이관됨)

---

### Phase 6 — 퍼블리싱 폴더 신설

**역할:**
- `src/publishing/` = 퍼블리셔가 디자인 토큰을 활용해 React 컴포넌트를 작성하는 스테이징 공간
- Vite 번들 포함 (React 컴포넌트이므로), 단 React Router 등록은 하지 않음
- 팀 프리뷰·공유는 **Storybook 스토리**로 처리 — 별도 라우터 불필요
- 핸드오프 완료 시 `src/domains/[name]/` 또는 `src/shared/`로 이동

**컨벤션 규칙:**
- 스타일: raw CSS 파일 없음. Tailwind 유틸리티 클래스 + `cn()` 사용
- 컴포넌트: `.tsx` 파일, 프로젝트 컨벤션과 동일한 방식으로 작성
- import alias: `@/` 경로 사용 (`@/assets/styles/...` 등)

```
src/publishing/
├── README.md
├── templates/
│   └── example/
│       ├── ExamplePage.tsx          ← React 페이지 컴포넌트 (Tailwind 유틸 사용)
│       └── ExamplePage.stories.tsx  ← Storybook 스토리 (팀 프리뷰)
└── components/
    └── example/
        ├── ExampleCard.tsx          ← React UI 컴포넌트 (Tailwind 유틸 + cn() 사용)
        └── ExampleCard.stories.tsx  ← Storybook 스토리
```

`README.md` 핵심 내용:
1. 역할: React 컴포넌트 스테이징 공간. 핸드오프 완료 후 `src/domains/[name]/` 또는 `src/shared/`로 이동
2. 스타일 규칙: Tailwind 유틸리티 + `cn()`. CSS 파일 생성 금지
3. 토큰 클래스 참조: Storybook `Getting Started/Design Tokens` 링크
4. 토큰 변경 요청: JSON 수정 후 `npm run build:tokens`
5. 핸드오프 기준: `templates/` → `src/domains/[name]/pages/`, `components/` → `src/shared/` 또는 `src/domains/[name]/components/`

---

### Phase 7 — Storybook 디자인 토큰 문서

**`src/__stories__/_docs/DesignTokens.stories.tsx`** 생성

4개 Story:
1. `Colors` — `getComputedStyle`로 런타임 CSS var 읽어 팔레트 스와치 렌더링
2. `Typography` — 타이포 스케일 테이블 (title-2xl~sm, theme-xl/sm/xs)
3. `Shadows` — 그림자 예시 박스 (theme-xs ~ theme-xl)
4. `Spacing` — z-index 스케일 다이어그램

**`.storybook/preview.ts` storySort 업데이트:**
```ts
order: ['Getting Started', ['소개', 'Design Tokens'], 'UI Components', [...], 'Functions', '*']
```

---

## 수정되는 기존 파일

| 파일 | 변경 내용 |
|------|-----------|
| `src/assets/styles/app.css` | @import manifest로 교체, tw-animate-css 중복 제거, 블록들 각 파일로 이관 |
| `src/assets/styles/layout/default/layout.css` | @theme, @layer base, @utility 블록 제거 → 서드파티 오버라이드만 남김 |
| `package.json` | `build:tokens`, `dev` 스크립트 추가 |
| `.storybook/preview.ts` | storySort에 'Design Tokens' 추가 |

---

## 신규 생성 파일

```
# Token Sources (수동 편집)
src/design-tokens/primitive/color.json
src/design-tokens/primitive/typography.json
src/design-tokens/primitive/shadow.json
src/design-tokens/primitive/spacing.json
src/design-tokens/semantic/light.json
src/design-tokens/semantic/dark.json
src/design-tokens/style-dictionary.config.js

# Generated (⚠ 직접 편집 금지)
src/assets/styles/tokens/primitive.css
src/assets/styles/tokens/theme-light.css
src/assets/styles/tokens/theme-dark.css
src/design-tokens/types.ts             ← 소스 JSON과 같은 디렉터리에 배치

# Theme (수동 편집)
src/assets/styles/themes/theme-default.css
src/assets/styles/themes/theme-example-project.css

# Base (수동 편집)
src/assets/styles/base/reset.css
src/assets/styles/base/typography.css
src/assets/styles/base/layout.css
src/assets/styles/base/utilities.css

# Publishing (React 컴포넌트 + Storybook 스토리)
src/publishing/README.md
src/publishing/templates/example/ExamplePage.tsx
src/publishing/templates/example/ExamplePage.stories.tsx
src/publishing/components/example/ExampleCard.tsx
src/publishing/components/example/ExampleCard.stories.tsx

# Storybook
src/__stories__/_docs/DesignTokens.stories.tsx
```

---

## Figma 연동 (선택, 추후)

2계층 구조가 완성되면 Figma Variables → 코드 파이프라인 연동이 가능:
```
Figma Variables Collection
  ├── Primitives Collection    →  primitive/*.json (덮어쓰기)
  ├── Semantic - Light Mode    →  semantic/light.json
  └── Semantic - Dark Mode     →  semantic/dark.json
```
Tokens Studio 플러그인 export → `npm run build:tokens` → PR 생성

---

## 검증 방법

1. `npm run build:tokens` → `src/assets/styles/tokens/` 3개 CSS 파일 생성 확인
2. `npm run dev` → 기존 페이지 렌더링 정상 확인 (색상·레이아웃 깨짐 없음)
3. DevTools: `getComputedStyle(document.documentElement).getPropertyValue('--color-brand-500')` → `#465fff`
4. `class="bg-brand-500 text-title-sm shadow-theme-md"` 적용 요소 스타일 확인
5. 다크모드 전환 시 `--color-primary` 값이 brand-500 → brand-400으로 변경되는지 확인
6. `npm run storybook` → `Getting Started/Design Tokens` 4개 스토리 렌더링 확인
7. Flatpickr/FullCalendar 스타일 여전히 적용되는지 확인 (서드파티 오버라이드 보존)
