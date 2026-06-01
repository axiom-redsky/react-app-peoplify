exports.up = function (knex) {
  return knex.schema.createTable('leave_balances', (table) => {
    table.increments('id').primary();
    table
      .integer('employee_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('employees')
      .onDelete('CASCADE');
    table.integer('year').notNullable();
    table.decimal('total_days', 4, 1).notNullable().defaultTo(15); // 연간 부여 연차
    table.timestamps(true, true);

    // 직원별 연도 1건
    table.unique(['employee_id', 'year']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('leave_balances');
};
