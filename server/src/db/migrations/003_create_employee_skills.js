exports.up = function (knex) {
  return knex.schema.createTable('employee_skills', (table) => {
    table.increments('id').primary();
    table
      .integer('employee_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('employees')
      .onDelete('CASCADE');
    table.string('skill', 100).notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('employee_skills');
};
