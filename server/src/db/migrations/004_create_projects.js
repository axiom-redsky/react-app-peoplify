exports.up = function (knex) {
  return knex.schema.createTable('projects', (table) => {
    table.increments('id').primary();
    table.string('name', 255).notNullable();
    table.string('client', 255);
    table.date('start_date');
    table.date('end_date');
    // 'planned' | 'active' | 'complete'
    table.string('status', 20).notNullable().defaultTo('planned');
    table.integer('progress_pct').defaultTo(0);
    table.text('description');
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('projects');
};
