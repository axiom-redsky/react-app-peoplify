exports.up = function (knex) {
  return knex.schema.createTable('leaves', (table) => {
    table.increments('id').primary();
    table
      .integer('employee_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('employees')
      .onDelete('CASCADE');
    // 'annual' | 'half_day_am' | 'half_day_pm' | 'sick' | 'bereavement'
    table.string('type', 20).notNullable();
    table.date('start_date').notNullable();
    table.date('end_date').notNullable();
    table.decimal('days', 3, 1).notNullable(); // 0.5 단위 지원
    table.text('reason');
    // 'pending' | 'approved' | 'rejected'
    table.string('status', 20).notNullable().defaultTo('pending');
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('leaves');
};
