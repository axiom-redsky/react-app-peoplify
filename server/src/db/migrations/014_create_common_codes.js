// 공통코드 — SI 표준 패턴(코드그룹 + 코드상세).
exports.up = async function (knex) {
  await knex.schema.createTable('common_code_group', (table) => {
    table.string('group_code', 50).primary();           // 예: 'EMPLOYMENT_STATUS'
    table.string('group_name', 100).notNullable();       // 예: '재직상태'
    table.string('description', 255);
    table.boolean('use_yn').notNullable().defaultTo(true);
    table.timestamps(true, true);
  });

  await knex.schema.createTable('common_code', (table) => {
    table.increments('id').primary();
    table
      .string('group_code', 50)
      .notNullable()
      .references('group_code')
      .inTable('common_code_group')
      .onDelete('CASCADE');
    table.string('code', 50).notNullable();              // 예: 'active'
    table.string('code_name', 100).notNullable();         // 예: '재직'
    table.integer('sort_order').notNullable().defaultTo(0);
    table.boolean('use_yn').notNullable().defaultTo(true);
    // 확장 메타(뱃지 색상, 아이콘 등 화면 부가정보 보관용)
    table.string('extra1', 255);
    table.string('extra2', 255);
    table.string('extra3', 255);
    table.timestamps(true, true);

    table.unique(['group_code', 'code']);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('common_code');
  await knex.schema.dropTableIfExists('common_code_group');
};
