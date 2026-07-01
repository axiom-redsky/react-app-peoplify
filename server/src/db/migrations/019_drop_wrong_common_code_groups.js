/**
 * 018_move_wrong_common_codes_and_drop_tables.js
 *
 * 017에서 잘못 만든 복수형 공통코드 테이블 데이터를
 * 기존 014 공통코드 테이블 구조로 이관한 뒤,
 * 잘못 만든 테이블만 삭제한다.
 *
 * 유지:
 * - common_code_group
 * - common_code
 * - employees.job_role_code
 *
 * 삭제:
 * - common_codes
 * - common_code_groups
 */

exports.up = async function (knex) {
  const hasWrongGroupTable = await knex.schema.hasTable('common_code_groups');
  const hasWrongCodeTable = await knex.schema.hasTable('common_codes');

  /**
   * 1. 잘못 만든 common_code_groups 데이터를
   *    기존 common_code_group으로 이관
   *
   * wrong: common_code_groups.is_active
   * right: common_code_group.use_yn
   */
  if (hasWrongGroupTable) {
    const wrongGroups = await knex('common_code_groups').select(
      'group_code',
      'group_name',
      'description',
      'is_active',
    );

    if (wrongGroups.length > 0) {
      await knex('common_code_group')
        .insert(
          wrongGroups.map((group) => ({
            group_code: group.group_code,
            group_name: group.group_name,
            description: group.description,
            use_yn: group.is_active,
          })),
        )
        .onConflict('group_code')
        .merge({
          group_name: knex.raw('excluded.group_name'),
          description: knex.raw('excluded.description'),
          use_yn: knex.raw('excluded.use_yn'),
          updated_at: knex.fn.now(),
        });
    }
  }

  /**
   * 2. 잘못 만든 common_codes 데이터를
   *    기존 common_code로 이관
   *
   * wrong: common_codes.name
   * right: common_code.code_name
   *
   * wrong: common_codes.is_active
   * right: common_code.use_yn
   */
  if (hasWrongCodeTable) {
    const wrongCodes = await knex('common_codes').select(
      'group_code',
      'code',
      'name',
      'description',
      'sort_order',
      'is_active',
    );

    if (wrongCodes.length > 0) {
      await knex('common_code')
        .insert(
          wrongCodes.map((code) => ({
            group_code: code.group_code,
            code: code.code,
            code_name: code.name,
            sort_order: code.sort_order,
            use_yn: code.is_active,
            extra1: null,
            extra2: null,
            extra3: null,
          })),
        )
        .onConflict(['group_code', 'code'])
        .merge({
          code_name: knex.raw('excluded.code_name'),
          sort_order: knex.raw('excluded.sort_order'),
          use_yn: knex.raw('excluded.use_yn'),
          updated_at: knex.fn.now(),
        });
    }
  }

  /**
   * 3. 잘못 만든 테이블 삭제
   * common_codes가 common_code_groups를 FK로 참조하므로
   * 반드시 common_codes 먼저 삭제한다.
   */
  await knex.schema.dropTableIfExists('common_codes');
  await knex.schema.dropTableIfExists('common_code_groups');

  /**
   * 4. employees.job_role_code는 유지
   * 단, 혹시 컬럼이 없는 DB에서 실행될 경우를 대비해 보정
   */
  const hasJobRoleCode = await knex.schema.hasColumn('employees', 'job_role_code');

  if (!hasJobRoleCode) {
    await knex.schema.alterTable('employees', (table) => {
      table.string('job_role_code', 50).nullable();
      table.index(['job_role_code'], 'employees_job_role_code_idx');
    });
  }
};

exports.down = async function (knex) {
  /**
   * 이 cleanup 마이그레이션은 잘못 만든 테이블을 제거하는 목적이므로
   * down에서 common_code_group/common_code 데이터를 삭제하지 않는다.
   *
   * employees.job_role_code도 유지한다.
   */
};