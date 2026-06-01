// 화면(휴가 관리) 기준 시드 — 김민준(id:1)의 신청 내역
exports.seed = async function (knex) {
  await knex('leaves').del();

  await knex('leaves').insert([
    // 연차 현황(사용 6일)에 맞춘 승인 연차/반차 이력
    { employee_id: 1, type: 'annual',      start_date: '2026-02-10', end_date: '2026-02-12', days: 3,   reason: '개인 사유', status: 'approved' },
    { employee_id: 1, type: 'sick',        start_date: '2026-04-20', end_date: '2026-04-21', days: 2,   reason: '병가',     status: 'approved' },
    { employee_id: 1, type: 'annual',      start_date: '2026-05-01', end_date: '2026-05-02', days: 2,   reason: '가족 행사', status: 'approved' },
    { employee_id: 1, type: 'half_day_pm', start_date: '2026-03-06', end_date: '2026-03-06', days: 0.5, reason: '개인 용무', status: 'approved' },
    { employee_id: 1, type: 'half_day_am', start_date: '2026-05-15', end_date: '2026-05-15', days: 0.5, reason: '병원 방문', status: 'approved' },
    // 신청중(승인대기)
    { employee_id: 1, type: 'annual',      start_date: '2026-05-28', end_date: '2026-05-28', days: 1,   reason: '연차 사용', status: 'pending' },
  ]);

  await knex.raw("SELECT setval('leaves_id_seq', (SELECT MAX(id) FROM leaves))");
};
