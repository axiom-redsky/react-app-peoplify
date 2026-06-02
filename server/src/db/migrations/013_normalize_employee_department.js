// employees.department(문자열) → departments 마스터로 정규화.
// 기존 데이터를 보존하기 위해 부서명을 departments에 채운 뒤 department_id로 연결하고
// 문자열 컬럼을 제거한다. (응답 계약은 라우트에서 departments.name을 조인해 그대로 유지)
exports.up = async function (knex) {
  // 1. 기존 직원의 부서명을 departments 마스터에 멱등 삽입
  await knex.raw(`
    INSERT INTO departments (name)
    SELECT DISTINCT department
    FROM employees
    WHERE department IS NOT NULL AND department <> ''
    ON CONFLICT (name) DO NOTHING
  `);

  // 2. FK 컬럼 추가 (부서 삭제 시 직원은 미배정 상태로 — SET NULL)
  await knex.schema.alterTable('employees', (table) => {
    table
      .integer('department_id')
      .unsigned()
      .references('id')
      .inTable('departments')
      .onDelete('SET NULL');
  });

  // 3. 부서명 기준 백필
  await knex.raw(`
    UPDATE employees e
    SET department_id = d.id
    FROM departments d
    WHERE d.name = e.department
  `);

  // 4. 기존 문자열 컬럼 제거
  await knex.schema.alterTable('employees', (table) => {
    table.dropColumn('department');
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable('employees', (table) => {
    table.string('department', 100);
  });

  await knex.raw(`
    UPDATE employees e
    SET department = d.name
    FROM departments d
    WHERE d.id = e.department_id
  `);

  await knex.schema.alterTable('employees', (table) => {
    table.dropColumn('department_id');
  });
};
