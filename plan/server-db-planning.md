# Peoplify - 데이터베이스 선정 및 API 연동 구현 플랜

## Context

현재 메인 대시보드(`MainIndex.tsx`)는 인력관리 KPI 및 현황 데이터를 하드코딩된 더미 데이터로 표시하고 있다.  
이를 실제 DB → 서버 API → 프론트엔드 TanStack Query 흐름으로 교체하기 위한 전체 구현 계획이다.  
서버(`server/`)는 이미 Express.js + JWT 인증까지 구현되어 있으나, DB가 없고 mock 유저 배열만 존재한다.

---

## 1. 데이터베이스 추천: PostgreSQL

### 비교표

| | SQLite | MySQL/MariaDB | **PostgreSQL** |
|---|---|---|---|
| 설치 | 파일 하나, zero-setup | 서버 프로세스 필요 | 서버 프로세스 필요 |
| 한국 SI 현장 친숙도 | 낮음 | 높음 | 점점 증가 중 |
| 날짜 연산 | 보통 | 보통 | **우수** (interval, date_part) |
| 동시 쓰기 | 단일 writer 제한 | 좋음 | **좋음** |
| JSON 지원 | 제한적 | 제한적 | **우수** |
| 배포 | 파일 복사 | DB 서버 필요 | DB 서버 필요 |

**PostgreSQL 선택 이유:**
- `투입 종료 임박(D-day)` 계산: `end_date - CURRENT_DATE` interval 연산이 깔끔함
- `벤치 기간` 계산: 마지막 assignment 종료일로부터 경과 일수 — CTE/윈도우 함수로 처리
- Knex.js 사용 시 MySQL 전환은 config 1줄 변경으로 가능 (Lock-in 없음)
- 로컬 개발: Docker 1줄로 실행 가능

```bash
docker run --name peoplify-db \
  -e POSTGRES_PASSWORD=peoplify \
  -e POSTGRES_DB=peoplify \
  -p 5432:5432 -d postgres:16-alpine
```

---

## 2. ORM/Query 라이브러리: Knex.js

서버가 plain JS(CommonJS)이므로 빌드 파이프라인이 없다. 따라서:
- **Prisma** → TypeScript 스키마 언어 필요, 빌드 단계 필요 → 과도한 설정
- **Sequelize** → 무거운 ORM, 복잡한 집계 쿼리에서 추상화가 방해됨
- **Knex.js** ✅ → SQL 쿼리 빌더, plain JS 네이티브, 마이그레이션 내장, `pg` 드라이버만 추가

```bash
# server/ 디렉토리에서
npm install knex pg
```

---

## 3. DB 스키마 설계

### 핵심 테이블 6개

```sql
-- 시스템 로그인 계정 (기존 data/users.js 대체)
users: id, email, password_hash, name, role, created_at, updated_at

-- 사원 마스터
employees: id, name, email, phone, department, position, hire_date,
           employment_status('active'|'leave'|'resigned'), created_at, updated_at

-- 사원 기술 스택
employee_skills: id, employee_id(FK), skill

-- 프로젝트 마스터
projects: id, name, client, start_date, end_date,
          status('planned'|'active'|'complete'), progress_pct, description, created_at, updated_at

-- 프로젝트 기술 스택
project_tech_stack: id, project_id(FK), tech

-- 투입현황 (핵심 관계 테이블)
assignments: id, employee_id(FK), project_id(FK), role, rate_pct,
             start_date, end_date, is_current(generated column), created_at, updated_at
```

**`is_current` Generated Column (PostgreSQL):**
```sql
is_current BOOLEAN GENERATED ALWAYS AS (
  start_date <= CURRENT_DATE AND (end_date IS NULL OR end_date >= CURRENT_DATE)
) STORED
```
→ 벤치 여부 = `employees` 중 `is_current = true`인 `assignments`가 없는 사람  
→ 투입 임박 = `is_current = true AND end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 30`

---

## 4. 서버 API 엔드포인트

### 대시보드 (우선 구현)
```
GET /api/dashboard/summary          → KPI 4종 (총인원, 투입중, 벤치, 진행프로젝트)
GET /api/dashboard/active-projects  → 진행 프로젝트 목록 + 투입인원수
GET /api/dashboard/bench-members    → 벤치 인원 + 벤치 시작일
GET /api/dashboard/urgent-withdrawals → 30일 내 철수 예정 목록 + D-day
```

### CRUD (2단계)
```
GET/POST   /api/employees            → 사원 목록/등록
GET/PUT/DELETE /api/employees/:id   → 사원 상세/수정/삭제(soft)

GET/POST   /api/projects             → 프로젝트 목록/등록
GET/PUT    /api/projects/:id         → 프로젝트 상세/수정

GET/POST   /api/assignments          → 전체 투입현황 / 투입 확정
PUT/DELETE /api/assignments/:id     → 투입 수정 / 철수
```

---

## 5. 프론트엔드 연동 구조

### 기존 `useApi` 훅 패턴 그대로 활용 (`src/core/hooks/use-api.ts`)

```typescript
// src/domains/main/hooks/useDashboardSummary.ts
const { data: summary } = useApi<DashboardSummary>('/api/dashboard/summary');

// src/domains/main/hooks/useActiveProjects.ts
const { data: activeProjects } = useApi<ActiveProject[]>('/api/dashboard/active-projects');
```

### 도메인 폴더 구조
```
src/domains/main/
  hooks/
    useDashboardSummary.ts
    useActiveProjects.ts
    useBenchMembers.ts
    useUrgentWithdrawals.ts
  types/
    dashboard.ts          ← API 응답 타입 정의
  pages/
    MainIndex.tsx         ← 기존 파일 수정 (더미 데이터 → 훅 호출)
```

`MainIndex.tsx`의 inline const 배열들을 훅 호출로 교체하고, loading/error 상태 추가.

---

## 6. 구현 순서

### Phase 1 — DB 셋업 (1~2일)
1. Docker로 PostgreSQL 16 실행
2. `server/`에 `knex`, `pg` 설치
3. `server/src/db/knex.js` — Knex 싱글톤 생성
4. `server/src/db/migrations/` — 테이블 마이그레이션 파일 작성
5. `server/src/db/seeds/` — 시드 데이터 작성 (기존 더미 데이터 기반)
6. `server/.env`에 `DATABASE_URL` 추가
7. 기존 `data/users.js` → DB 기반 `repositories/userRepository.js` 교체
8. auth 라우터가 DB를 통해 로그인 동작하는지 검증

### Phase 2 — 대시보드 API 서버 구현 (3~4일)
9. `server/src/routes/dashboard.js` — 4개 엔드포인트 Knex 쿼리 구현
10. `server/src/index.js`에 대시보드 라우터 등록 (`authMiddleware` 적용)
11. `server/src/routes/employees.js`, `projects.js`, `assignments.js` 구현
12. 글로벌 에러 핸들러 미들웨어 추가

### Phase 3 — 프론트엔드 연동 (5~6일)
13. `src/domains/main/types/dashboard.ts` — 타입 정의
14. `src/domains/main/hooks/` — 4개 훅 작성
15. `src/domains/main/pages/MainIndex.tsx` — 더미 데이터 제거, 훅 연결
16. loading skeleton, error fallback 처리

---

## 7. 수정 대상 파일

| 파일 | 작업 |
|---|---|
| `server/src/index.js` | 새 라우터 등록 |
| `server/src/routes/auth.js` | DB 기반 유저 조회로 교체 |
| `server/src/data/users.js` | DB 마이그레이션 후 제거 |
| `server/.env` | `DATABASE_URL` 추가 |
| `src/domains/main/pages/MainIndex.tsx` | 더미 데이터 → 훅 호출 |

**신규 생성 파일:**
- `server/src/db/knex.js`
- `server/src/db/migrations/*.js` (6개 테이블)
- `server/src/db/seeds/*.js`
- `server/src/repositories/userRepository.js`
- `server/src/routes/dashboard.js`, `employees.js`, `projects.js`, `assignments.js`
- `src/domains/main/types/dashboard.ts`
- `src/domains/main/hooks/useDashboardSummary.ts` 외 3개

---

## 8. 검증 방법

1. `docker ps`로 PostgreSQL 컨테이너 실행 확인
2. `POST http://localhost:4000/api/auth/login` — DB 기반 로그인 동작 확인
3. `GET http://localhost:4000/api/dashboard/summary` — KPI 집계값 반환 확인
4. 브라우저에서 메인 대시보드 접근 → 시드 데이터가 실제로 렌더링되는지 확인
5. DB에서 assignment 하나 추가 → 대시보드 새로고침 후 숫자 변경 확인
