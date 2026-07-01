exports.seed = async function (knex) {
	await knex('common_code').del();
	await knex('common_code_group').del();

	await knex('common_code_group').insert([
		{ group_code: 'EMPLOYMENT_STATUS', group_name: '재직상태', description: '직원 재직 상태' },
		{ group_code: 'DEPLOYMENT_STATUS', group_name: '투입상태', description: '직원 프로젝트 투입 상태(파생값)' },
		{ group_code: 'PROJECT_STATUS', group_name: '프로젝트상태', description: '프로젝트 진행 상태' },
		{ group_code: 'WORK_REPORT_STATUS', group_name: '근무보고상태', description: '월별 근무 보고 상태' },
		{ group_code: 'LEAVE_TYPE', group_name: '휴가종류', description: '휴가 신청 종류' },
		{ group_code: 'LEAVE_STATUS', group_name: '휴가상태', description: '휴가 신청 처리 상태' },
		// 직무/직급
		{ group_code: 'JOB_ROLE', group_name: '직무역할', description: '직원 직무 역할' },
		{ group_code: 'POSITION', group_name: '직급', description: '직원 직급' },
	]);

	await knex('common_code').insert([
		// 재직상태
		{ group_code: 'EMPLOYMENT_STATUS', code: 'active', code_name: '재직', sort_order: 1 },
		{ group_code: 'EMPLOYMENT_STATUS', code: 'leave', code_name: '휴직', sort_order: 2 },
		{ group_code: 'EMPLOYMENT_STATUS', code: 'resigned', code_name: '퇴직', sort_order: 3 },
		// 투입상태 (assignments 기반 파생값)
		{ group_code: 'DEPLOYMENT_STATUS', code: 'deployed', code_name: '투입중', sort_order: 1 },
		{ group_code: 'DEPLOYMENT_STATUS', code: 'bench', code_name: '벤치', sort_order: 2 },
		// 프로젝트상태
		{ group_code: 'PROJECT_STATUS', code: 'active', code_name: '진행중', sort_order: 1 },
		{ group_code: 'PROJECT_STATUS', code: 'complete', code_name: '완료', sort_order: 2 },
		{ group_code: 'PROJECT_STATUS', code: 'planned', code_name: '예정', sort_order: 3 },
		// 근무보고상태
		{ group_code: 'WORK_REPORT_STATUS', code: 'submitted', code_name: '제출', sort_order: 1 },
		{ group_code: 'WORK_REPORT_STATUS', code: 'approved', code_name: '승인', sort_order: 2 },
		{ group_code: 'WORK_REPORT_STATUS', code: 'none', code_name: '미제출', sort_order: 3 },
		// 휴가종류
		{ group_code: 'LEAVE_TYPE', code: 'annual', code_name: '연차', sort_order: 1 },
		{ group_code: 'LEAVE_TYPE', code: 'half_day_am', code_name: '반차(오전)', sort_order: 2 },
		{ group_code: 'LEAVE_TYPE', code: 'half_day_pm', code_name: '반차(오후)', sort_order: 3 },
		{ group_code: 'LEAVE_TYPE', code: 'sick', code_name: '병가', sort_order: 4 },
		{ group_code: 'LEAVE_TYPE', code: 'bereavement', code_name: '경조사', sort_order: 5 },
		// 휴가상태
		{ group_code: 'LEAVE_STATUS', code: 'pending', code_name: '승인대기', sort_order: 1 },
		{ group_code: 'LEAVE_STATUS', code: 'approved', code_name: '승인', sort_order: 2 },
		{ group_code: 'LEAVE_STATUS', code: 'rejected', code_name: '반려', sort_order: 3 },

		// 직무역할
		{ group_code: 'JOB_ROLE', code: 'PM', code_name: 'PM', sort_order: 1 },
		{ group_code: 'JOB_ROLE', code: 'PL', code_name: 'PL', sort_order: 2 },
		{ group_code: 'JOB_ROLE', code: 'PMO', code_name: 'PMO', sort_order: 3 },

		// 기획/분석
		{ group_code: 'JOB_ROLE', code: 'SERVICE_PLANNER', code_name: '서비스 기획자', sort_order: 4 },
		{ group_code: 'JOB_ROLE', code: 'BUSINESS_ANALYST', code_name: '업무 분석가', sort_order: 5 },
		{ group_code: 'JOB_ROLE', code: 'SYSTEM_ANALYST', code_name: '시스템 분석가', sort_order: 6 },

		// 아키텍트
		{ group_code: 'JOB_ROLE', code: 'AA', code_name: 'AA', sort_order: 7 },
		{ group_code: 'JOB_ROLE', code: 'TA', code_name: 'TA', sort_order: 8 },
		{ group_code: 'JOB_ROLE', code: 'SA', code_name: 'SA', sort_order: 9 },
		{ group_code: 'JOB_ROLE', code: 'DA', code_name: 'DA', sort_order: 10 },

		// 개발
		{ group_code: 'JOB_ROLE', code: 'BACKEND_DEVELOPER', code_name: '백엔드 개발자', sort_order: 11 },
		{ group_code: 'JOB_ROLE', code: 'FRONTEND_DEVELOPER', code_name: '프론트엔드 개발자', sort_order: 12 },
		{ group_code: 'JOB_ROLE', code: 'FULLSTACK_DEVELOPER', code_name: '풀스택 개발자', sort_order: 13 },
		{ group_code: 'JOB_ROLE', code: 'AOS_DEVELOPER', code_name: 'AOS 개발자', sort_order: 14 },
		{ group_code: 'JOB_ROLE', code: 'IOS_DEVELOPER', code_name: 'iOS 개발자', sort_order: 15 },
		{ group_code: 'JOB_ROLE', code: 'API_DEVELOPER', code_name: 'API 개발자', sort_order: 16 },
		{ group_code: 'JOB_ROLE', code: 'INTERFACE_DEVELOPER', code_name: '인터페이스 개발자', sort_order: 17 },
		{ group_code: 'JOB_ROLE', code: 'BATCH_DEVELOPER', code_name: '배치 개발자', sort_order: 18 },
		{ group_code: 'JOB_ROLE', code: 'REPORT_DEVELOPER', code_name: '리포트 개발자', sort_order: 19 },

		// DB/데이터
		{ group_code: 'JOB_ROLE', code: 'DBA', code_name: 'DBA', sort_order: 20 },
		{ group_code: 'JOB_ROLE', code: 'DB_DEVELOPER', code_name: 'DB 개발자', sort_order: 21 },
		{ group_code: 'JOB_ROLE', code: 'DATA_ENGINEER', code_name: '데이터 엔지니어', sort_order: 22 },
		{ group_code: 'JOB_ROLE', code: 'BI_ANALYST', code_name: 'BI 분석가', sort_order: 23 },

		// 퍼블리싱/디자인
		{ group_code: 'JOB_ROLE', code: 'PUBLISHER', code_name: '퍼블리셔', sort_order: 24 },
		{ group_code: 'JOB_ROLE', code: 'UI_UX_DESIGNER', code_name: 'UI/UX 디자이너', sort_order: 25 },
		{ group_code: 'JOB_ROLE', code: 'WEB_DESIGNER', code_name: '웹 디자이너', sort_order: 26 },

		// 테스트/품질
		{ group_code: 'JOB_ROLE', code: 'QA_MANAGER', code_name: 'QA 리더', sort_order: 27 },
		{ group_code: 'JOB_ROLE', code: 'QA_ENGINEER', code_name: 'QA 엔지니어', sort_order: 28 },
		{ group_code: 'JOB_ROLE', code: 'TESTER', code_name: '테스터', sort_order: 29 },
		{ group_code: 'JOB_ROLE', code: 'TEST_AUTOMATION_ENGINEER', code_name: '테스트 자동화 엔지니어', sort_order: 30 },

		// SM/운영/유지보수
		{ group_code: 'JOB_ROLE', code: 'SM_DEVELOPER', code_name: 'SM 개발자', sort_order: 31 },
		{ group_code: 'JOB_ROLE', code: 'MAINTENANCE_DEVELOPER', code_name: '유지보수 개발자', sort_order: 32 },
		{ group_code: 'JOB_ROLE', code: 'APPLICATION_OPERATOR', code_name: '애플리케이션 운영자', sort_order: 33 },
		{ group_code: 'JOB_ROLE', code: 'SYSTEM_OPERATOR', code_name: '시스템 운영자', sort_order: 34 },

		// 문서/사업관리
		{ group_code: 'JOB_ROLE', code: 'BUSINESS_MANAGER', code_name: '사업관리', sort_order: 35 },
		{ group_code: 'JOB_ROLE', code: 'ETC', code_name: '기타', sort_order: 99 },

		// 직급
		{ group_code: 'POSITION', codㅇe: 'STAFF', code_name: '사원', sort_order: 1 },
		{ group_code: 'POSITION', code: 'SENIOR_STAFF', code_name: '주임', sort_order: 2 },
		{ group_code: 'POSITION', code: 'ASSISTANT_MANAGER', code_name: '대리', sort_order: 3 },
		{ group_code: 'POSITION', code: 'MANAGER', code_name: '과장', sort_order: 4 },
		{ group_code: 'POSITION', code: 'DEPUTY_GENERAL_MANAGER', code_name: '차장', sort_order: 5 },
		{ group_code: 'POSITION', code: 'GENERAL_MANAGER', code_name: '부장', sort_order: 6 },
		{ group_code: 'POSITION', code: 'DIRECTOR', code_name: '이사', sort_order: 7 },
	]);
};
