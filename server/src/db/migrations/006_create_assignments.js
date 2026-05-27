exports.up = function (knex) {
  return knex.schema.createTable('assignments', (table) => {
    table.increments('id').primary();
    table
      .integer('employee_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('employees')
      .onDelete('CASCADE');
    table
      .integer('project_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('projects')
      .onDelete('CASCADE');
    table.string('role', 100);
    table.integer('rate_pct').defaultTo(100);
    table.date('start_date').notNullable();
    table.date('end_date');
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('assignments');
};
