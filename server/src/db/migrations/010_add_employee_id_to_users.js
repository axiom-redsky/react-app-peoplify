exports.up = function (knex) {
  return knex.schema.alterTable('users', (table) => {
    // 로그인 사용자(users)와 직원(employees) 연결.
    // "내" 화면(예: 월별 근무 보고)에서 employee_id를 식별하기 위함. nullable(관리 전용 계정 허용).
    table
      .integer('employee_id')
      .nullable()
      .references('id')
      .inTable('employees')
      .onDelete('SET NULL');
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('users', (table) => {
    table.dropForeign('employee_id');
    table.dropColumn('employee_id');
  });
};
