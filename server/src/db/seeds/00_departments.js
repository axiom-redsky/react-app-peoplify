exports.seed = async function (knex) {
  // employees.department_id 는 ON DELETE SET NULL 이라 삭제 시 직원은 미배정으로 풀린다.
  await knex('departments').del();

  await knex('departments').insert([
    { id: 1, code: 'DEV',    name: '개발팀',   sort_order: 1 },
    { id: 2, code: 'PLAN',   name: '기획팀',   sort_order: 2 },
    { id: 3, code: 'DESIGN', name: '디자인팀', sort_order: 3 },
    { id: 4, code: 'QA',     name: 'QA팀',     sort_order: 4 },
  ]);

  // 명시적 id 삽입 후 시퀀스 갱신 (신규 등록 시 PK 충돌 방지)
  await knex.raw("SELECT setval('departments_id_seq', (SELECT MAX(id) FROM departments))");
};
