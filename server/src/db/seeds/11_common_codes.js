exports.seed = async function (knex) {
  await knex('common_code').del();
  await knex('common_code_group').del();

  await knex('common_code_group').insert([
    { group_code: 'EMPLOYMENT_STATUS', group_name: '재직상태',   description: '직원 재직 상태' },
    { group_code: 'DEPLOYMENT_STATUS', group_name: '투입상태',   description: '직원 프로젝트 투입 상태(파생값)' },
    { group_code: 'PROJECT_STATUS',    group_name: '프로젝트상태', description: '프로젝트 진행 상태' },
    { group_code: 'WORK_REPORT_STATUS', group_name: '근무보고상태', description: '월별 근무 보고 상태' },
    { group_code: 'LEAVE_TYPE',        group_name: '휴가종류',     description: '휴가 신청 종류' },
    { group_code: 'LEAVE_STATUS',      group_name: '휴가상태',     description: '휴가 신청 처리 상태' },
  ]);

  await knex('common_code').insert([
    // 재직상태
    { group_code: 'EMPLOYMENT_STATUS', code: 'active',   code_name: '재직', sort_order: 1 },
    { group_code: 'EMPLOYMENT_STATUS', code: 'leave',    code_name: '휴직', sort_order: 2 },
    { group_code: 'EMPLOYMENT_STATUS', code: 'resigned', code_name: '퇴직', sort_order: 3 },
    // 투입상태 (assignments 기반 파생값)
    { group_code: 'DEPLOYMENT_STATUS', code: 'deployed', code_name: '투입중', sort_order: 1 },
    { group_code: 'DEPLOYMENT_STATUS', code: 'bench',    code_name: '벤치',   sort_order: 2 },
    // 프로젝트상태
    { group_code: 'PROJECT_STATUS', code: 'active',   code_name: '진행중', sort_order: 1 },
    { group_code: 'PROJECT_STATUS', code: 'complete', code_name: '완료',   sort_order: 2 },
    { group_code: 'PROJECT_STATUS', code: 'planned',  code_name: '예정',   sort_order: 3 },
    // 근무보고상태
    { group_code: 'WORK_REPORT_STATUS', code: 'submitted', code_name: '제출',  sort_order: 1 },
    { group_code: 'WORK_REPORT_STATUS', code: 'approved',  code_name: '승인',  sort_order: 2 },
    { group_code: 'WORK_REPORT_STATUS', code: 'none',      code_name: '미제출', sort_order: 3 },
    // 휴가종류
    { group_code: 'LEAVE_TYPE', code: 'annual',      code_name: '연차',       sort_order: 1 },
    { group_code: 'LEAVE_TYPE', code: 'half_day_am', code_name: '반차(오전)', sort_order: 2 },
    { group_code: 'LEAVE_TYPE', code: 'half_day_pm', code_name: '반차(오후)', sort_order: 3 },
    { group_code: 'LEAVE_TYPE', code: 'sick',        code_name: '병가',       sort_order: 4 },
    { group_code: 'LEAVE_TYPE', code: 'bereavement', code_name: '경조사',     sort_order: 5 },
    // 휴가상태
    { group_code: 'LEAVE_STATUS', code: 'pending',  code_name: '승인대기', sort_order: 1 },
    { group_code: 'LEAVE_STATUS', code: 'approved', code_name: '승인',     sort_order: 2 },
    { group_code: 'LEAVE_STATUS', code: 'rejected', code_name: '반려',     sort_order: 3 },
  ]);
};
