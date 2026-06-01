// 재직 직원(1~18)의 2026년 연차 부여 — 전원 15일
exports.seed = async function (knex) {
  await knex('leave_balances').del();

  const rows = [];
  for (let employeeId = 1; employeeId <= 18; employeeId += 1) {
    rows.push({ employee_id: employeeId, year: 2026, total_days: 15 });
  }

  await knex('leave_balances').insert(rows);

  await knex.raw("SELECT setval('leave_balances_id_seq', (SELECT MAX(id) FROM leave_balances))");
};
