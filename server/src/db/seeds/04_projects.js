exports.seed = async function (knex) {
  await knex('project_tech_stack').del();
  await knex('assignments').del();
  await knex('projects').del();

  await knex('projects').insert([
    {
      id: 1,
      name: 'A금융 차세대 코어뱅킹',
      client: 'A금융그룹',
      start_date: '2025-03-01',
      end_date: '2026-12-31',
      status: 'active',
      progress_pct: 55,
      description: '차세대 코어뱅킹 시스템 구축 및 MSA 전환',
    },
    {
      id: 2,
      name: 'B공공기관 ERP 구축',
      client: 'B공공기관',
      start_date: '2025-06-01',
      end_date: '2026-06-30',
      status: 'active',
      progress_pct: 75,
      description: '전사 ERP 시스템 구축 (HR, 회계, 구매)',
    },
    {
      id: 3,
      name: 'C제조 MES 고도화',
      client: 'C제조',
      start_date: '2024-12-01',
      end_date: '2026-07-31',
      status: 'active',
      progress_pct: 85,
      description: '스마트팩토리 MES 고도화 및 IoT 연동',
    },
    {
      id: 4,
      name: 'D보험 차세대시스템',
      client: 'D보험그룹',
      start_date: '2026-08-01',
      end_date: '2027-12-31',
      status: 'planned',
      progress_pct: 0,
      description: '차세대 보험코어 시스템 구축',
    },
    {
      id: 5,
      name: 'E통신 데이터 플랫폼',
      client: 'E통신',
      start_date: '2024-01-01',
      end_date: '2025-12-31',
      status: 'complete',
      progress_pct: 100,
      description: '빅데이터 플랫폼 구축 및 실시간 분석 시스템',
    },
  ]);

  await knex.raw("SELECT setval('projects_id_seq', (SELECT MAX(id) FROM projects))");
};
