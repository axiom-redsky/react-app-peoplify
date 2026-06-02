---
name: common-code-si-pattern
description: User prefers server-driven SI common-code (코드그룹+코드상세) pattern over frontend constants
metadata:
  type: feedback
---

사용자는 부서/재직상태/투입상태 같은 코드성 값을 프론트 하드코딩/상수가 아니라 **서버 공통코드 조회 API**로 가져오는 것을 선호한다 (일반적인 SI 프로젝트 방식). 코드를 추가/수정하는 관리 UI용 CRUD API도 함께 원한다.

**Why:** 사용자는 SI 경험이 있고, 화면마다 하드코딩되어 라벨 불일치(예: `resign` vs `resigned`)가 생기는 것을 싫어한다. 서버가 코드의 단일 출처가 되길 원함.

**How to apply:** peoplify 서버(`server/`, Express+knex+Postgres)에 `common_code_group`+`common_code` 테이블과 `/api/common-codes` 조회/CRUD API를 구현해 둠. 부서는 별도 조직 마스터(`departments` 테이블, `/api/departments` CRUD)로 분리하고 `employees.department_id` FK로 정규화함. 새 코드성 필드가 생기면 공통코드 그룹으로 추가. 프론트엔드는 사용자가 직접 개발하므로 서버 측만 구현하면 됨.
