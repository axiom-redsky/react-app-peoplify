# Peoplify API 명세

**Base URL** `http://localhost:4000`  
**인증** 로그인 후 발급된 JWT를 `Authorization: Bearer <token>` 헤더에 포함  
**응답 공통 형식** `{ success: true, data: ... }` / 실패 시 `{ success: false, message: "..." }`

---

## 인증 (Auth)

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
      "role": "admin"
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
    "user": { "id": 1, "name": "관리자", "email": "admin@peoplify.com", "role": "admin" }
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
| `status` | string | `active` \| `leave` \| `resigned` |
| `department` | string | 부서명 |
| `search` | string | 이름 또는 이메일 검색 (부분일치) |
| `page` | number | 페이지 번호 (기본값: 1) |
| `limit` | number | 페이지당 건수 (기본값: 20) |

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

## 헬스체크

### GET `/api/health`
서버 상태 확인. **인증 불필요**

**Response**
```json
{ "status": "ok", "timestamp": "2024-05-28T00:00:00.000Z" }
```
