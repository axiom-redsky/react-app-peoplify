# Publishing — React 컴포넌트 스테이징 공간

퍼블리셔가 디자인 토큰을 활용해 React 컴포넌트를 작성하고 팀과 공유하는 스테이징 공간입니다.

## 역할

- Figma 디자인을 React 컴포넌트로 구현하는 1차 작업 공간
- Vite 번들 포함 (React 컴포넌트), 단 React Router 등록 없음
- 핸드오프 완료 후 `src/domains/[name]/` 또는 `src/shared/`로 이동

## 스타일 규칙

- **Tailwind 유틸리티 클래스 + `cn()` 사용** — CSS 파일 생성 금지
- 디자인 토큰 클래스 참조: `bg-brand-500`, `text-gray-700`, `shadow-theme-md` 등
- import: `@/` alias 사용 (`@/shared/utils/cn` 등)

## 팀 프리뷰

```bash
npm run storybook
```

Storybook → `Getting Started/Design Tokens` 에서 사용 가능한 토큰 클래스 확인

## 토큰 변경 요청

JSON 수정 후 재생성:

```bash
# src/design-tokens/primitive/*.json 또는 semantic/*.json 수정 후
npm run build:tokens
```

> ⚠ `src/assets/styles/tokens/` 파일은 자동생성 파일입니다. 직접 편집하지 마세요.

## 핸드오프 기준

| 폴더 | 핸드오프 목적지 |
|------|----------------|
| `pages/` | `src/domains/[name]/pages/` |
| `components/` | `src/shared/` 또는 `src/domains/[name]/components/` |
