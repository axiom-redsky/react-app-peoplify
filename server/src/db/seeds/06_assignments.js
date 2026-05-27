// 오늘 기준 (2026-05-27) 활성 투입 15건 + 과거 이력 포함
// 30일 내 철수 예정: 윤지수(5) D-14, 나도연(9) D-24
exports.seed = async function (knex) {
  await knex('assignments').del();

  await knex('assignments').insert([
    // ── A금융 차세대 코어뱅킹 (project_id: 1) ──────────────────────────
    { id: 1,  employee_id: 1,  project_id: 1, role: '백엔드 아키텍트',   rate_pct: 100, start_date: '2025-03-01', end_date: null },
    { id: 2,  employee_id: 2,  project_id: 1, role: '프론트엔드 개발',   rate_pct: 100, start_date: '2025-03-01', end_date: null },
    { id: 3,  employee_id: 3,  project_id: 1, role: '백엔드 개발',       rate_pct: 100, start_date: '2025-06-01', end_date: null },
    { id: 4,  employee_id: 4,  project_id: 1, role: 'DB 설계/관리',      rate_pct: 100, start_date: '2025-03-01', end_date: null },
    // 윤지수: 2026-06-10 철수 예정 (D-14)
    { id: 5,  employee_id: 5,  project_id: 1, role: 'PM',               rate_pct: 100, start_date: '2025-03-01', end_date: '2026-06-10' },

    // ── B공공기관 ERP 구축 (project_id: 2) ──────────────────────────────
    { id: 6,  employee_id: 6,  project_id: 2, role: '풀스택 개발',       rate_pct: 100, start_date: '2025-06-01', end_date: null },
    { id: 7,  employee_id: 7,  project_id: 2, role: '업무 분석',         rate_pct: 100, start_date: '2025-06-01', end_date: null },
    { id: 8,  employee_id: 8,  project_id: 2, role: '백엔드 개발',       rate_pct: 100, start_date: '2025-06-01', end_date: null },
    // 나도연: 2026-06-20 철수 예정 (D-24)
    { id: 9,  employee_id: 9,  project_id: 2, role: 'UI/UX 디자인',      rate_pct: 100, start_date: '2025-08-01', end_date: '2026-06-20' },

    // ── C제조 MES 고도화 (project_id: 3) ────────────────────────────────
    { id: 10, employee_id: 10, project_id: 3, role: '백엔드 개발',       rate_pct: 100, start_date: '2024-12-01', end_date: null },
    { id: 11, employee_id: 11, project_id: 3, role: '풀스택 개발',       rate_pct: 100, start_date: '2024-12-01', end_date: null },
    { id: 12, employee_id: 12, project_id: 3, role: 'QA',               rate_pct: 100, start_date: '2025-03-01', end_date: null },
    { id: 13, employee_id: 13, project_id: 3, role: '백엔드 개발',       rate_pct: 100, start_date: '2025-03-01', end_date: null },
    { id: 14, employee_id: 14, project_id: 3, role: 'PM',               rate_pct: 100, start_date: '2025-03-01', end_date: null },
    { id: 15, employee_id: 15, project_id: 3, role: '프론트엔드 개발',   rate_pct: 100, start_date: '2025-06-01', end_date: null },

    // ── E통신 과거 이력 (완료 프로젝트, project_id: 5) ──────────────────
    { id: 16, employee_id: 16, project_id: 5, role: '프론트엔드 개발',   rate_pct: 100, start_date: '2024-01-01', end_date: '2025-12-31' },
    { id: 17, employee_id: 17, project_id: 5, role: '백엔드 개발',       rate_pct: 100, start_date: '2024-06-01', end_date: '2025-12-31' },
    { id: 18, employee_id: 18, project_id: 5, role: '시스템 분석',       rate_pct: 100, start_date: '2024-01-01', end_date: '2025-12-31' },
  ]);
};
