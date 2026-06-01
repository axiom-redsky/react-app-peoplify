exports.up = function (knex) {
  return knex.schema.createTable('work_reports', (table) => {
    table.increments('id').primary();
    table
      .integer('employee_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('employees')
      .onDelete('CASCADE');
    table.integer('year').notNullable();
    table.integer('month').notNullable(); // 1 ~ 12
    table.integer('work_days').notNullable();
    table.integer('overtime_hours').notNullable().defaultTo(0);
    table.text('note'); // 현장 특이사항
    // 'submitted' | 'approved'  (미제출은 행이 없음)
    table.string('status', 20).notNullable().defaultTo('submitted');
    table.timestamp('submitted_at').defaultTo(knex.fn.now());
    table.timestamp('approved_at');
    table.timestamps(true, true);

    // 직원별 월 1건
    table.unique(['employee_id', 'year', 'month']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('work_reports');
};
