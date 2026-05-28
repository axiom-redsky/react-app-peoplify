exports.seed = async function (knex) {
  await knex('employee_skills').del();
  await knex('assignments').del();
  await knex('employees').del();

  await knex('employees').insert([
    // ── 투입 중 (active, 현재 assignment 있음) ───────────────────────────
    { id: 1,  name: '김민준', email: 'minjun.kim@peoplify.com',   phone: '010-1001-0001', department: '개발팀', position: '선임 개발자',       hire_date: '2021-03-02', employment_status: 'active' },
    { id: 2,  name: '이서연', email: 'seoyeon.lee@peoplify.com',  phone: '010-1001-0002', department: '개발팀', position: '프론트엔드 개발자', hire_date: '2022-01-10', employment_status: 'active' },
    { id: 3,  name: '박지훈', email: 'jihun.park@peoplify.com',   phone: '010-1001-0003', department: '개발팀', position: '백엔드 개발자',     hire_date: '2020-07-15', employment_status: 'active' },
    { id: 4,  name: '강현우', email: 'hyunwoo.kang@peoplify.com', phone: '010-1001-0004', department: '개발팀', position: 'DBA',              hire_date: '2019-05-20', employment_status: 'active' },
    { id: 5,  name: '윤지수', email: 'jisu.yoon@peoplify.com',    phone: '010-1001-0005', department: '기획팀', position: '프로젝트 관리자',   hire_date: '2018-09-01', employment_status: 'active' },
    { id: 6,  name: '조현성', email: 'hyunsung.jo@peoplify.com',  phone: '010-1001-0006', department: '개발팀', position: '풀스택 개발자',     hire_date: '2021-11-08', employment_status: 'active' },
    { id: 7,  name: '서민아', email: 'mina.seo@peoplify.com',     phone: '010-1001-0007', department: '기획팀', position: '업무 분석가',       hire_date: '2020-04-20', employment_status: 'active' },
    { id: 8,  name: '권태양', email: 'taeyang.kwon@peoplify.com', phone: '010-1001-0008', department: '개발팀', position: '백엔드 개발자',     hire_date: '2022-06-13', employment_status: 'active' },
    { id: 9,  name: '나도연', email: 'doyeon.na@peoplify.com',    phone: '010-1001-0009', department: '디자인팀', position: 'UI/UX 디자이너', hire_date: '2023-02-01', employment_status: 'active' },
    { id: 10, name: '신하은', email: 'haeun.shin@peoplify.com',   phone: '010-1001-0010', department: '개발팀', position: '백엔드 개발자',     hire_date: '2021-08-16', employment_status: 'active' },
    { id: 11, name: '오준혁', email: 'junhyuk.oh@peoplify.com',   phone: '010-1001-0011', department: '개발팀', position: '풀스택 개발자',     hire_date: '2020-10-05', employment_status: 'active' },
    { id: 12, name: '유선미', email: 'sunmi.yoo@peoplify.com',    phone: '010-1001-0012', department: 'QA팀',   position: 'QA 엔지니어',       hire_date: '2022-03-28', employment_status: 'active' },
    { id: 13, name: '문지후', email: 'jihoo.moon@peoplify.com',   phone: '010-1001-0013', department: '개발팀', position: '백엔드 개발자',     hire_date: '2021-05-17', employment_status: 'active' },
    { id: 14, name: '최유나', email: 'yuna.choi@peoplify.com',    phone: '010-1001-0014', department: '기획팀', position: '프로젝트 관리자',   hire_date: '2019-11-25', employment_status: 'active' },
    { id: 15, name: '한예은', email: 'yeeun.han@peoplify.com',    phone: '010-1001-0015', department: '개발팀', position: '프론트엔드 개발자', hire_date: '2023-07-03', employment_status: 'active' },
    // ── 벤치 (active, 현재 assignment 없음) ─────────────────────────────
    { id: 16, name: '정다은', email: 'daeun.jung@peoplify.com',   phone: '010-1001-0016', department: '개발팀', position: '프론트엔드 개발자', hire_date: '2022-09-19', employment_status: 'active' },
    { id: 17, name: '임동현', email: 'donghyun.lim@peoplify.com', phone: '010-1001-0017', department: '개발팀', position: '백엔드 개발자',     hire_date: '2021-12-06', employment_status: 'active' },
    { id: 18, name: '황정우', email: 'jungwoo.hwang@peoplify.com',phone: '010-1001-0018', department: '개발팀', position: '시스템 분석가',     hire_date: '2020-02-14', employment_status: 'active' },
    // ── 휴직 / 퇴사 ─────────────────────────────────────────────────────
    { id: 19, name: '천지아', email: 'jia.chun@peoplify.com',     phone: '010-1001-0019', department: '개발팀', position: '프론트엔드 개발자', hire_date: '2022-04-11', employment_status: 'leave'    },
    { id: 20, name: '장민호', email: 'minho.jang@peoplify.com',   phone: '010-1001-0020', department: '개발팀', position: '백엔드 개발자',     hire_date: '2019-08-22', employment_status: 'resigned' },
  ]);

  // 명시적 id로 삽입 후 시퀀스가 갱신되지 않아 신규 등록 시 PK 충돌 방지
  await knex.raw("SELECT setval('employees_id_seq', (SELECT MAX(id) FROM employees))");
};
