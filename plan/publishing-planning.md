# Peoplify 디자인 컨셉 & 레이아웃 플랜 (퍼블리셔 작업 범위)

## Context

react-app-peoplify SI 프로젝트에서 퍼블리셔 역할로 진행하는 작업이다.
업무 개발자가 `src/domains/`에 작업하기 전, 퍼블리셔가 아래 세 영역을 먼저 완성한다.

1. **디자인 토큰 & 테마** — Teal 브랜드 컬러 시스템 구축
2. **글로벌 레이아웃** — 사이드바 메뉴 재구성, Login 전용 레이아웃 추가
3. **publishing/ 페이지 레이아웃** — 각 화면의 HTML/CSS 구조만 잡아둔 목업 (API·상태관리 없음)

domains/는 건드리지 않는다. publishing/ 폴더에 퍼블리셔 작업물을 납품하고,
업무 개발자가 publishing/ → domains/ 로 포팅하는 흐름이다.

---

## 작업 1. 디자인 토큰 & 테마 CSS

### 1-1. `src/design-tokens/primitive/color.json`
Teal 원시 팔레트 추가:
```json
"teal": {
  "50": "#F0FDFA", "100": "#CCFBF1", "200": "#99F6E4",
  "300": "#5EEAD4", "400": "#2DD4BF", "500": "#14B8A6",
  "600": "#0D9488", "700": "#0F766E", "800": "#115E59",
  "900": "#134E4A", "950": "#042F2E"
}
```

### 1-2. `src/design-tokens/semantic/light.json`
brand/status 토큰 추가 (기존 항목 유지, 신규 키 추가):
- `color.brand.primary` → `{color.teal.600}`
- `color.brand.primary-hover` → `{color.teal.700}`
- `color.brand.primary-subtle` → `{color.teal.50}`
- `color.status.active` → `{color.emerald.500}`   (투입중)
- `color.status.bench` → `{color.amber.400}`       (벤치)
- `color.status.warning` → `{color.orange.500}`    (철수 임박)
- `color.status.complete` → `{color.slate.400}`    (완료)
- `color.status.planned` → `{color.sky.500}`       (예정)

### 1-3. `src/design-tokens/semantic/dark.json`
동일 구조, dark 수치로 매핑 (primary → teal-400 등)

### 1-4. `src/assets/styles/themes/theme-peoplify.css` ← **신규**
shadcn CSS 변수를 Teal 브랜드로 오버라이드.
사이드바는 다크 배경(slate-900)으로 고정:
```css
:root {
  /* primary */
  --primary: oklch(/* teal-600 */);
  --primary-foreground: oklch(1 0 0);
  --ring: oklch(/* teal-600 */);
  /* sidebar — 항상 다크 */
  --sidebar: oklch(/* slate-900 */);
  --sidebar-foreground: oklch(/* slate-100 */);
  --sidebar-primary: oklch(/* teal-400 */);
  --sidebar-primary-foreground: oklch(/* slate-900 */);
  --sidebar-accent: oklch(/* teal-800/30% */);
  --sidebar-accent-foreground: oklch(/* teal-300 */);
  --sidebar-border: oklch(/* slate-700 */);
}
.dark {
  --primary: oklch(/* teal-400 */);
  --primary-foreground: oklch(/* slate-900 */);
}
```

### 1-5. `src/assets/styles/app.css`
`theme-default.css` import → `theme-peoplify.css` import 로 교체

**토큰 빌드:** `npm run build:tokens` 실행 필요 (자동생성 파일 재생성)

---

## 작업 2. 글로벌 레이아웃

### 2-1. `src/shared/components/layout/default/config/navigation.tsx`
기존 Example 메뉴 → Peoplify 업무 메뉴로 완전 교체:

```typescript
navItems = [
  { name: '대시보드',  path: '/',                 icon: LayoutDashboard },
  { name: '직원관리',  icon: Users,
    subItems: [
      { name: '직원 목록', path: '/employees' },
      { name: '직원 등록', path: '/employees/new' },
    ]
  },
  { name: '프로젝트',  icon: FolderKanban,
    subItems: [
      { name: '프로젝트 목록', path: '/projects' },
      { name: '투입 현황',    path: '/projects/status' },
    ]
  },
  { name: '근태관리',  icon: CalendarClock,
    subItems: [
      { name: '월별 근무 보고', path: '/attendance' },
      { name: '휴가 관리',     path: '/attendance/leave' },
    ]
  },
  { name: '리포트',   path: '/reports',            icon: BarChart3 },
]
othersItems = []
```

### 2-2. `src/shared/components/layout/AuthLayout.tsx` ← **신규**
Login 전용 레이아웃 (사이드바·헤더 없음):
- 배경: Teal 그라디언트 (teal-600 → teal-800)
- 중앙 흰 카드 (max-w-md)
- 상단에 Peoplify 로고/워드마크
- `<Outlet />` 만 렌더링

---

## 작업 3. 공통 UI 컴포넌트 (shared)

### 3-1. `src/shared/components/ui/StatusBadge.tsx` ← **신규**
투입 상태를 표시하는 공통 Badge (publishing 페이지에서 직접 사용):
```tsx
type Status = 'active' | 'bench' | 'warning' | 'complete' | 'planned'
// 각 status별 Tailwind 색상 클래스 매핑
// 투입중(emerald), 벤치(amber), 임박(orange), 완료(slate), 예정(sky)
```

### 3-2. `src/shared/components/ui/PageHeader.tsx` ← **신규**
모든 콘텐츠 페이지 최상단 공통 헤더:
```tsx
interface PageHeaderProps {
  title: string
  breadcrumb?: { label: string; path?: string }[]
  actions?: React.ReactNode
}
// 좌측: breadcrumb + title / 우측: actions 슬롯
```

---

## 작업 4. Publishing 페이지 레이아웃 목업

`src/publishing/` 아래에 12개 화면의 HTML/CSS 구조만 작성.
실제 데이터 대신 하드코딩된 더미 텍스트 사용. API·훅·상태관리 없음.

### 폴더 구조:
```
src/publishing/
├── main/                          # 기존 예제 폴더 (참고용 유지)
│   └── ...
├── dashboard/
│   └── pages/DashboardPage.tsx    # KPI 카드 4개 + 프로젝트 목록 + 벤치 현황
├── employee/
│   ├── pages/
│   │   ├── EmployeeListPage.tsx   # 필터바 + 테이블 + 페이지네이션
│   │   ├── EmployeeDetailPage.tsx # 탭(기본정보/투입이력/기술스택/계약)
│   │   └── EmployeeFormPage.tsx   # 폼 섹션 (기본정보 + 기술스택 태그 입력)
│   └── router/index.tsx
├── project/
│   ├── pages/
│   │   ├── ProjectListPage.tsx    # 상태 탭 + 카드형 목록
│   │   ├── ProjectDetailPage.tsx  # 개요 탭 + 투입 인력 테이블
│   │   ├── ProjectAssignPage.tsx  # 벤치 필터 + 선택 테이블 + 배정 폼
│   │   └── ProjectStatusPage.tsx  # 전체 인력 × 프로젝트 매트릭스 테이블
│   └── router/index.tsx
├── attendance/
│   ├── pages/
│   │   ├── MonthlyReportPage.tsx  # 개인 보고 폼 + 팀 현황 테이블
│   │   └── LeaveManagePage.tsx    # 연차 현황 카드 + 신청 폼 + 내역 목록
│   └── router/index.tsx
├── auth/
│   ├── pages/LoginPage.tsx        # AuthLayout 안에 들어가는 로그인 폼
│   └── router/index.tsx
└── report/
    ├── pages/ReportPage.tsx       # 차트 영역(더미) + 개인별 투입 요약 테이블
    └── router/index.tsx
```

### publishing 라우터 등록 (`src/shared/router/index.tsx`)
기존 `/publishing/example` 패턴으로 추가:
- `/publishing/dashboard`   → DashboardPage
- `/publishing/employees`   → EmployeeListPage
- `/publishing/employees/:id`  → EmployeeDetailPage
- `/publishing/employees/new`  → EmployeeFormPage
- `/publishing/projects`    → ProjectListPage
- `/publishing/projects/:id` → ProjectDetailPage
- `/publishing/projects/:id/assign` → ProjectAssignPage
- `/publishing/projects/status` → ProjectStatusPage
- `/publishing/attendance`  → MonthlyReportPage
- `/publishing/attendance/leave` → LeaveManagePage
- `/publishing/login`       → AuthLayout + LoginPage
- `/publishing/reports`     → ReportPage

---

## 페이지 레이아웃 패턴 (publishing 작업 표준)

| 패턴 | 사용 화면 | 구조 |
|------|----------|------|
| **리스트** | 직원목록, 프로젝트목록, 투입현황 | PageHeader + 필터바 + Table + Pagination |
| **상세** | 직원상세, 프로젝트상세 | PageHeader(breadcrumb) + 요약카드 + Tabs |
| **폼** | 직원등록, 인력배정 | PageHeader(breadcrumb) + 섹션별 폼 + 하단 액션 버튼 |
| **대시보드** | 대시보드, 리포트 | PageHeader + KPI 카드 행(4개) + 데이터 목록 |
| **인증** | 로그인 | AuthLayout + 중앙 카드 폼 |

---

## 수정·생성 파일 목록

| 파일 | 종류 |
|------|------|
| `src/design-tokens/primitive/color.json` | 수정 |
| `src/design-tokens/semantic/light.json` | 수정 |
| `src/design-tokens/semantic/dark.json` | 수정 |
| `src/assets/styles/themes/theme-peoplify.css` | **신규** |
| `src/assets/styles/app.css` | 수정 |
| `src/shared/components/layout/default/config/navigation.tsx` | 수정 |
| `src/shared/components/layout/AuthLayout.tsx` | **신규** |
| `src/shared/components/ui/StatusBadge.tsx` | **신규** |
| `src/shared/components/ui/PageHeader.tsx` | **신규** |
| `src/shared/router/index.tsx` | 수정 (publishing 라우트 추가) |
| `src/publishing/dashboard/pages/DashboardPage.tsx` | **신규** |
| `src/publishing/employee/pages/*.tsx` (3개) | **신규** |
| `src/publishing/project/pages/*.tsx` (4개) | **신규** |
| `src/publishing/attendance/pages/*.tsx` (2개) | **신규** |
| `src/publishing/auth/pages/LoginPage.tsx` | **신규** |
| `src/publishing/report/pages/ReportPage.tsx` | **신규** |
| `src/publishing/*/router/index.tsx` (5개) | **신규** |

---

## 검증 방법

1. `npm run build:tokens` → 토큰 재빌드 성공 확인
2. `npm run dev` → 개발 서버 실행
3. 사이드바 Teal 컬러 적용, 5개 메뉴 항목 및 하위 메뉴 동작 확인
4. `/publishing/dashboard` → KPI 카드 + 목록 레이아웃 확인
5. `/publishing/login` → 사이드바 없는 AuthLayout + 로그인 폼 확인
6. `/publishing/employees` → 필터바 + 테이블 레이아웃 확인
7. 다크모드 토글 → 색상 전환 확인
8. 모바일 너비(375px)에서 사이드바 토글 동작 확인
