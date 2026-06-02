// 데모 계정 ↔ 직원 연결 (admin→1, user→2).
// 같은 매핑을 시드(10_link_users_employees)에도 두지만, NAS 배포 스케줄러는 seed 를 실행하지 않고
// 서버 Dockerfile CMD 가 `knex migrate:latest` 만 자동 실행하므로, 마이그레이션으로도 두어
// 자동 · 1회 · 비파괴적으로 적용되게 한다.
const LINKS = [
  { email: 'admin@peoplify.com', employee_id: 1 },
  { email: 'user@peoplify.com', employee_id: 2 },
];

exports.up = async function (knex) {
  for (const { email, employee_id } of LINKS) {
    // 직원이 아직 없으면(최초 배포 · seed 이전) 건너뜀 — 이후 seed:nas 에서 연결된다.
    const emp = await knex('employees').where({ id: employee_id }).first();
    if (!emp) continue;
    // 이미 연결돼 있으면 덮어쓰지 않음(멱등, 수동 변경 존중).
    await knex('users').where({ email }).whereNull('employee_id').update({ employee_id });
  }
};

exports.down = async function (knex) {
  await knex('users')
    .whereIn(
      'email',
      LINKS.map((l) => l.email),
    )
    .update({ employee_id: null });
};
