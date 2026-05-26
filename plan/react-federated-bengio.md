# 디자인 시스템 + 퍼블리싱 워크플로우 구조 추가 플랜

## Context

중대형 SI (5명+, 디자이너 있음, Figma 사용) 환경에 투입 가능한 scaffold를 목표로 한다.
2026년 업계 표준은 **디자인 토큰을 JSON으로 정의하고 CSS/TS를 자동 생성**하는 파이프라인이다.
현재 두 CSS 파일(`app.css` 136줄, `layout/default/layout.css` 787줄)에 토큰·테마·유틸이 혼재되어 있으며,
`layout.css` 첫 줄 주석에도 "분리하는 게 좋다"고 명시되어 있다.

### 채택 방향: Style Dictionary 기반 토큰 파이프라인

```
Figma Variables / Tokens Studio (선택, 나중에 연동 가능)
         ↓
src/design-tokens/*.json  ← W3C DTCG 표준 형식 (단일 소스)
         ↓  npm run build:tokens
src/assets/styles/tokens/*.css  ← @theme 블록 포함 CSS (자동 생성)
src/types/design-tokens.ts      ← TypeScript 타입 (자동 생성)
         ↓
Tailwind v4 유틸 + shadcn CSS vars + 개발자 코드에서 사용
```

**핵심 원칙:** 토큰 값은 JSON에서만 수정한다. CSS는 손으로 편집하지 않는다.

---

## 최종 디렉토리 구조

```
src/
├── design-tokens/               ← (신규) 토큰 소스 — W3C DTCG JSON
│   ├── tokens/
│   │   ├── color.json
│   │   ├── typography.json
│   │   ├── shadow.json
│   │   └── spacing.json
│   └── style-dictionary.config.js
├── assets/styles/
│   ├── tokens/                  ← (신규, 자동생성) Style Dictionary 출력물
│   │   ├── primitive.css           ← ⚠ 직접 편집 금지 (generated)
│   │   ├── theme-dark.css
│   │   └── theme-light.css
│   ├── themes/                  ← (신규) 프로젝트 브랜드 테마
│   │   ├── theme-default.css
│   │   └── theme-example-project.css  ← 투입 시 참고용 예시
│   ├── base/                    ← (신규) 전역 초기화·유틸
│   │   ├── reset.css
│   │   ├── typography.css
│   │   ├── layout.css
│   │   └── utilities.css
│   ├── layout/
│   │   └── default/layout.css   ← 기존, 서드파티 오버라이드만 남김
│   └── app.css                  ← @import 진입점으로 리팩토링
├── types/
│   └── design-tokens.ts         ← (신규, 자동생성) 토큰 TS 타입
└── publishing/                  ← (신규) 퍼블리셔 마크업 스테이징
    ├── README.md
    ├── templates/example/
    │   ├── index.html
    │   └── style.css
    └── components/example/
        ├── ExampleCard.html
        └── ExampleCard.css
```

---

## 구현 계획

### Phase 1 — Style Dictionary 설치 및 설정

**1-1. 패키지 설치**
```bash
npm install -D style-dictionary
```

**1-2. `src/design-tokens/tokens/color.json` 생성**

W3C DTCG 형식으로 현재 `layout.css @theme` 블록의 `--color-*` 값을 이관:

```json
{
  "color": {
    "brand": {
      "25":  { "$value": "#f2f7ff", "$type": "color" },
      "50":  { "$value": "#ecf3ff", "$type": "color" },
      "500": { "$value": "#465fff", "$type": "color" },
      "950": { "$value": "#161950", "$type": "color" }
    },
    "gray": { ... },
    "success": { ... },
    "error": { ... },
    "warning": { ... },
    "orange": { ... },
    "blue-light": { ... },
    "theme-pink": { "500": { "$value": "#ee46bc", "$type": "color" } },
    "theme-purple": { "500": { "$value": "#7a5af8", "$type": "color" } },
    "white": { "$value": "#ffffff", "$type": "color" },
    "black": { "$value": "#101828", "$type": "color" }
  }
}
```

**1-3. `src/design-tokens/tokens/typography.json` 생성**

```json
{
  "font": {
    "outfit": { "$value": "Outfit, sans-serif", "$type": "fontFamily" }
  },
  "breakpoint": {
    "2xsm": { "$value": "375px", "$type": "dimension" },
    "xsm":  { "$value": "425px", "$type": "dimension" }
  },
  "text": {
    "title": {
      "2xl": { "$value": "72px", "$type": "dimension" },
      "xl":  { "$value": "60px", "$type": "dimension" }
    },
    "theme": {
      "xl": { "$value": "20px", "$type": "dimension" },
      "sm": { "$value": "14px", "$type": "dimension" },
      "xs": { "$value": "12px", "$type": "dimension" }
    }
  }
}
```

**1-4. `src/design-tokens/tokens/shadow.json`**, **`spacing.json`** 동일 방식으로 생성

**1-5. `src/design-tokens/style-dictionary.config.js` 생성**

Tailwind v4의 `@theme { }` 블록을 생성하는 **커스텀 포매터** 포함:

```js
import StyleDictionary from 'style-dictionary';

// Tailwind v4 @theme 블록 출력 포매터
StyleDictionary.registerFormat({
  name: 'css/tailwind-v4-theme',
  format: ({ dictionary }) => {
    const vars = dictionary.allTokens
      .map(t => `  ${t.name}: ${t.value};`)
      .join('\n');
    return `/* AUTO-GENERATED — do not edit manually */\n@theme {\n${vars}\n}\n`;
  },
});

// CSS var 이름 변환: color.brand.500 → --color-brand-500
StyleDictionary.registerTransform({
  name: 'name/css/kebab',
  type: 'name',
  transform: (token) =>
    '--' + token.path.join('-').toLowerCase().replace(/_/g, '-'),
});

export default {
  source: ['src/design-tokens/tokens/**/*.json'],
  platforms: {
    css: {
      transforms: ['name/css/kebab'],
      buildPath: 'src/assets/styles/tokens/',
      files: [
        { destination: 'colors.css',     format: 'css/tailwind-v4-theme', filter: t => t.path[0] === 'color' },
        { destination: 'typography.css', format: 'css/tailwind-v4-theme', filter: t => ['font','breakpoint','text'].includes(t.path[0]) },
        { destination: 'shadows.css',    format: 'css/tailwind-v4-theme', filter: t => t.path[0] === 'shadow' },
        { destination: 'spacing.css',    format: 'css/tailwind-v4-theme', filter: t => t.path[0] === 'z-index' },
      ],
    },
    ts: {
      transforms: ['name/css/kebab'],
      buildPath: 'src/types/',
      files: [{ destination: 'design-tokens.ts', format: 'typescript/es6-declarations' }],
    },
  },
};
```

**1-6. `package.json`에 스크립트 추가**
```json
"scripts": {
  "build:tokens": "style-dictionary build --config src/design-tokens/style-dictionary.config.js",
  "dev": "npm run build:tokens && vite"
}
```

**1-7. `.gitignore`에 생성 파일 추가 여부 결정**
- 권장: generated 파일도 commit (CI/CD에서 별도 빌드 단계 불필요)
- 생성된 파일 상단에 `/* AUTO-GENERATED — do not edit manually */` 주석 필수

---

### Phase 2 — 테마 파일 생성 (app.css 시맨틱 변수 분리)

**`src/assets/styles/themes/theme-default.css`**

`app.css`의 `:root {}`, `.dark {}`, `@theme inline {}` 블록을 이 파일로 이동.
이 파일은 자동생성 대상이 아님 — 직접 편집 허용.

```css
/*
 * theme-default.css — 시맨틱 테마 (shadcn CSS vars + Tailwind 브리지)
 *
 * 프로젝트 투입 시: 이 파일을 복사 → theme-[project].css
 * 변경 방법: tokens/colors.css의 --color-brand-* 값을 참조하도록 :root 변수만 override
 */

/* shadcn 시맨틱 vars → Tailwind 유틸 연결 */
@theme inline {
  --font-heading: var(--font-sans);
  --font-sans: 'Geist Variable', sans-serif;
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  /* ... app.css의 @theme inline 블록 전체 */
}

/* 라이트 테마 */
:root {
  --background: oklch(1 0 0);
  --primary: oklch(0.205 0 0);
  /* ... app.css의 :root 블록 전체 */
}

/* 다크 테마 */
.dark {
  --background: oklch(0.145 0 0);
  /* ... app.css의 .dark 블록 전체 */
}
```

**`src/assets/styles/themes/theme-example-project.css`**

투입 시 브랜드 색상 override 예시 (전체 주석 처리된 템플릿):

```css
/* 예시: --primary를 브랜드 색으로 교체 */
:root {
  --primary: var(--color-brand-500);        /* tokens/colors.css에서 생성된 값 참조 */
  --primary-foreground: var(--color-white);
  --ring: var(--color-brand-500);
}
.dark {
  --primary: var(--color-brand-400);
}
```

---

### Phase 3 — 베이스 파일 생성 (layout.css 분리)

`layout/default/layout.css`의 아래 섹션을 추출:

**`src/assets/styles/base/reset.css`**
- `layout.css` `@layer base` → `*` border-color 호환 리셋, `button` cursor 규칙

**`src/assets/styles/base/typography.css`**
- `layout.css` + `app.css` `@layer base`의 `body`, `html` 규칙 병합
- 최종 body: `@apply bg-gray-50 text-foreground relative font-normal font-outfit z-1;`

**`src/assets/styles/base/utilities.css`**
- `layout.css` `@utility` 블록 전체 (menu-item*, menu-dropdown-*, no-scrollbar, custom-scrollbar)
- `layout.css` `@layer utilities` (input date 브라우저 아이콘 제거)

**`src/assets/styles/base/layout.css`**
- 빈 파일로 생성 (향후 전역 레이아웃 헬퍼 클래스용)

---

### Phase 4 — layout.css 정리

추출 후 `layout/default/layout.css`에 남기는 것:
- 서드파티 CSS 오버라이드 (ApexCharts, jVectorMap, Flatpickr, FullCalendar, Swiper, Simplebar)
- `tableCheckbox`, `taskCheckbox`, `.task` 컴포넌트 스타일
- 파일 상단 주석 업데이트

---

### Phase 5 — app.css 리팩토링 (@import 진입점)

```css
/* app.css — CSS 진입점. 선언 없이 @import만. */

/* 1. External */
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
@import 'tailwindcss';
@import 'tw-animate-css';       /* 기존 중복 import 버그 수정 — 한 번만 */
@import 'shadcn/tailwind.css';
@import '@fontsource-variable/geist';

/* 2. Design Tokens (Style Dictionary 자동생성) */
@import './tokens/colors.css';
@import './tokens/typography.css';
@import './tokens/shadows.css';
@import './tokens/spacing.css';

/* 3. Theme */
@import './themes/theme-default.css';
/* @import './themes/theme-[project].css'; ← 투입 시 주석 해제 */

/* 4. Base */
@import './base/reset.css';
@import './base/typography.css';
@import './base/layout.css';
@import './base/utilities.css';

/* 5. Layout (서드파티 오버라이드) */
@import './layout/default/layout.css';

/* @custom-variant는 반드시 루트 파일에 직접 선언 (import된 파일 안에 넣으면 dark: variant 미생성) */
@custom-variant dark (&:is(.dark *));
```

---

### Phase 6 — 퍼블리싱 폴더 신설

**역할 분리 원칙:**
```
src/publishing/      ← 순수 HTML/CSS (라우터 없음, React 앱과 완전 무관)
                       퍼블리셔 작업 공간 → Storybook으로 팀 공유
                       ↓ React 컴포넌트화 완료 후
src/domains/[name]/  ← 라우터 등록, 실제 앱에 마운트
```

- `src/publishing/`은 Vite 번들링 대상이 아니며 React Router를 사용하지 않는다
- 팀 내 미리보기·공유는 **Storybook**으로 처리한다 (별도 라우터 불필요)
- HTML/CSS → React JSX 변환이 완료된 시점에 `src/domains/[name]/`으로 이동

```
src/publishing/
├── README.md
├── templates/example/
│   ├── index.html    ← brand/타이포/그림자 토큰 클래스 사용 예시가 담긴 대시보드 카드 마크업
│   └── style.css
└── components/example/
    ├── ExampleCard.html
    └── ExampleCard.css
```

**README.md 핵심 내용:**
1. **역할 정의:** 이 폴더는 React 이전 단계의 순수 HTML/CSS 스테이징 공간
2. **미리보기 방법:** `npm run dev` 실행 후 빌드된 CSS를 HTML에 링크 (정적 파일 직접 열기)
3. **팀 공유:** Storybook에 스토리로 등록 → `Getting Started/Design Tokens` 또는 별도 퍼블 스토리
4. **핸드오프 기준:**
   - `templates/` HTML → 페이지 컴포넌트 (`src/domains/[name]/pages/`)
   - `components/` HTML → 공유 또는 도메인 컴포넌트 (`src/shared/` 또는 `src/domains/[name]/components/`)
5. **토큰 클래스 참조:** Storybook `Getting Started/Design Tokens` 링크
6. **토큰 변경 요청:** JSON 수정 후 `npm run build:tokens`

---

### Phase 7 — Storybook 디자인 토큰 문서

`src/__stories__/_docs/DesignTokens.stories.tsx` 생성

**4개 Story:**
1. `Colors` — 팔레트 스와치 (getComputedStyle로 런타임 CSS var 읽기)
2. `Typography` — 타이포 스케일 테이블 (title-2xl~sm, theme-xl/sm/xs)
3. `Shadows` — 그림자 예시 박스
4. `Spacing` — z-index 스케일 다이어그램

**`preview.ts` storySort 업데이트:**
```ts
order: ['Getting Started', ['소개', 'Design Tokens'], 'UI Components', [...], 'Functions', '*']
```

---

## 수정되는 기존 파일

| 파일 | 변경 내용 |
|------|-----------|
| `src/assets/styles/app.css` | @import manifest로 교체, tw-animate-css 중복 제거 |
| `src/assets/styles/layout/default/layout.css` | @theme, @layer base, @utility 블록 제거 → 서드파티만 남김 |
| `package.json` | `build:tokens`, `dev` 스크립트 추가 |
| `.storybook/preview.ts` | storySort에 'Design Tokens' 추가 |

## 신규 생성 파일

```
src/design-tokens/tokens/color.json
src/design-tokens/tokens/typography.json
src/design-tokens/tokens/shadow.json
src/design-tokens/tokens/spacing.json
src/design-tokens/style-dictionary.config.js

src/assets/styles/tokens/colors.css        ← generated
src/assets/styles/tokens/typography.css    ← generated
src/assets/styles/tokens/shadows.css       ← generated
src/assets/styles/tokens/spacing.css       ← generated
src/types/design-tokens.ts                 ← generated

src/assets/styles/themes/theme-default.css
src/assets/styles/themes/theme-example-project.css
src/assets/styles/base/reset.css
src/assets/styles/base/typography.css
src/assets/styles/base/layout.css
src/assets/styles/base/utilities.css

src/publishing/README.md
src/publishing/templates/example/index.html
src/publishing/templates/example/style.css
src/publishing/components/example/ExampleCard.html
src/publishing/components/example/ExampleCard.css

src/__stories__/_docs/DesignTokens.stories.tsx
```

---

## Figma 연동 (선택, 추후)

현재 구조가 완성되면 Figma → 코드 파이프라인 추가가 용이하다:
1. Figma에서 **Tokens Studio** 플러그인으로 변수 export → `src/design-tokens/tokens/*.json` 덮어쓰기
2. `npm run build:tokens` 실행 → CSS/TS 자동 재생성
3. PR 생성 → 리뷰 후 머지

---

## 검증 방법

1. `npm run build:tokens` 실행 → `src/assets/styles/tokens/*.css` 생성 확인
2. `npm run dev` 실행 → 기존 페이지 렌더링 정상 확인 (색상·레이아웃 깨짐 없음)
3. DevTools 콘솔: `getComputedStyle(document.documentElement).getPropertyValue('--color-brand-500')` → `#465fff`
4. `class="bg-brand-500 text-title-sm shadow-theme-md"` 적용 요소 스타일 확인
5. `npm run storybook` → `Getting Started/Design Tokens` 4개 스토리 렌더링 확인
6. Flatpickr/FullCalendar 스타일 여전히 적용되는지 확인
