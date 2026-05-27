# Peoplify — 서버 전용 구현 플랜 (DB + API, 프론트엔드 제외)

## Context

`plan/server-db-planning.md`의 Phase 1~2만 범위로 한정한다.  
현재 `server/`는 Express + JWT 인증만 구현되어 있고, 유저 데이터는 메모리 배열(`data/users.js`)에 하드코딩.  
목표: PostgreSQL + Knex.js를 연결하여 DB 기반 인증 + 4개 대시보드 API + 3종 CRUD API를 완성한다.  
프론트엔드 연동(Phase 3)은 별도 작업으로 분리한다.

---

## PostgreSQL 사용 시 반드시 해야 할 작업 목록

| # | 작업 | 설명 |
|---|------|------|
| 1 | **Docker 설치 확인** | Docker Desktop이 실행 중이어야 함 |
| 2 | **PostgreSQL 컨테이너 실행** | `docker run` 1줄로 로컬 DB 기동 |
| 3 | **pg + knex 패키지 설치** | `server/` 디렉터리에서 설치 |
| 4 | **`server/.env`에 DATABASE_URL 추가** | Knex가 연결할 접속 문자열 |
| 5 | **Knex 설정 싱글톤 생성** | `server/src/db/knex.js` |
| 6 | **마이그레이션 파일 작성** | 테이블 6개 DDL (Knex migration 형식) |
| 7 | **시드 데이터 작성** | 개발용 더미 데이터 (직원·프로젝트·투입현황) |
| 8 | **마이그레이션 실행** | `npx knex migrate:latest` |
| 9 | **시드 실행** | `npx knex seed:run` |
| 10 | **기존 mock 유저 → DB 조회로 교체** | `data/users.js` 제거, `repositories/userRepository.js` 신규 작성 |

---

## Phase 1 — DB 셋업

### 1-1. PostgreSQL Docker 실행

```bash
docker run --name peoplify-db \
  -e POSTGRES_PASSWORD=peoplify \
  -e POSTGRES_DB=peoplify \
  -p 5432:5432 -d postgres:16-alpine
```

재시작 시: `docker start peoplify-db`  
중지: `docker stop peoplify-db`

### 1-2. 패키지 설치

```bash
cd server
npm install knex pg
```

### 1-3. `server/.env` 업데이트

```
PORT=4000
JWT_SECRET=peoplify-dev-secret-key-change-in-production
JWT_EXPIRES_IN=7d
ALLOWED_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://postgres:peoplify@localhost:5432/peoplify
```

### 1-4. 신규 파일 목록 (Phase 1)

```
server/
├── knexfile.js                          ← Knex CLI 설정 (migrate/seed 실행용)
└── src/
    ├── db/
    │   ├── knex.js                      ← Knex 싱글톤 (앱에서 import)
    │   ├── migrations/
    │   │   ├── 001_create_users.js
    │   │   ├── 002_create_employees.js
    │   │   ├── 003_create_employee_skills.js
    │   │   ├── 004_create_projects.js
    │   │   ├── 005_create_project_tech_stack.js
    │   │   └── 006_create_assignments.js
    │   └── seeds/
    │       ├── 01_users.js
    │       ├── 02_employees.js
    │       ├── 03_employee_skills.js
    │       ├── 04_projects.js
    │       ├── 05_project_tech_stack.js
    │       └── 06_assignments.js
    └── repositories/
        └── userRepository.js            ← data/users.js 대체
```

### 1-5. 핵심 파일 상세 구현 내용

#### `server/knexfile.js`
```js
require('dotenv').config();
module.exports = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: { directory: './src/db/migrations' },
    seeds: { directory: './src/db/seeds' },
  },
};
```

#### `server/src/db/knex.js`
```js
const knex = require('knex');
const config = require('../../knexfile');
const db = knex(config.development);
module.exports = db;
```

#### `assignments` 테이블 마이그레이션 핵심 (PostgreSQL generated column)
```js
// 006_create_assignments.js
table.boolean('is_current').generatedAlwaysAs(
  knex.raw(`start_date <= CURRENT_DATE AND (end_date IS NULL OR end_date >= CURRENT_DATE)`)
).stored();
```
> ⚠️ `is_current`는 INSERT/UPDATE 불가, 자동 계산

#### `server/src/repositories/userRepository.js`
```js
const db = require('../db/knex');
exports.findByEmail = (email) => db('users').where({ email }).first();
exports.findById = (id) => db('users').where({ id }).first();
```

#### `server/src/routes/auth.js` 수정 사항
- `require('../data/users')` → `require('../repositories/userRepository')`
- `findByEmail`, `findById` 함수 시그니처 동일 → 최소 변경

### 1-6. 시드 데이터 구성

| 시드 파일 | 내용 |
|---------|------|
| `01_users.js` | admin, user 계정 (bcrypt 해시) |
| `02_employees.js` | 15~20명 직원 (active, leave, resigned 혼합) |
| `03_employee_skills.js` | 직원별 기술스택 2~5개 |
| `04_projects.js` | 8~10개 프로젝트 (active, complete, planned 혼합) |
| `05_project_tech_stack.js` | 프로젝트별 기술 |
| `06_assignments.js` | 25~30개 투입현황 (현재 투입 + 과거 이력) |

> 시드 데이터는 대시보드 KPI가 실제 값을 반환하도록 설계  
> (벤치 인원 ≥ 3명, 30일 내 철수 예정 ≥ 2명 포함)

---

## Phase 2 — 대시보드 API + CRUD API 구현

### 2-1. 신규 파일 목록 (Phase 2)

```
server/src/
├── middleware/
│   └── errorHandler.js              ← 글로벌 에러 핸들러 (신규)
└── routes/
    ├── dashboard.js                 ← 4개 대시보드 엔드포인트 (신규)
    ├── employees.js                 ← 사원 CRUD (신규)
    ├── projects.js                  ← 프로젝트 CRUD (신규)
    └── assignments.js               ← 투입현황 CRUD (신규)
```

### 2-2. 대시보드 엔드포인트 쿼리 설계

#### `GET /api/dashboard/summary`
```js
// KPI 4종 집계
const [totalEmployees] = await db('employees').count('id').where('employment_status', 'active');
const [deployed] = await db('assignments').countDistinct('employee_id').where('is_current', true);
const bench = totalEmployees.count - deployed.count;
const [activeProjects] = await db('projects').count('id').where('status', 'active');
// 반환: { totalEmployees, deployed, bench, activeProjects }
```

#### `GET /api/dashboard/active-projects`
```js
// 진행 프로젝트 + 투입인원수 + 기술스택
db('projects')
  .leftJoin('assignments', function() {
    this.on('projects.id', 'assignments.project_id').andOn('assignments.is_current', db.raw('true'))
  })
  .leftJoin('project_tech_stack', 'projects.id', 'project_tech_stack.project_id')
  .where('projects.status', 'active')
  .groupBy('projects.id')
  .select('projects.*', db.raw('COUNT(DISTINCT assignments.employee_id) as deployed_count'),
          db.raw('ARRAY_AGG(DISTINCT project_tech_stack.tech) as tech_stack'))
```

#### `GET /api/dashboard/bench-members`
```js
// 현재 투입 중인 assignment가 없는 active 직원
db('employees')
  .whereNotIn('id', db('assignments').select('employee_id').where('is_current', true))
  .where('employment_status', 'active')
  .leftJoin('employee_skills', 'employees.id', 'employee_skills.employee_id')
  .groupBy('employees.id')
  .select('employees.*', db.raw('ARRAY_AGG(employee_skills.skill) as skills'))
```

#### `GET /api/dashboard/urgent-withdrawals`
```js
// 30일 내 철수 예정 (is_current=true AND end_date <= CURRENT_DATE + 30)
db('assignments')
  .join('employees', 'assignments.employee_id', 'employees.id')
  .join('projects', 'assignments.project_id', 'projects.id')
  .where('assignments.is_current', true)
  .whereNotNull('assignments.end_date')
  .whereRaw("assignments.end_date <= CURRENT_DATE + INTERVAL '30 days'")
  .select('employees.name', 'projects.name as project_name',
          'assignments.end_date',
          db.raw("assignments.end_date - CURRENT_DATE as days_remaining"))
  .orderBy('assignments.end_date')
```

### 2-3. CRUD 엔드포인트 목록

| 라우터 | 메서드 | 경로 | 설명 |
|--------|--------|------|------|
| employees | GET | `/api/employees` | 목록 (페이지네이션, 검색) |
| | POST | `/api/employees` | 등록 |
| | GET | `/api/employees/:id` | 상세 |
| | PUT | `/api/employees/:id` | 수정 |
| | DELETE | `/api/employees/:id` | 소프트 삭제 (`employment_status = 'resigned'`) |
| projects | GET | `/api/projects` | 목록 |
| | POST | `/api/projects` | 등록 |
| | GET | `/api/projects/:id` | 상세 + 기술스택 + 투입인원 |
| | PUT | `/api/projects/:id` | 수정 |
| assignments | GET | `/api/assignments` | 전체 투입현황 |
| | POST | `/api/assignments` | 투입 등록 |
| | PUT | `/api/assignments/:id` | 수정 (역할, rate_pct, end_date) |
| | DELETE | `/api/assignments/:id` | 철수 (end_date = today) |

### 2-4. `server/src/index.js` 수정 사항

```js
// 추가할 내용
const dashboardRouter = require('./routes/dashboard');
const employeesRouter = require('./routes/employees');
const projectsRouter = require('./routes/projects');
const assignmentsRouter = require('./routes/assignments');
const errorHandler = require('./middleware/errorHandler');

app.use('/api/dashboard', authMiddleware, dashboardRouter);
app.use('/api/employees', authMiddleware, employeesRouter);
app.use('/api/projects', authMiddleware, projectsRouter);
app.use('/api/assignments', authMiddleware, assignmentsRouter);

app.use(errorHandler); // 마지막에 등록
```

### 2-5. 글로벌 에러 핸들러

```js
// server/src/middleware/errorHandler.js
module.exports = (err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
};
```

---

## 수정/생성 파일 전체 목록

| 파일 | 작업 |
|------|------|
| `server/knexfile.js` | 신규 생성 |
| `server/.env` | `DATABASE_URL` 추가 |
| `server/package.json` | knex, pg 의존성 추가됨 |
| `server/src/db/knex.js` | 신규 생성 |
| `server/src/db/migrations/001~006_*.js` | 신규 생성 (6개) |
| `server/src/db/seeds/01~06_*.js` | 신규 생성 (6개) |
| `server/src/repositories/userRepository.js` | 신규 생성 |
| `server/src/routes/auth.js` | import 경로 수정 (최소 변경) |
| `server/src/routes/dashboard.js` | 신규 생성 |
| `server/src/routes/employees.js` | 신규 생성 |
| `server/src/routes/projects.js` | 신규 생성 |
| `server/src/routes/assignments.js` | 신규 생성 |
| `server/src/middleware/errorHandler.js` | 신규 생성 |
| `server/src/index.js` | 새 라우터 등록 |
| `server/src/data/users.js` | 삭제 (DB 마이그레이션 완료 후) |

---

## 검증 방법

```bash
# 1. Docker DB 확인
docker ps | grep peoplify-db

# 2. 마이그레이션 실행
cd server && npx knex migrate:latest

# 3. 시드 실행
npx knex seed:run

# 4. 서버 실행
npm run dev

# 5. 로그인 (DB 기반 인증 확인)
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@peoplify.com","password":"password"}'

# 6. 대시보드 API 확인 (토큰 필요)
curl -H "Authorization: Bearer <token>" http://localhost:4000/api/dashboard/summary
curl -H "Authorization: Bearer <token>" http://localhost:4000/api/dashboard/active-projects
curl -H "Authorization: Bearer <token>" http://localhost:4000/api/dashboard/bench-members
curl -H "Authorization: Bearer <token>" http://localhost:4000/api/dashboard/urgent-withdrawals

# 7. CRUD API 확인
curl -H "Authorization: Bearer <token>" http://localhost:4000/api/employees
curl -H "Authorization: Bearer <token>" http://localhost:4000/api/projects
curl -H "Authorization: Bearer <token>" http://localhost:4000/api/assignments
```

**기대 결과:**
- `summary`: `{ totalEmployees: N, deployed: N, bench: N, activeProjects: N }`
- `bench-members`: 현재 미투입 직원 배열 (skills 포함)
- `urgent-withdrawals`: `days_remaining ≤ 30`인 투입 목록

---

## 작업 우선순위 (권장 실행 순서)

1. Docker PostgreSQL 실행
2. `knex`, `pg` 설치
3. `knexfile.js`, `src/db/knex.js` 생성
4. 마이그레이션 파일 6개 작성 → `migrate:latest`
5. `userRepository.js` 작성 → `auth.js` 수정 → 로그인 검증
6. 시드 파일 6개 작성 → `seed:run`
7. `dashboard.js` 라우터 4개 쿼리 구현
8. `employees.js`, `projects.js`, `assignments.js` CRUD 구현
9. `errorHandler.js` 추가, `index.js`에 라우터 등록
10. curl로 전 엔드포인트 검증
