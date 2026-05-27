exports.seed = async function (knex) {
  await knex('employee_skills').del();

  await knex('employee_skills').insert([
    // 김민준 (1)
    { employee_id: 1,  skill: 'Java' },
    { employee_id: 1,  skill: 'Spring Boot' },
    { employee_id: 1,  skill: 'MSA' },
    { employee_id: 1,  skill: 'Kubernetes' },
    // 이서연 (2)
    { employee_id: 2,  skill: 'React' },
    { employee_id: 2,  skill: 'TypeScript' },
    { employee_id: 2,  skill: 'Next.js' },
    // 박지훈 (3)
    { employee_id: 3,  skill: 'Node.js' },
    { employee_id: 3,  skill: 'PostgreSQL' },
    { employee_id: 3,  skill: 'Redis' },
    // 강현우 (4)
    { employee_id: 4,  skill: 'Oracle' },
    { employee_id: 4,  skill: 'PostgreSQL' },
    { employee_id: 4,  skill: 'MySQL' },
    { employee_id: 4,  skill: '데이터 모델링' },
    // 윤지수 (5)
    { employee_id: 5,  skill: 'PMP' },
    { employee_id: 5,  skill: 'Jira' },
    { employee_id: 5,  skill: 'Confluence' },
    // 조현성 (6)
    { employee_id: 6,  skill: 'React' },
    { employee_id: 6,  skill: 'Node.js' },
    { employee_id: 6,  skill: 'AWS' },
    // 서민아 (7)
    { employee_id: 7,  skill: 'BPR' },
    { employee_id: 7,  skill: 'EA' },
    { employee_id: 7,  skill: 'SQL' },
    // 권태양 (8)
    { employee_id: 8,  skill: 'Java' },
    { employee_id: 8,  skill: 'Spring Boot' },
    { employee_id: 8,  skill: 'Kafka' },
    // 나도연 (9)
    { employee_id: 9,  skill: 'Figma' },
    { employee_id: 9,  skill: 'Zeplin' },
    { employee_id: 9,  skill: 'Adobe XD' },
    // 신하은 (10)
    { employee_id: 10, skill: 'Python' },
    { employee_id: 10, skill: 'Django' },
    { employee_id: 10, skill: 'PostgreSQL' },
    // 오준혁 (11)
    { employee_id: 11, skill: 'Vue.js' },
    { employee_id: 11, skill: 'Java' },
    { employee_id: 11, skill: 'MySQL' },
    // 유선미 (12)
    { employee_id: 12, skill: 'Selenium' },
    { employee_id: 12, skill: 'Jest' },
    { employee_id: 12, skill: 'Postman' },
    // 문지후 (13)
    { employee_id: 13, skill: 'Java' },
    { employee_id: 13, skill: 'Spring Boot' },
    { employee_id: 13, skill: 'Oracle' },
    // 최유나 (14)
    { employee_id: 14, skill: 'PMP' },
    { employee_id: 14, skill: 'MS Project' },
    { employee_id: 14, skill: 'Agile' },
    // 한예은 (15)
    { employee_id: 15, skill: 'React' },
    { employee_id: 15, skill: 'TypeScript' },
    { employee_id: 15, skill: 'Tailwind CSS' },
    // 정다은 (16) — 벤치
    { employee_id: 16, skill: 'Angular' },
    { employee_id: 16, skill: 'TypeScript' },
    { employee_id: 16, skill: 'SCSS' },
    // 임동현 (17) — 벤치
    { employee_id: 17, skill: 'Go' },
    { employee_id: 17, skill: 'Docker' },
    { employee_id: 17, skill: 'gRPC' },
    // 황정우 (18) — 벤치
    { employee_id: 18, skill: 'Java' },
    { employee_id: 18, skill: '시스템 분석' },
    { employee_id: 18, skill: 'UML' },
  ]);
};
