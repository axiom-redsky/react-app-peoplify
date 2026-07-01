/**
 * 003_add_job_role_code_to_employees.js
 *
 * employees 테이블에 직군/업무역할 코드 컬럼 추가
 */

exports.up = async function (knex) {
  await knex.schema.alterTable('employees', (table) => {
    // 공통코드 그룹 JOB_ROLE의 code 값을 저장
    // 예: BACKEND_DEV, FULLSTACK_DEV, DBA, UIUX_DESIGNER
    table.string('job_role_code', 50).nullable();

    table.index(['job_role_code'], 'employees_job_role_code_idx');
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable('employees', (table) => {
    table.dropIndex(['job_role_code'], 'employees_job_role_code_idx');
    table.dropColumn('job_role_code');
  });
};