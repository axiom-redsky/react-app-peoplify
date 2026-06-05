# Peoplify API 명세

**Base URL** `http://localhost:4000`  
**인증** 로그인 후 발급된 JWT를 `Authorization: Bearer <token>` 헤더에 포함  
**응답 공통 형식** `{ success: true, data: ... }` / 실패 시 `{ success: false, message: "..." }`

---

## 인증 (Auth)

> `user.employee_id`: 로그인 사용자와 연결된 직원 ID. "내" 화면(예: 월별 근무 보고)에서 사용한다.
> 직원과 연결되지 않은 관리 전용 계정은 `null`일 수 있다. (토큰 payload에도 포함됨)

### POST `/api/auth/login`
로그인. 토큰 발급.

**인증 불필요**

**Request Body**
```json
{
  "email": "admin@peoplify.com",
  "password": "password"
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGci...",
    "user": {
      "id": 1,
      "name": "관리자",
      "email": "admin@peoplify.com",
      "role": "admin",
      "employee_id": 1
    }
  }
}
```

---

### GET `/api/auth/me`
현재 로그인한 사용자 정보 조회.

**Response**
```json
{
  "success": true,
  "data": {
    "user": { "id": 1, "name": "관리자", "email": "admin@peoplify.com", "role": "admin", "employee_id": 1 }
  }
}
```

---

### POST `/api/auth/logout`
로그아웃 (클라이언트 측 토큰 제거용).

**Response**
```json
{ "success": true, "message": "로그아웃되었습니다." }
```

---

## 대시보드 (Dashboard)

> 모든 엔드포인트 **인증 필요**

### GET `/api/dashboard/summary`
KPI 4종 집계.

**Response**
```json
{
  "success": true,
  "data": {
    "totalEmployees": 18,
    "deployed": 15,
    "bench": 3,
    "activeProjects": 4
  }
}
```

---

### GET `/api/dashboard/active-projects`
진행 중인 프로젝트 목록 + 투입인원 수 + 기술스택.

**조건**
- `projects.status = 'active'` 인 프로젝트만 반환
- `deployed_count`: 현재 투입 중인 인원만 집계 (`start_date <= TODAY AND (end_date IS NULL OR end_date >= TODAY)`)
- `tech_stack`: 중복 제거된 기술스택 배열 (없으면 `[]`)

**Response**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "프로젝트명",
      "client": "고객사",
      "start_date": "2024-01-01",
      "end_date": "2024-12-31",
      "status": "active",
      "progress_pct": 60,
      "deployed_count": "5",
      "tech_stack": ["React", "Node.js", "PostgreSQL"]
    }
  ]
}
```

---

### GET `/api/dashboard/bench-members`
현재 미투입(벤치) 중인 재직 직원 목록 + 기술스택.

**Response**
```json
{
  "success": true,
  "data": [
    {
      "id": 16,
      "name": "정다은",
      "department": "개발팀",
      "position": "프론트엔드 개발자",
      "hire_date": "2022-09-19",
      "skills": ["React", "TypeScript"]
    }
  ]
}
```

---

### GET `/api/dashboard/urgent-withdrawals`
30일 내 철수 예정인 투입현황 목록.

**Response**
```json
{
  "success": true,
  "data": [
    {
      "employee_id": 3,
      "employee_name": "박지훈",
      "department": "개발팀",
      "project_name": "프로젝트명",
      "end_date": "2024-06-15",
      "days_remaining": "12"
    }
  ]
}
```

---

## 직원 (Employees)

> 모든 엔드포인트 **인증 필요**

### GET `/api/employees`
직원 목록 조회. 페이지네이션 + 검색 지원.

**Query Parameters**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `status` | string | `active` \| `leave` \| `resigned` (공통코드 `EMPLOYMENT_STATUS`) |
| `department` | string | 부서명 (`departments.name`) |
| `department_id` | number | 부서 ID (`departments.id`) — `department`보다 우선 권장 |
| `deployment_status` | string | `deployed`(투입중) \| `bench`(벤치) — 공통코드 `DEPLOYMENT_STATUS`. `assignments` 기반 파생값(현재 투입 여부)으로 필터 |
| `search` | string | 이름 또는 이메일 검색 (부분일치) |
| `page` | number | 페이지 번호 (기본값: 1) |
| `limit` | number | 페이지당 건수 (기본값: 20) |

> `department`는 `departments` 마스터로 정규화되어 있다(`employees.department_id` FK). 응답의 `department` 필드는 조인된 부서명이며, 등록/수정 시 `department_id`(권장) 또는 `department`(부서명, 자동 매칭) 중 하나로 전달한다.

**Response**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "김민준",
      "email": "minjun.kim@peoplify.com",
      "phone": "010-1001-0001",
      "department": "개발팀",
      "position": "선임 개발자",
      "hire_date": "2021-03-02",
      "employment_status": "active",
      "skills": ["Java", "Spring", "AWS"]
    }
  ],
  "meta": { "total": 18, "page": 1, "limit": 20 }
}
```

---

### GET `/api/employees/:id`
직원 상세 + 기술스택 + 투입 이력.

**Response**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "김민준",
    "skills": ["Java", "Spring"],
    "assignment_history": [
      {
        "id": 1,
        "role": "백엔드 개발자",
        "rate_pct": 100,
        "start_date": "2024-01-01",
        "end_date": "2024-06-30",
        "project_name": "프로젝트명",
        "client": "고객사",
        "project_status": "active"
      }
    ]
  }
}
```

---

### POST `/api/employees`
직원 등록.

**Request Body**
```json
{
  "name": "홍길동",
  "email": "hong@peoplify.com",
  "phone": "010-0000-0000",
  "department": "개발팀",
  "position": "백엔드 개발자",
  "hire_date": "2024-03-01",
  "employment_status": "active",
  "skills": ["Java", "Spring"]
}
```

| 필드 | 필수 | 설명 |
|------|------|------|
| `name` | ✅ | 이름 |
| `employment_status` | | 기본값 `active` |
| `skills` | | 기본값 `[]` |

**Response** `201`
```json
{ "success": true, "data": { "id": 21, "name": "홍길동", "skills": ["Java", "Spring"], ... } }
```

---

### PUT `/api/employees/:id`
직원 정보 수정. `skills` 포함 시 전체 교체.

**Request Body** (수정할 필드만 전송)
```json
{
  "position": "시니어 개발자",
  "skills": ["Java", "Spring", "Kubernetes"]
}
```

**Response**
```json
{ "success": true, "data": { ...수정된 직원 정보 } }
```

---

### DELETE `/api/employees/:id`
직원 소프트 삭제 (`employment_status → 'resigned'`).

**Response**
```json
{ "success": true, "message": "직원이 퇴사 처리되었습니다." }
```

---

## 프로젝트 (Projects)

> 모든 엔드포인트 **인증 필요**

### GET `/api/projects`
프로젝트 목록 조회 + 기술스택 포함.

**Query Parameters**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `status` | string | `active` \| `complete` \| `planned` |

**Response**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "프로젝트명",
      "client": "고객사",
      "start_date": "2024-01-01",
      "end_date": "2024-12-31",
      "status": "active",
      "progress_pct": 60,
      "description": "프로젝트 설명",
      "tech_stack": ["React", "Node.js"]
    }
  ]
}
```

---

### GET `/api/projects/:id`
프로젝트 상세 + 기술스택 + 현재 투입인원.

**Response**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "프로젝트명",
    "tech_stack": ["React", "Node.js"],
    "assignments": [
      {
        "id": 1,
        "role": "프론트엔드 개발자",
        "rate_pct": 100,
        "start_date": "2024-01-01",
        "end_date": null,
        "employee_id": 2,
        "employee_name": "이서연",
        "department": "개발팀",
        "position": "프론트엔드 개발자"
      }
    ]
  }
}
```

---

### POST `/api/projects`
프로젝트 등록.

**Request Body**
```json
{
  "name": "신규 프로젝트",
  "client": "고객사명",
  "start_date": "2024-07-01",
  "end_date": "2025-06-30",
  "status": "planned",
  "progress_pct": 0,
  "description": "프로젝트 설명",
  "tech_stack": ["React", "Spring"]
}
```

| 필드 | 필수 | 설명 |
|------|------|------|
| `name` | ✅ | 프로젝트명 |
| `status` | | 기본값 `planned` |
| `progress_pct` | | 기본값 `0` |

**Response** `201`
```json
{ "success": true, "data": { "id": 6, "name": "신규 프로젝트", "tech_stack": [...], ... } }
```

---

### PUT `/api/projects/:id`
프로젝트 수정. `tech_stack` 포함 시 전체 교체.

**Request Body** (수정할 필드만 전송)
```json
{
  "progress_pct": 75,
  "status": "active"
}
```

**Response**
```json
{ "success": true, "data": { ...수정된 프로젝트 정보 } }
```

---

## 투입현황 (Assignments)

> 모든 엔드포인트 **인증 필요**

### GET `/api/assignments`
투입현황 목록. `is_current` 필드로 현재 투입 여부 확인 가능.

**Query Parameters**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `employee_id` | number | 특정 직원의 투입 이력 |
| `project_id` | number | 특정 프로젝트의 투입 인원 |
| `current_only` | `true` | 현재 투입 중인 것만 조회 |

**Response**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "role": "백엔드 개발자",
      "rate_pct": 100,
      "start_date": "2024-01-01",
      "end_date": null,
      "is_current": true,
      "employee_id": 1,
      "employee_name": "김민준",
      "department": "개발팀",
      "project_id": 1,
      "project_name": "프로젝트명",
      "client": "고객사"
    }
  ]
}
```

---

### POST `/api/assignments`
투입 등록. `employee_id`에 단일 숫자 또는 숫자 배열을 전달하면 해당 인원 수만큼 행을 bulk insert한다.

**Request Body**
```json
{
  "employee_id": [1, 2, 3],
  "project_id": 2,
  "role": "개발",
  "rate_pct": 100,
  "start_date": "2026-06-01",
  "end_date": "2026-12-31"
}
```

| 필드 | 필수 | 설명 |
|------|------|------|
| `employee_id` | ✅ | 단일 `number` 또는 `number[]` (다중 배정 지원) |
| `project_id` | ✅ | |
| `start_date` | ✅ | |
| `rate_pct` | | 기본값 `100` (투입률 %) |
| `end_date` | | 미입력 시 무기한 투입 |

**Response** `201`
```json
{ "success": true, "data": [{ "id": 19, "employee_id": 1, "project_id": 2, ... }, ...] }
```

---

### PUT `/api/assignments/:id`
투입 정보 수정 (역할, 투입률, 종료일만 수정 가능).

**Request Body**
```json
{
  "role": "테크 리드",
  "rate_pct": 80,
  "end_date": "2024-12-31"
}
```

**Response**
```json
{ "success": true, "data": { ...수정된 투입 정보 } }
```

---

### DELETE `/api/assignments/:id`
철수 처리 (`end_date → 오늘 날짜`로 업데이트).

**Response**
```json
{ "success": true, "message": "철수 처리되었습니다." }
```

---

## 월별 근무 보고 (Work Reports)

> 모든 엔드포인트 **인증 필요**
> `users`와 `employees`가 분리되어 있어, "내" 화면은 `employee_id`를 명시적으로 전달한다.
> 상태값: `submitted`(제출) · `approved`(승인) · `none`(미제출, 팀 현황에서만 사용)

### GET `/api/work-reports`
특정 직원의 월별 보고 이력 (최근순).

**Query Parameters**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `employee_id` | number | **필수**. 대상 직원 |
| `year` | number | 연도 필터 (선택) |

**Response**
```json
{
  "success": true,
  "data": [
    {
      "id": 4,
      "employee_id": 1,
      "year": 2026,
      "month": 5,
      "work_days": 22,
      "overtime_hours": 8,
      "note": null,
      "status": "submitted",
      "submitted_at": "2026-05-20T00:00:00.000Z",
      "approved_at": null
    }
  ]
}
```

---

### GET `/api/work-reports/team`
팀 보고 현황 (Manager 뷰). 재직(`active`) 직원 전체를 기준으로 해당 월 보고를 LEFT JOIN 하며, 보고가 없으면 `status: "none"`(미제출).

**Query Parameters**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `year` | number | **필수** |
| `month` | number | **필수** (1~12) |

**Response**
```json
{
  "success": true,
  "data": [
    {
      "employee_id": 1,
      "employee_name": "김민준",
      "department": "개발팀",
      "report_id": 4,
      "work_days": 22,
      "overtime_hours": 8,
      "status": "submitted"
    },
    {
      "employee_id": 3,
      "employee_name": "박지훈",
      "department": "개발팀",
      "report_id": null,
      "work_days": null,
      "overtime_hours": null,
      "status": "none"
    }
  ]
}
```

---

### POST `/api/work-reports`
보고 제출. 동일 `employee_id + year + month` 가 있으면 **덮어쓰기(upsert)** 되며 `status`는 `submitted`로 초기화된다.

**Request Body**
```json
{
  "employee_id": 1,
  "year": 2026,
  "month": 5,
  "work_days": 22,
  "overtime_hours": 8,
  "note": "현장 특이사항"
}
```

| 필드 | 필수 | 설명 |
|------|------|------|
| `employee_id` | ✅ | |
| `year` | ✅ | |
| `month` | ✅ | 1~12 |
| `work_days` | ✅ | 근무일수 |
| `overtime_hours` | | 기본값 `0` |
| `note` | | 현장 특이사항 |

**Response** `201`
```json
{ "success": true, "data": { "id": 4, "employee_id": 1, "year": 2026, "month": 5, "status": "submitted", ... } }
```

---

### PATCH `/api/work-reports/:id/status`
보고 승인/승인취소 (Manager).

**Request Body**
```json
{ "status": "approved" }
```

| 값 | 설명 |
|----|------|
| `approved` | 승인 (`approved_at` 자동 기록) |
| `submitted` | 승인 취소 (제출 상태로 되돌림) |

**Response**
```json
{ "success": true, "data": { ...수정된 보고 } }
```

---

### POST `/api/work-reports/notify`
해당 월 미제출자에게 알림 발송 (데모: 대상자 집계 후 반환).

**Request Body**
```json
{ "year": 2026, "month": 5 }
```

**Response**
```json
{
  "success": true,
  "message": "미제출자 2명에게 알림을 발송했습니다.",
  "data": [
    { "employee_id": 3, "employee_name": "박지훈" }
  ]
}
```

---

## 휴가 관리 (Leaves)

> 모든 엔드포인트 **인증 필요**
> 휴가 종류(`type`): `annual`(연차) · `half_day_am`(반차-오전) · `half_day_pm`(반차-오후) · `sick`(병가) · `bereavement`(경조사)
> 상태(`status`): `pending`(승인대기) · `approved`(승인) · `rejected`(반려)
> 연차 잔여 차감 대상은 `annual` · `half_day_am` · `half_day_pm` 이며 `sick` · `bereavement`는 제외된다.

### GET `/api/leaves`
특정 직원의 휴가 신청 내역 (최근순).

**Query Parameters**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `employee_id` | number | **필수** |
| `status` | string | 상태 필터 (선택) |
| `year` | number | 시작일 기준 연도 필터 (선택) |

**Response**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "employee_id": 1,
      "type": "annual",
      "start_date": "2026-05-28",
      "end_date": "2026-05-28",
      "days": "1.0",
      "reason": "연차 사용",
      "status": "pending"
    }
  ]
}
```

---

### GET `/api/leaves/balance`
연차 현황 (총부여/사용/잔여/신청중).

**Query Parameters**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `employee_id` | number | **필수** |
| `year` | number | 기본값: 올해 |

**Response**
```json
{
  "success": true,
  "data": {
    "year": 2026,
    "total_days": 15,
    "used_days": 6,
    "pending_days": 1,
    "remaining_days": 9
  }
}
```
- `used_days`: `approved` + 연차 차감 대상 휴가 일수 합계
- `pending_days`: `pending` + 연차 차감 대상 휴가 일수 합계 (신청중)
- `remaining_days`: `total_days - used_days` (신청중은 미차감)

---

### POST `/api/leaves`
휴가 신청. 신청 시 `status`는 항상 `pending`.

**Request Body**
```json
{
  "employee_id": 1,
  "type": "annual",
  "start_date": "2026-06-10",
  "end_date": "2026-06-11",
  "reason": "개인 사유"
}
```

| 필드 | 필수 | 설명 |
|------|------|------|
| `employee_id` | ✅ | |
| `type` | ✅ | 휴가 종류 |
| `start_date` | ✅ | |
| `end_date` | | 미입력 시 `start_date`와 동일 |
| `days` | | 미입력 시 자동 계산 (반차 `0.5`, 그 외 기간 일수) |
| `reason` | | 사유 |

**Response** `201`
```json
{ "success": true, "data": { "id": 6, "employee_id": 1, "type": "annual", "days": "2.0", "status": "pending", ... } }
```

---

### PATCH `/api/leaves/:id/status`
휴가 승인/반려 (Manager).

**Request Body**
```json
{ "status": "approved" }
```

| 값 | 설명 |
|----|------|
| `approved` | 승인 |
| `rejected` | 반려 |

**Response**
```json
{ "success": true, "data": { ...수정된 휴가 } }
```

---

### DELETE `/api/leaves/:id`
휴가 신청 취소. **승인 대기(`pending`) 상태만** 취소 가능 (행 삭제).

**Response**
```json
{ "success": true, "message": "휴가 신청이 취소되었습니다." }
```

승인/반려된 신청을 취소 시도하면 `400`.

---

## 통계 / 리포트 (Reports)

> 모든 엔드포인트 **인증 필요**
> 통계/리포트 화면(프로젝트별 투입 인원 · 투입률 추이 · 개인별 투입 요약)을 위한 집계 전용 API.
> "투입 겹침" 판정: `start_date <= 기간끝 AND (end_date IS NULL OR end_date >= 기간시작)`

### GET `/api/reports/project-deployment`
프로젝트별 투입 인원. 대상 월에 투입이 겹친 직원 수를 프로젝트별로 집계 (모든 상태의 프로젝트 포함).

**Query Parameters**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `year` | number | 대상 연도 (기본값: 올해) |
| `month` | number | 대상 월 1~12 (기본값: 이번 달) |

**Response**
```json
{
  "success": true,
  "data": {
    "year": 2026,
    "month": 5,
    "projects": [
      { "id": 1, "name": "A금융 차세대", "status": "active", "deployed_count": 7 },
      { "id": 4, "name": "D유통", "status": "planned", "deployed_count": 0 }
    ]
  }
}
```

---

### GET `/api/reports/deployment-trend`
월별 투입률 추이. 각 달에 투입이 겹친 직원 수를 재직(`active`) 직원 수로 나눈 백분율.

**Query Parameters**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `months` | number | 이번 달 포함 직전 N개월 (기본값: `6`, 범위 1~24) |

- `rate`: `ROUND(deployed / total * 100)` (재직자 0명이면 `0`)

**Response**
```json
{
  "success": true,
  "data": [
    { "year": 2026, "month": 1, "deployed": 12, "total": 18, "rate": 67 },
    { "year": 2026, "month": 5, "deployed": 15, "total": 18, "rate": 83 }
  ]
}
```

---

### GET `/api/reports/member-summary`
개인별 투입 요약. 재직 직원 전체 + 현재 투입 정보(투입률 높은 건 우선, 동률 시 최근 시작일).
현재 투입이 없으면 `status: "bench"`, 투입 관련 필드는 `null`.

**Response**
```json
{
  "success": true,
  "data": [
    {
      "employee_id": 1,
      "employee_name": "김민준",
      "department": "개발팀",
      "project_name": "A금융 차세대",
      "role": "PL",
      "rate_pct": 100,
      "start_date": "2025-03-01",
      "end_date": "2026-09-30",
      "status": "deployed"
    },
    {
      "employee_id": 2,
      "employee_name": "이서연",
      "department": "디자인",
      "project_name": null,
      "role": null,
      "rate_pct": null,
      "start_date": null,
      "end_date": null,
      "status": "bench"
    }
  ]
}
```

---

## 부서 (Departments)

> 모든 엔드포인트 **인증 필요**
> 부서는 조직 마스터(`departments`)로 관리되며 `employees.department_id`가 이를 참조한다(ON DELETE SET NULL).

### GET `/api/departments`
부서 목록 (`sort_order` → `id` 순).

**Query Parameters**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `use_yn` | `true` | 사용중(`use_yn=true`)인 부서만 조회 |

**Response**
```json
{
  "success": true,
  "data": [
    { "id": 1, "code": "DEV", "name": "개발팀", "description": null, "sort_order": 1, "use_yn": true }
  ]
}
```

---

### GET `/api/departments/:id`
부서 상세 + 소속 직원 수.

**Response**
```json
{ "success": true, "data": { "id": 1, "code": "DEV", "name": "개발팀", "sort_order": 1, "use_yn": true, "employee_count": 13 } }
```

---

### POST `/api/departments`
부서 등록.

**Request Body**
```json
{ "code": "INFRA", "name": "인프라팀", "description": "클라우드/인프라", "sort_order": 5, "use_yn": true }
```

| 필드 | 필수 | 설명 |
|------|------|------|
| `name` | ✅ | 부서명 (unique) |
| `code` | | 부서 코드 (unique) |
| `sort_order` | | 기본값 `0` |
| `use_yn` | | 기본값 `true` |

**Response** `201` — 생성된 부서. 코드/부서명 중복 시 `409`.

---

### PUT `/api/departments/:id`
부서 수정.

**Response** — 수정된 부서. 코드/부서명 중복 시 `409`.

---

### DELETE `/api/departments/:id`
부서 삭제. **소속 직원이 있으면 `400`** (재배정 후 삭제). 없으면 행 삭제.

**Response**
```json
{ "success": true, "message": "부서가 삭제되었습니다." }
```

---

## 공통코드 (Common Codes)

> 모든 엔드포인트 **인증 필요**
> SI 표준 코드그룹(`common_code_group`) + 코드상세(`common_code`) 구조. 조회는 기본적으로 `use_yn=true`만 반환하며 `?include_disabled=true`로 비활성 포함 가능.
> 기본 제공 그룹: `EMPLOYMENT_STATUS`(재직상태) · `DEPLOYMENT_STATUS`(투입상태) · `PROJECT_STATUS`(프로젝트상태) · `WORK_REPORT_STATUS`(근무보고상태) · `LEAVE_TYPE`(휴가종류) · `LEAVE_STATUS`(휴가상태)

### GET `/api/common-codes`
여러 그룹의 코드를 그룹별로 묶어서 반환.

**Query Parameters**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `groups` | string | 콤마구분 그룹코드 (예: `EMPLOYMENT_STATUS,LEAVE_TYPE`). 미지정 시 전체 그룹 |
| `include_disabled` | `true` | 비활성(`use_yn=false`) 코드 포함 |

**Response**
```json
{
  "success": true,
  "data": {
    "EMPLOYMENT_STATUS": [
      { "id": 1, "group_code": "EMPLOYMENT_STATUS", "code": "active", "code_name": "재직", "sort_order": 1, "use_yn": true, "extra1": null, "extra2": null, "extra3": null }
    ]
  }
}
```

---

### GET `/api/common-codes/:groupCode`
단일 그룹의 코드 배열 (`sort_order` 순). 그룹 미존재 시 `404`.

**Response**
```json
{
  "success": true,
  "data": [
    { "id": 1, "group_code": "EMPLOYMENT_STATUS", "code": "active",   "code_name": "재직", "sort_order": 1, "use_yn": true },
    { "id": 2, "group_code": "EMPLOYMENT_STATUS", "code": "leave",    "code_name": "휴직", "sort_order": 2, "use_yn": true },
    { "id": 3, "group_code": "EMPLOYMENT_STATUS", "code": "resigned", "code_name": "퇴직", "sort_order": 3, "use_yn": true }
  ]
}
```

---

### GET `/api/common-codes/groups`
코드그룹 목록.

**Response**
```json
{
  "success": true,
  "data": [
    { "group_code": "EMPLOYMENT_STATUS", "group_name": "재직상태", "description": "직원 재직 상태", "use_yn": true }
  ]
}
```

---

### POST `/api/common-codes/groups`
코드그룹 등록.

**Request Body**
```json
{ "group_code": "PRIORITY", "group_name": "우선순위", "description": "업무 우선순위", "use_yn": true }
```

| 필드 | 필수 | 설명 |
|------|------|------|
| `group_code` | ✅ | 그룹 코드 (PK, unique) |
| `group_name` | ✅ | 그룹명 |

**Response** `201`. `group_code` 중복 시 `409`.

---

### PUT `/api/common-codes/groups/:groupCode`
코드그룹 수정 (`group_name`, `description`, `use_yn`).

---

### DELETE `/api/common-codes/groups/:groupCode`
코드그룹 삭제. **하위 코드는 CASCADE 삭제**된다.

```json
{ "success": true, "message": "코드그룹이 삭제되었습니다." }
```

---

### POST `/api/common-codes`
코드 등록.

**Request Body**
```json
{ "group_code": "EMPLOYMENT_STATUS", "code": "sabbatical", "code_name": "안식휴직", "sort_order": 4, "use_yn": true, "extra1": "#888888" }
```

| 필드 | 필수 | 설명 |
|------|------|------|
| `group_code` | ✅ | 소속 그룹 (존재해야 함, 없으면 `400`) |
| `code` | ✅ | 코드값 (그룹 내 unique) |
| `code_name` | ✅ | 코드명 |
| `sort_order` | | 기본값 `0` |
| `use_yn` | | 기본값 `true` |
| `extra1~3` | | 확장 메타(뱃지 색상/아이콘 등) |

**Response** `201`. 그룹 내 `code` 중복 시 `409`.

---

### PUT `/api/common-codes/:id`
코드 수정 (코드상세 `id` 기준). `code`, `code_name`, `sort_order`, `use_yn`, `extra1~3` 수정 가능. 그룹 내 `code` 중복 시 `409`.

---

### DELETE `/api/common-codes/:id`
코드 삭제 (코드상세 `id` 기준).

```json
{ "success": true, "message": "코드가 삭제되었습니다." }
```

---

## 헬스체크

### GET `/api/health`
서버 상태 확인. **인증 불필요**

**Response**
```json
{ "status": "ok", "timestamp": "2024-05-28T00:00:00.000Z" }
```
