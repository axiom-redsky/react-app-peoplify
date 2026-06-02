exports.up = function (knex) {
  return knex.schema.createTable('departments', (table) => {
    table.increments('id').primary();
    table.string('code', 50).unique();              // 부서 코드 (예: 'DEV') — 선택
    table.string('name', 100).notNullable().unique(); // 부서명 (예: '개발팀')
    table.string('description', 255);
    table.integer('sort_order').notNullable().defaultTo(0);
    table.boolean('use_yn').notNullable().defaultTo(true);
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('departments');
};
