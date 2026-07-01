/**
 * 017_create_common_codes.js
 *
 * 공통코드 테이블 생성
 * employees 테이블에 job_role_code 추가
 */

exports.up = async function (knex) {
  // 1. 공통코드 그룹 테이블
  await knex.schema.createTable('common_code_groups', (table) => {
    table.string('group_code', 50).primary(); // 예: JOB_ROLE, POSITION
    table.string('group_name', 100).notNullable(); // 예: 직군/업무역할
    table.string('description', 255);
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamps(true, true);
  });

  // 2. 공통코드 상세 테이블
  await knex.schema.createTable('common_codes', (table) => {
    table.increments('id').primary();

    table.string('group_code', 50).notNullable();
    table.string('code', 50).notNullable();
    table.string('name', 100).notNullable();

    table.string('description', 255);
    table.integer('sort_order').notNullable().defaultTo(0);
    table.boolean('is_active').notNullable().defaultTo(true);

    table.timestamps(true, true);

    table
      .foreign('group_code', 'common_codes_group_code_fk')
      .references('group_code')
      .inTable('common_code_groups')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');

    table.unique(['group_code', 'code'], 'common_codes_group_code_code_unique');
    table.index(['group_code', 'is_active'], 'common_codes_group_active_idx');
  });

  // 3. employees 테이블에 직군/업무역할 코드 추가
  await knex.schema.alterTable('employees', (table) => {
    table.string('job_role_code', 50).nullable();
    table.index(['job_role_code'], 'employees_job_role_code_idx');
  });

  // 4. 공통코드 그룹 기본 데이터
  await knex('common_code_groups').insert([
    {
      group_code: 'JOB_ROLE',
      group_name: '직군/업무역할',
      description: '직원의 직군 또는 실제 업무 역할',
    },
    {
      group_code: 'POSITION',
      group_name: '직급',
      description: '사원, 대리, 과장 등 인사상 직급',
    },
    {
      group_code: 'EMPLOYMENT_STATUS',
      group_name: '재직상태',
      description: '재직, 휴직, 퇴사 상태',
    },
    {
      group_code: 'PROJECT_STATUS',
      group_name: '프로젝트 상태',
      description: '프로젝트 진행 상태',
    },
    {
      group_code: 'PROJECT_ASSIGN_ROLE',
      group_name: '프로젝트 투입 역할',
      description: '프로젝트 투입 시 역할',
    },
  ]);

  // 5. 공통코드 기본 데이터
  await knex('common_codes').insert([
    // 직군/업무역할
    { group_code: 'JOB_ROLE', code: 'PM', name: '프로젝트 관리자', sort_order: 1 },
    { group_code: 'JOB_ROLE', code: 'BA', name: '업무 분석가', sort_order: 2 },
    { group_code: 'JOB_ROLE', code: 'FULLSTACK_DEV', name: '풀스택 개발자', sort_order: 3 },
    { group_code: 'JOB_ROLE', code: 'FRONTEND_DEV', name: '프론트엔드 개발자', sort_order: 4 },
    { group_code: 'JOB_ROLE', code: 'BACKEND_DEV', name: '백엔드 개발자', sort_order: 5 },
    { group_code: 'JOB_ROLE', code: 'DBA', name: 'DBA', sort_order: 6 },
    { group_code: 'JOB_ROLE', code: 'UIUX_DESIGNER', name: 'UI/UX 디자이너', sort_order: 7 },
    { group_code: 'JOB_ROLE', code: 'PUBLISHER', name: '퍼블리셔', sort_order: 8 },
    { group_code: 'JOB_ROLE', code: 'QA_TESTER', name: 'QA/테스터', sort_order: 9 },

    // 직급
    { group_code: 'POSITION', code: 'STAFF', name: '사원', sort_order: 1 },
    { group_code: 'POSITION', code: 'ASSISTANT_MANAGER', name: '대리', sort_order: 2 },
    { group_code: 'POSITION', code: 'MANAGER', name: '과장', sort_order: 3 },
    { group_code: 'POSITION', code: 'DEPUTY_GENERAL_MANAGER', name: '차장', sort_order: 4 },
    { group_code: 'POSITION', code: 'GENERAL_MANAGER', name: '부장', sort_order: 5 },

    // 재직상태
    { group_code: 'EMPLOYMENT_STATUS', code: 'active', name: '재직', sort_order: 1 },
    { group_code: 'EMPLOYMENT_STATUS', code: 'leave', name: '휴직', sort_order: 2 },
    { group_code: 'EMPLOYMENT_STATUS', code: 'resigned', name: '퇴사', sort_order: 3 },

    // 프로젝트 상태
    { group_code: 'PROJECT_STATUS', code: 'planned', name: '예정', sort_order: 1 },
    { group_code: 'PROJECT_STATUS', code: 'in_progress', name: '진행중', sort_order: 2 },
    { group_code: 'PROJECT_STATUS', code: 'completed', name: '종료', sort_order: 3 },
    { group_code: 'PROJECT_STATUS', code: 'hold', name: '보류', sort_order: 4 },

    // 프로젝트 투입 역할
    { group_code: 'PROJECT_ASSIGN_ROLE', code: 'PM', name: 'PM', sort_order: 1 },
    { group_code: 'PROJECT_ASSIGN_ROLE', code: 'PL', name: 'PL', sort_order: 2 },
    { group_code: 'PROJECT_ASSIGN_ROLE', code: 'DEV', name: '개발자', sort_order: 3 },
    { group_code: 'PROJECT_ASSIGN_ROLE', code: 'PUBLISHER_DESIGNER', name: '퍼블리셔/디자인', sort_order: 4 },
    { group_code: 'PROJECT_ASSIGN_ROLE', code: 'BUSINESS_MANAGER', name: '사업관리', sort_order: 5 },
    { group_code: 'PROJECT_ASSIGN_ROLE', code: 'QA_TESTER', name: 'QA/테스터', sort_order: 6 },
    { group_code: 'PROJECT_ASSIGN_ROLE', code: 'ETC', name: '기타', sort_order: 7 },
  ]);
};

exports.down = async function (knex) {
  await knex.schema.alterTable('employees', (table) => {
    table.dropIndex(['job_role_code'], 'employees_job_role_code_idx');
    table.dropColumn('job_role_code');
  });

  await knex.schema.dropTableIfExists('common_codes');
  await knex.schema.dropTableIfExists('common_code_groups');
};