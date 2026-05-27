exports.up = function (knex) {
  return knex.schema.createTable('employees', (table) => {
    table.increments('id').primary();
    table.string('name', 100).notNullable();
    table.string('email', 255).unique();
    table.string('phone', 20);
    table.string('department', 100);
    table.string('position', 100);
    table.date('hire_date');
    // 'active' | 'leave' | 'resigned'
    table.string('employment_status', 20).notNullable().defaultTo('active');
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('employees');
};
