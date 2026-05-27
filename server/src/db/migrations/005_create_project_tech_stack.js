exports.up = function (knex) {
  return knex.schema.createTable('project_tech_stack', (table) => {
    table.increments('id').primary();
    table
      .integer('project_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('projects')
      .onDelete('CASCADE');
    table.string('tech', 100).notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('project_tech_stack');
};
