// 화면(월별 근무 보고) 기준 시드 — 2026년 5월 현황 + 김민준(id:1) 최근 이력
// 미제출 직원(박지훈 등)은 행을 만들지 않음 → 팀 현황에서 '미제출'로 표시됨
exports.seed = async function (knex) {
  await knex('work_reports').del();

  await knex('work_reports').insert([
    // ── 김민준(1) 최근 이력 ─────────────────────────────────────────────
    { employee_id: 1, year: 2026, month: 2, work_days: 20, overtime_hours: 12, status: 'approved', approved_at: knex.fn.now() },
    { employee_id: 1, year: 2026, month: 3, work_days: 21, overtime_hours: 0,  status: 'approved', approved_at: knex.fn.now() },
    { employee_id: 1, year: 2026, month: 4, work_days: 22, overtime_hours: 4,  status: 'approved', approved_at: knex.fn.now() },
    { employee_id: 1, year: 2026, month: 5, work_days: 22, overtime_hours: 8,  status: 'submitted' },

    // ── 2026년 5월 팀 현황 ──────────────────────────────────────────────
    { employee_id: 2,  year: 2026, month: 5, work_days: 22, overtime_hours: 0, status: 'approved', approved_at: knex.fn.now() }, // 이서연
    { employee_id: 14, year: 2026, month: 5, work_days: 20, overtime_hours: 0, status: 'submitted' },                            // 최유나
    { employee_id: 16, year: 2026, month: 5, work_days: 22, overtime_hours: 4, status: 'approved', approved_at: knex.fn.now() }, // 정다은
    // 박지훈(3) 등 나머지는 미제출
  ]);

  await knex.raw("SELECT setval('work_reports_id_seq', (SELECT MAX(id) FROM work_reports))");
};
