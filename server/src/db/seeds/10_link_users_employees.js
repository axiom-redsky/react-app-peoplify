exports.seed = async function (knex) {
  // users ↔ employees 연결. employees 시드(02) 이후 실행되어야 하므로 별도 시드로 분리.
  // 데모 매핑: admin → 김민준(1), user → 이서연(2)
  await knex('users').where({ email: 'admin@peoplify.com' }).update({ employee_id: 1 });
  await knex('users').where({ email: 'user@peoplify.com' }).update({ employee_id: 2 });
};
