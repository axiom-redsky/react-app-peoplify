// ProjectScheduleTab.tsx
// 프로젝트 상세 > 일정 탭에서 직무구분별 투입 인력 캘린더를 표시하는 컴포넌트입니다.
// 부모 컴포넌트에서 project, assignments, jobRoleOptions, jobRoleCategoryOptions를 전달받아 화면을 구성합니다.
import { useMemo, useState, type MouseEvent } from 'react';

// 공통코드 한 건의 구조입니다. POSITION, JOB_ROLE, JOB_ROLE_CATEGORY 같은 옵션 데이터에 사용합니다.
type CommonCode = {
	id?: number | string;
	group_code?: string;
	code: string;
	code_name?: string;
	name?: string;
	sort_order?: number | string | null;
	use_yn?: string | null;
	parent_code?: string | null;
};

// 프로젝트에 배정된 인력 한 건의 구조입니다.
// DB/API에서 내려오는 기존 필드명과 추가 조인 필드를 모두 허용합니다.
type Assignment = {
	id?: number | string;
	assignment_id?: number | string;
	employee_id?: number | string;
	employee_name?: string;
	name?: string;
	position?: string | null;
	position_name?: string | null;
	role?: string | null;

	job_role_code?: string | null;
	job_role_name?: string | null;
	job_role_category_code?: string | null;
	job_role_category_name?: string | null;

	start_date?: string | null;
	end_date?: string | null;
};

// 프로젝트 기간 계산에 필요한 프로젝트 기본 정보입니다.
// API 응답 필드명이 snake_case 또는 camelCase인 경우를 모두 처리합니다.
type Project = {
	start_date?: string | null;
	end_date?: string | null;
	startDate?: string | null;
	endDate?: string | null;
};

// 부모 컴포넌트에서 일정 탭으로 전달하는 props 구조입니다.
type ProjectScheduleTabProps = {
	project?: Project | null;
	assignments?: Assignment[];
	jobRoleOptions?: CommonCode[];
	jobRoleCategoryOptions?: CommonCode[];
};

// 화면에 표시할 직무구분 버튼/행 정보입니다.
// 공통코드에 스타일 정보를 더해 화면 렌더링용으로 가공한 타입입니다.
type RoleGroup = {
	key: string;
	label: string;
	color: string;
	dot: string;
	selectedClassName: string;
};

// 캘린더 막대에 마우스를 올렸을 때 표시할 툴팁 상태입니다.
type TooltipState = {
	visible: boolean;
	x: number;
	y: number;
	title: string;
	groupText: string;
	jobRoleText: string;
	positionText: string;
	startDate: string;
	endDate: string;
};

// 하루를 밀리초 단위로 환산한 값입니다. 날짜 차이 계산에 사용합니다.
const DAY_MS = 24 * 60 * 60 * 1000;

// 직무구분별 버튼/막대 색상 스타일 목록입니다.
// 직무구분 수가 색상 수보다 많으면 index를 순환하여 재사용합니다.
const GROUP_STYLES = [
	{
		color: 'bg-violet-500',
		dot: 'bg-violet-400',
		selectedClassName: 'border-violet-400 bg-violet-500/20 text-violet-100 ring-2 ring-violet-400/30',
	},
	{
		color: 'bg-blue-500',
		dot: 'bg-blue-400',
		selectedClassName: 'border-blue-400 bg-blue-500/20 text-blue-100 ring-2 ring-blue-400/30',
	},
	{
		color: 'bg-emerald-500',
		dot: 'bg-emerald-400',
		selectedClassName: 'border-emerald-400 bg-emerald-500/20 text-emerald-100 ring-2 ring-emerald-400/30',
	},
	{
		color: 'bg-pink-500',
		dot: 'bg-pink-400',
		selectedClassName: 'border-pink-400 bg-pink-500/20 text-pink-100 ring-2 ring-pink-400/30',
	},
	{
		color: 'bg-amber-500',
		dot: 'bg-amber-400',
		selectedClassName: 'border-amber-400 bg-amber-500/20 text-amber-100 ring-2 ring-amber-400/30',
	},
	{
		color: 'bg-cyan-500',
		dot: 'bg-cyan-400',
		selectedClassName: 'border-cyan-400 bg-cyan-500/20 text-cyan-100 ring-2 ring-cyan-400/30',
	},
	{
		color: 'bg-slate-500',
		dot: 'bg-slate-400',
		selectedClassName: 'border-slate-400 bg-slate-500/20 text-slate-100 ring-2 ring-slate-400/30',
	},
];

// 부모에서 직무구분 공통코드가 넘어오지 않을 때 사용하는 기본 직무구분 목록입니다.
// 실제 운영 화면에서는 jobRoleCategoryOptions가 있으면 이 값은 사용되지 않습니다.
const FALLBACK_ROLE_GROUPS: CommonCode[] = [
	{ code: 'LEADERSHIP', code_name: '관리/리딩', sort_order: 1 },
	{ code: 'PLAN_ANALYSIS', code_name: '기획/분석', sort_order: 2 },
	{ code: 'ARCHITECT', code_name: '아키텍트', sort_order: 3 },
	{ code: 'DEVELOPMENT', code_name: '개발', sort_order: 4 },
	{ code: 'DB_DATA', code_name: 'DB/데이터', sort_order: 5 },
	{ code: 'DESIGN_PUBLISHING', code_name: '디자인/퍼블리싱', sort_order: 6 },
	{ code: 'QA_TEST', code_name: '테스트/품질', sort_order: 7 },
	{ code: 'SM_OPERATION', code_name: 'SM/운영/유지보수', sort_order: 8 },
	{ code: 'DOCUMENT_BUSINESS', code_name: '문서/사업관리', sort_order: 9 },
	{ code: 'ETC', code_name: '기타', sort_order: 99 },
];

/**
 * null/undefined 값을 빈 문자열로 바꾸고 앞뒤 공백을 제거합니다.
 * 코드값, 이름값 비교 전에 문자열 형태를 통일하기 위한 기본 정규화 함수입니다.
 */
function normalize(value?: string | number | null) {
	return String(value ?? '').trim();
}

/**
 * normalize 결과를 소문자로 변환합니다.
 * 코드/명칭 비교 시 대소문자 차이로 매칭이 실패하지 않도록 사용합니다.
 */
function normalizeLower(value?: string | number | null) {
	return normalize(value).toLowerCase();
}

/**
 * 문자열 날짜를 Date 객체로 변환합니다.
 * 시간 정보는 제거하고 연/월/일 기준 날짜만 남겨 캘린더 계산 기준을 맞춥니다.
 */
function parseDate(value?: string | null) {
	if (!value) return null;

	// 문자열을 Date 객체로 변환합니다.
	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return null;
	}

	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Date 객체를 화면 표시용 yyyy.MM.dd 형식으로 변환합니다.
 * 값이 없으면 '-'를 반환합니다.
 */
function formatDate(date?: Date | null) {
	if (!date) return '-';

	// 화면 표시용 연/월/일 문자열을 만듭니다.
	const yyyy = date.getFullYear();
	const mm = String(date.getMonth() + 1).padStart(2, '0');
	const dd = String(date.getDate()).padStart(2, '0');

	return `${yyyy}.${mm}.${dd}`;
}

/**
 * 시작일과 종료일 사이의 일수를 계산합니다.
 * 시작일/종료일을 모두 포함하므로 차이에 1일을 더합니다.
 */
function getDays(startDate: Date, endDate: Date) {
	return Math.max(Math.round((endDate.getTime() - startDate.getTime()) / DAY_MS) + 1, 1);
}

/**
 * 기준일로부터 대상일이 며칠 떨어져 있는지 계산합니다.
 * 캘린더 막대의 left 위치 산정에 사용합니다.
 */
function getOffsetDays(baseDate: Date, targetDate: Date) {
	return Math.round((targetDate.getTime() - baseDate.getTime()) / DAY_MS);
}

/**
 * 프로젝트 시작일을 추출합니다.
 * API 응답 필드명이 start_date 또는 startDate인 경우를 모두 지원합니다.
 */
function getProjectStartDate(project?: Project | null) {
	return parseDate(project?.start_date || project?.startDate || null);
}

/**
 * 프로젝트 종료일을 추출합니다.
 * API 응답 필드명이 end_date 또는 endDate인 경우를 모두 지원합니다.
 */
function getProjectEndDate(project?: Project | null) {
	return parseDate(project?.end_date || project?.endDate || null);
}

/**
 * 공통코드의 화면 표시명을 가져옵니다.
 * code_name, name, code 순서로 우선순위를 적용합니다.
 */
function getCodeName(item?: CommonCode | null) {
	return normalize(item?.code_name || item?.name || item?.code);
}

/**
 * 공통코드 버튼/라벨에 표시할 문자열을 반환합니다.
 */
function getCommonCodeLabel(item: CommonCode) {
	return getCodeName(item);
}

/**
 * 공통코드 배열을 검색용 Map으로 변환합니다.
 * code, code_name, name 중 어떤 값으로 들어와도 같은 공통코드를 찾을 수 있게 합니다.
 */
function buildCommonCodeMap(options: CommonCode[] = []) {
	// code, code_name, name을 모두 key로 등록할 검색용 Map입니다.
	const map = new Map<string, CommonCode>();

	options.forEach((item) => {
		[item.code, item.code_name, item.name].forEach((value) => {
			const key = normalizeLower(value);

			if (key) {
				map.set(key, item);
			}
		});
	});

	return map;
}

/**
 * 배정 정보에서 인력명을 가져옵니다.
 * employee_name이 없으면 name을 사용하고, 둘 다 없으면 '-'를 반환합니다.
 */
function getEmployeeName(assignment: Assignment) {
	return normalize(assignment.employee_name || assignment.name) || '-';
}

/**
 * 배정 인력의 직무 표시명을 구합니다.
 * job_role_code, job_role_name, role 값을 공통코드와 매칭하여 code_name 기준으로 표시합니다.
 */
function getJobRoleText(assignment: Assignment, jobRoleMap: Map<string, CommonCode>) {
	// 직무 공통코드 매칭에 사용할 후보값입니다.
	const candidates = [assignment.job_role_code, assignment.job_role_name, assignment.role];

	for (const value of candidates) {
		const jobRole = jobRoleMap.get(normalizeLower(value));

		if (jobRole) {
			return getCodeName(jobRole);
		}
	}

	return normalize(assignment.job_role_name || assignment.role || assignment.job_role_code) || '직무 미지정';
}

/**
 * 배정 인력의 직급 표시명을 구합니다.
 * position_name이 있으면 우선 사용하고, 없으면 position 값을 사용합니다.
 */
function getPositionText(assignment: Assignment) {
	return normalize(assignment.position_name || assignment.position) || '-';
}

/**
 * 오늘 날짜 기준으로 인력 투입 상태를 계산합니다.
 * 시작 전은 예정, 기간 중은 투입중, 종료 후는 종료로 표시합니다.
 */
function getStatus(startDate: Date, endDate: Date) {
	// 시간 정보를 제거한 오늘 날짜를 기준으로 상태를 판단합니다.
	const today = new Date();
	const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

	if (todayDate < startDate) return '예정';
	if (todayDate > endDate) return '종료';

	return '투입중';
}

/**
 * 프로젝트 전체 기간 대비 개인 투입 기간의 막대 위치와 너비를 계산합니다.
 * 투입 기간이 프로젝트 기간을 벗어나면 프로젝트 기간 안으로 보정합니다.
 */
function getBarStyle(projectStartDate: Date, projectEndDate: Date, startDate: Date, endDate: Date) {
	// 프로젝트 전체 기간 일수입니다. 막대 비율 계산에 사용합니다.
	const totalDays = getDays(projectStartDate, projectEndDate);

	// 막대가 프로젝트 시작일 이전으로 넘어가지 않도록 보정한 시작일입니다.
	const normalizedStartDate = startDate < projectStartDate ? projectStartDate : startDate;
	// 막대가 프로젝트 종료일 이후로 넘어가지 않도록 보정한 종료일입니다.
	const normalizedEndDate = endDate > projectEndDate ? projectEndDate : endDate;

	if (normalizedEndDate < projectStartDate || normalizedStartDate > projectEndDate) {
		return {
			left: '12px',
			width: '0px',
		};
	}

	// 프로젝트 시작일 대비 개인 투입 시작 위치를 퍼센트로 계산합니다.
	const left = Math.min(Math.max((getOffsetDays(projectStartDate, normalizedStartDate) / totalDays) * 100, 0), 100);
	// 개인 투입 기간을 프로젝트 전체 기간 대비 너비 퍼센트로 계산합니다.
	const width = Math.max(Math.min((getDays(normalizedStartDate, normalizedEndDate) / totalDays) * 100, 100 - left), 1);

	return {
		left: `calc(12px + ${left}%)`,
		width: `calc(${width}% - 24px)`,
		minWidth: '42px',
		maxWidth: 'calc(100% - 24px)',
	};
}

/**
 * 직무구분 공통코드를 화면 렌더링용 RoleGroup 배열로 변환합니다.
 * 사용 여부, 정렬순서, 색상 스타일을 함께 적용합니다.
 */
function buildRoleGroups(jobRoleCategoryOptions: CommonCode[] = []) {
	// 실제 공통코드가 있으면 우선 사용하고, 없으면 기본 직무구분 목록을 사용합니다.
	const source = jobRoleCategoryOptions.length > 0 ? jobRoleCategoryOptions : FALLBACK_ROLE_GROUPS;

	return source
		.filter((item) => normalizeLower(item.use_yn || 'Y') !== 'n')
		.slice()
		.sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))
		.map((item, index) => {
			// 직무구분 순서에 맞는 색상 스타일입니다. 색상 목록보다 항목이 많으면 순환 적용합니다.
			const style = GROUP_STYLES[index % GROUP_STYLES.length];

			return {
				key: normalize(item.code),
				label: getCommonCodeLabel(item),
				color: style.color,
				dot: style.dot,
				selectedClassName: style.selectedClassName,
			};
		});
}

/**
 * 두 코드 문자열이 같은지 비교합니다.
 * 빈 값은 동일 코드로 보지 않습니다.
 */
function isSameCode(a?: string | null, b?: string | null) {
	return normalizeLower(a) !== '' && normalizeLower(a) === normalizeLower(b);
}

/**
 * 두 표시 문자열이 같은지 비교합니다.
 * 대소문자와 앞뒤 공백 차이를 제거하고 비교합니다.
 */
function isSameText(a?: string | null, b?: string | null) {
	return normalizeLower(a) !== '' && normalizeLower(a) === normalizeLower(b);
}

/**
 * 두 문자열 중 하나가 다른 하나를 포함하는지 확인합니다.
 * 직무명이 완전히 같지 않아도 일부 문구로 매칭하기 위한 보조 함수입니다.
 */
function includesText(source?: string | null, target?: string | null) {
	// 비교 대상 문자열을 소문자 기준으로 정규화합니다.
	const sourceText = normalizeLower(source);
	const targetText = normalizeLower(target);

	if (!sourceText || !targetText) return false;

	return sourceText.includes(targetText) || targetText.includes(sourceText);
}

/**
 * 직무구분 코드값으로 RoleGroup을 찾습니다.
 */
function findCategoryByCode(roleGroups: RoleGroup[], value?: string | null) {
	// 검색에 사용할 입력값입니다.
	const text = normalize(value);

	if (!text) return null;

	return roleGroups.find((group) => isSameCode(group.key, text)) || null;
}

/**
 * 직무구분 표시명으로 RoleGroup을 찾습니다.
 * 완전 일치와 일부 포함 매칭을 모두 사용합니다.
 */
function findCategoryByLabel(roleGroups: RoleGroup[], value?: string | null) {
	const text = normalize(value);

	if (!text) return null;

	return roleGroups.find((group) => isSameText(group.label, text) || includesText(group.label, text)) || null;
}

/**
 * 직무 공통코드 목록에서 code 기준으로 직무를 찾습니다.
 */
function findJobRoleByCode(jobRoleOptions: CommonCode[], value?: string | null) {
	const text = normalize(value);

	if (!text) return null;

	return jobRoleOptions.find((item) => isSameCode(item.code, text)) || null;
}

/**
 * 직무 공통코드 목록에서 code 또는 표시명 기준으로 직무를 찾습니다.
 */
function findJobRoleByText(jobRoleOptions: CommonCode[], value?: string | null) {
	const text = normalize(value);

	if (!text) return null;

	return (
		jobRoleOptions.find((item) => {
			const code = normalize(item.code);
			const label = getCommonCodeLabel(item);

			return isSameCode(code, text) || isSameText(label, text) || includesText(label, text);
		}) || null
	);
}

/**
 * 매칭되는 직무구분이 없을 때 사용할 기타 그룹을 찾습니다.
 * 기타 그룹이 없으면 마지막 그룹을 사용하고, 목록도 없으면 기본 기타 그룹을 반환합니다.
 */
function findEtcGroup(roleGroups: RoleGroup[]) {
	return (
		roleGroups.find((group) => {
			const key = normalizeLower(group.key);
			const label = normalizeLower(group.label);

			return key === 'etc' || label === '기타' || label.includes('기타');
		}) ||
		roleGroups[roleGroups.length - 1] || {
			key: 'ETC',
			label: '기타',
			color: 'bg-slate-500',
			dot: 'bg-slate-400',
			selectedClassName: 'border-slate-400 bg-slate-500/20 text-slate-100 ring-2 ring-slate-400/30',
		}
	);
}

/**
 * 배정 인력 한 명이 어느 직무구분 행에 들어갈지 결정합니다.
 * 1순위: assignment의 직무구분 코드/명칭
 * 2순위: 직무 코드의 parent_code
 * 3순위: 직무명/role 텍스트 매칭
 * 4순위: 기타 그룹
 */
function getGroupKeyByAssignment(assignment: Assignment, roleGroups: RoleGroup[], jobRoleOptions: CommonCode[]) {
	// API에서 직접 내려온 직무구분 코드/명칭 후보입니다.
	const directCategoryValues = [assignment.job_role_category_code, assignment.job_role_category_name];

	for (const value of directCategoryValues) {
		const group = findCategoryByCode(roleGroups, value) || findCategoryByLabel(roleGroups, value);

		if (group) {
			return group.key;
		}
	}

	// 직무 코드 또는 기존 role 필드를 직무 코드로 보고 매칭할 후보입니다.
	const jobRoleCodeValues = [assignment.job_role_code, assignment.role];

	for (const value of jobRoleCodeValues) {
		const jobRole = findJobRoleByCode(jobRoleOptions, value);

		if (jobRole?.parent_code) {
			const group = findCategoryByCode(roleGroups, jobRole.parent_code);

			if (group) {
				return group.key;
			}
		}
	}

	// 직무명 또는 기존 role 필드를 텍스트로 보고 매칭할 후보입니다.
	const jobRoleTextValues = [assignment.job_role_name, assignment.role];

	for (const value of jobRoleTextValues) {
		const jobRole = findJobRoleByText(jobRoleOptions, value);

		if (jobRole?.parent_code) {
			const group = findCategoryByCode(roleGroups, jobRole.parent_code);

			if (group) {
				return group.key;
			}
		}
	}

	for (const value of jobRoleTextValues) {
		const group = findCategoryByCode(roleGroups, value) || findCategoryByLabel(roleGroups, value);

		if (group) {
			return group.key;
		}
	}

	return findEtcGroup(roleGroups).key;
}

/**
 * 프로젝트 상세 화면의 일정 탭 컴포넌트입니다.
 * 직무구분 버튼은 jobRoleCategoryOptions 기준으로 전체 표시하고,
 * 아래 캘린더 행도 전체 직무구분이 기본으로 보이도록 구성합니다.
 */
export default function ProjectScheduleTab({
	project,
	assignments = [],
	jobRoleOptions = [],
	jobRoleCategoryOptions = [],
}: ProjectScheduleTabProps) {
	// 선택된 직무구분 key 목록입니다. 빈 배열이면 '전체' 선택 상태로 처리합니다.
	const [selectedGroupKeys, setSelectedGroupKeys] = useState<string[]>([]);
	// 인력 투입 막대 hover 시 표시할 툴팁 정보입니다.
	const [tooltip, setTooltip] = useState<TooltipState>({
		visible: false,
		x: 0,
		y: 0,
		title: '',
		groupText: '',
		jobRoleText: '',
		positionText: '',
		startDate: '',
		endDate: '',
	});

	// 프로젝트 시작일입니다. 캘린더 전체 기준일로 사용합니다.
	const projectStartDate = getProjectStartDate(project);
	// 프로젝트 종료일입니다. 캘린더 전체 종료 기준으로 사용합니다.
	const projectEndDate = getProjectEndDate(project);

	// 직무구분 공통코드를 버튼/행 렌더링용 데이터로 변환한 값입니다.
	const roleGroups = useMemo(() => buildRoleGroups(jobRoleCategoryOptions), [jobRoleCategoryOptions]);
	// 직무 코드/직무명/role 텍스트를 빠르게 찾기 위한 검색용 Map입니다.
	const jobRoleMap = useMemo(() => buildCommonCodeMap(jobRoleOptions), [jobRoleOptions]);

	// 배정 인력 목록을 직무구분 key 기준으로 묶은 데이터입니다.
	// 캘린더 행과 버튼 카운트 표시에서 함께 사용합니다.
	const groupedAssignments = useMemo(() => {
		// 모든 직무구분 행이 기본으로 보이도록 먼저 빈 배열을 만들어 둡니다.
		const groups = roleGroups.reduce<Record<string, Assignment[]>>((acc, group) => {
			acc[group.key] = [];
			return acc;
		}, {});

		// 각 배정 인력을 직무구분 코드, 직무 parent_code, role 텍스트 기준으로 매칭합니다.
		assignments.forEach((assignment) => {
			// 현재 배정 인력이 들어갈 직무구분 key입니다.
			const groupKey = getGroupKeyByAssignment(assignment, roleGroups, jobRoleOptions);

			if (!groups[groupKey]) {
				groups[groupKey] = [];
			}

			groups[groupKey].push(assignment);
		});

		return groups;
	}, [assignments, roleGroups, jobRoleOptions]);

	// 프로젝트 기간이 없으면 캘린더 계산이 불가능하므로 안내 문구를 표시합니다.
	if (!projectStartDate || !projectEndDate) {
		return (
			<div className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center">
				<p className="text-sm font-semibold text-slate-200">프로젝트 일정 정보가 없습니다.</p>
				<p className="mt-2 text-sm text-slate-500">프로젝트 시작일과 종료일을 확인하세요.</p>
			</div>
		);
	}

	// 프로젝트 전체 기간 일수입니다. 상단 요약에 사용합니다.
	const totalDays = getDays(projectStartDate, projectEndDate);
	// 실제 투입 인력이 1명 이상 존재하는 직무구분 개수입니다.
	const assignedGroupCount = roleGroups.filter((group) => (groupedAssignments[group.key] || []).length > 0).length;
	// 전체 보기 여부입니다. 선택된 직무구분이 없으면 전체 보기로 간주합니다.
	const isAllSelected = selectedGroupKeys.length === 0;
	// 현재 선택 상태에 따라 화면에 표시할 직무구분 목록입니다.
	const visibleGroups = isAllSelected
		? roleGroups
		: roleGroups.filter((group) => selectedGroupKeys.includes(group.key));

	/**
	 * 전체 버튼 클릭 시 선택값을 초기화하여 모든 직무구분을 표시합니다.
	 */
	function handleSelectAll() {
		setSelectedGroupKeys([]);
		setTooltip((prev) => ({ ...prev, visible: false }));
	}

	/**
	 * 직무구분 버튼 클릭 시 해당 그룹을 선택/해제합니다.
	 */
	function handleToggleGroup(groupKey: string) {
		setSelectedGroupKeys((prev) => {
			if (prev.includes(groupKey)) {
				return prev.filter((key) => key !== groupKey);
			}

			return [...prev, groupKey];
		});

		setTooltip((prev) => ({ ...prev, visible: false }));
	}

	/**
	 * 투입 막대 hover 시 마우스를 올린 인력의 상세 정보를 툴팁에 세팅합니다.
	 */
	function showTooltip(
		event: MouseEvent<HTMLDivElement>,
		assignment: Assignment,
		group: RoleGroup,
		startDate: Date,
		endDate: Date,
	) {
		// 툴팁을 막대 중앙 위쪽에 띄우기 위한 현재 막대 위치 정보입니다.
		const rect = event.currentTarget.getBoundingClientRect();

		setTooltip({
			visible: true,
			x: rect.left + rect.width / 2,
			y: rect.top,
			title: getEmployeeName(assignment),
			groupText: group.label,
			jobRoleText: getJobRoleText(assignment, jobRoleMap),
			positionText: getPositionText(assignment),
			startDate: formatDate(startDate),
			endDate: formatDate(endDate),
		});
	}

	/**
	 * 투입 막대에서 마우스가 벗어나면 툴팁을 숨깁니다.
	 */
	function hideTooltip() {
		setTooltip((prev) => ({ ...prev, visible: false }));
	}

	return (
		<div className="w-full max-w-full overflow-hidden space-y-4">
			<section className="max-w-full overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-5">
				<div className="flex items-start justify-between gap-4">
					<div className="min-w-0">
						<h3 className="text-base font-semibold text-slate-100">일정 요약</h3>
						<p className="mt-1 text-sm text-slate-400">프로젝트 전체 기간과 인력별 투입 기간을 확인합니다.</p>
					</div>

					<div className="shrink-0 rounded-full border border-violet-400/40 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-200">
						{formatDate(projectStartDate)} ~ {formatDate(projectEndDate)}
					</div>
				</div>

				<div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
					<div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
						<p className="text-xs text-slate-400">프로젝트 기간</p>
						<p className="mt-2 text-xl font-bold text-slate-100">{totalDays}일</p>
					</div>

					<div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
						<p className="text-xs text-slate-400">투입 인원</p>
						<p className="mt-2 text-xl font-bold text-slate-100">{assignments.length}명</p>
					</div>

					<div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
						<p className="text-xs text-slate-400">투입 직무구분</p>
						<p className="mt-2 text-xl font-bold text-slate-100">{assignedGroupCount}개</p>
					</div>
				</div>
			</section>

			<section className="max-w-full overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-5">
				<div className="mb-4">
					<h3 className="text-base font-semibold text-slate-100">직무구분별 투입 캘린더</h3>
					<p className="mt-1 text-sm text-slate-400">직무구분별 색상으로 투입 시작일과 종료일을 표시합니다.</p>
				</div>

				<div className="mb-4 flex max-w-full flex-wrap gap-2">
					<button
						type="button"
						onClick={(event) => {
							event.preventDefault();
							event.stopPropagation();
							handleSelectAll();
						}}
						className={[
							'inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition',
							isAllSelected
								? 'border-violet-400 bg-violet-500/20 text-violet-100 ring-2 ring-violet-400/30'
								: 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-violet-400/50 hover:text-violet-100',
						].join(' ')}
					>
						<span className="h-2 w-2 rounded-full bg-violet-400" />
						전체
						<span className="rounded-full bg-slate-950/40 px-1.5 py-0.5 text-[10px] text-slate-300">
							{assignments.length}
						</span>
					</button>

					{roleGroups.map((group) => {
						// 해당 직무구분에 매칭된 인력 수입니다.
						const count = groupedAssignments[group.key]?.length || 0;
						// 현재 직무구분 버튼이 선택되어 있는지 여부입니다.
						const isSelected = selectedGroupKeys.includes(group.key);

						return (
							<button
								type="button"
								key={group.key}
								onClick={(event) => {
									event.preventDefault();
									event.stopPropagation();
									handleToggleGroup(group.key);
								}}
								className={[
									'inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition',
									isSelected
										? group.selectedClassName
										: 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/30 hover:text-slate-100',
									count === 0 && !isSelected ? 'opacity-45' : '',
								].join(' ')}
							>
								<span className={`h-2 w-2 rounded-full ${group.dot}`} />
								{group.label}
								<span className="rounded-full bg-slate-950/40 px-1.5 py-0.5 text-[10px] text-slate-300">{count}</span>
							</button>
						);
					})}
				</div>

				<div className="mb-3 text-xs text-slate-400">
					현재 선택:{' '}
					<span className="font-semibold text-slate-200">
						{isAllSelected
							? '전체'
							: selectedGroupKeys.map((key) => roleGroups.find((group) => group.key === key)?.label || key).join(', ')}
					</span>
				</div>

				<div className="w-full max-w-full overflow-hidden rounded-lg border border-white/10">
					<div className="w-full max-w-full overflow-hidden">
						<div className="grid grid-cols-[180px_minmax(0,1fr)] border-b border-white/10 bg-slate-950/40 sm:grid-cols-[220px_minmax(0,1fr)]">
							<div className="min-w-0 border-r border-white/10 p-3 text-xs font-semibold text-slate-400">투입 인력</div>

							<div className="relative min-w-0 p-3">
								<div className="flex min-w-0 justify-between gap-3 text-xs text-slate-400">
									<span className="truncate">{formatDate(projectStartDate)}</span>
									<span className="truncate">{formatDate(projectEndDate)}</span>
								</div>
							</div>
						</div>

						<div className="grid grid-cols-[180px_minmax(0,1fr)] border-b border-white/10 sm:grid-cols-[220px_minmax(0,1fr)]">
							<div className="min-w-0 border-r border-white/10 bg-white/[0.03] p-3">
								<p className="truncate text-sm font-semibold text-slate-100">프로젝트 전체</p>
								<p className="mt-1 truncate text-xs text-slate-500">
									{formatDate(projectStartDate)} ~ {formatDate(projectEndDate)}
								</p>
							</div>

							<div className="relative h-14 min-w-0 overflow-hidden p-3">
								<div className="absolute left-3 right-3 top-1/2 h-7 -translate-y-1/2 rounded-full bg-violet-600/80 px-3 text-xs font-semibold leading-7 text-white">
									프로젝트 기간
								</div>
							</div>
						</div>

						{visibleGroups.length === 0 ? (
							<div className="p-6 text-center text-sm text-slate-500">표시할 직무구분이 없습니다.</div>
						) : (
							visibleGroups.map((group) => {
								// 현재 직무구분 행에 표시할 배정 인력 목록입니다.
								const members = groupedAssignments[group.key] || [];

								return (
									<div
										key={group.key}
										className="min-w-0"
									>
										<div className="grid grid-cols-[180px_minmax(0,1fr)] border-b border-white/10 bg-white/[0.02] sm:grid-cols-[220px_minmax(0,1fr)]">
											<div className="min-w-0 border-r border-white/10 px-3 py-2">
												<div className="flex min-w-0 items-center gap-2 text-xs font-semibold text-slate-300">
													<span className={`h-2 w-2 shrink-0 rounded-full ${group.dot}`} />
													<span className="truncate">{group.label}</span>
												</div>
											</div>
											<div className="min-w-0" />
										</div>

										{members.length === 0 ? (
											<div className="grid grid-cols-[180px_minmax(0,1fr)] border-b border-white/10 sm:grid-cols-[220px_minmax(0,1fr)]">
												<div className="min-w-0 border-r border-white/10 p-3">
													<div className="flex min-w-0 items-start justify-between gap-2">
														<div className="min-w-0">
															<p className="truncate text-sm font-semibold text-slate-400">배정 인력 없음</p>
															<p className="mt-1 truncate text-xs text-slate-500">직무구분: {group.label}</p>
															<p className="mt-1 truncate text-[11px] text-slate-500">-</p>
														</div>

														<span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-slate-400">
															미배정
														</span>
													</div>
												</div>

												<div className="relative h-16 min-w-0 overflow-hidden p-3">
													<div className="absolute left-3 right-3 top-1/2 h-px bg-white/10" />
													<div className="absolute left-3 right-3 top-1/2 min-w-0 -translate-y-1/2 truncate rounded-full border border-dashed border-white/10 bg-white/[0.02] px-3 py-1 text-xs text-slate-500">
														해당 직무구분에 배정된 인력이 없습니다.
													</div>
												</div>
											</div>
										) : (
											members.map((assignment, index) => {
												// 개인 투입 시작일입니다. 값이 없으면 프로젝트 시작일을 기본값으로 사용합니다.
												const startDate = parseDate(assignment.start_date) || projectStartDate;

												// 개인 투입 종료일입니다. 값이 없으면 프로젝트 종료일을 기본값으로 사용합니다.
												const endDate = parseDate(assignment.end_date) || projectEndDate;

												return (
													<div
														key={`${assignment.employee_id ?? assignment.id ?? assignment.assignment_id ?? index}`}
														className="grid grid-cols-[180px_minmax(0,1fr)] border-b border-white/10 sm:grid-cols-[220px_minmax(0,1fr)]"
													>
														<div className="min-w-0 border-r border-white/10 p-3">
															<div className="flex min-w-0 items-start justify-between gap-2">
																<div className="min-w-0">
																	<p className="truncate text-sm font-semibold text-slate-100">
																		{getEmployeeName(assignment)}
																	</p>
																	<p className="mt-1 truncate text-xs text-slate-500">
																		직무: {getJobRoleText(assignment, jobRoleMap)}
																	</p>
																	<p className="mt-1 truncate text-xs text-slate-500">
																		직급: {getPositionText(assignment)}
																	</p>
																	<p className="mt-1 truncate text-[11px] text-slate-500">
																		{formatDate(startDate)} ~ {formatDate(endDate)}
																	</p>
																</div>

																<span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-slate-300">
																	{getStatus(startDate, endDate)}
																</span>
															</div>
														</div>

														<div className="relative h-16 min-w-0 overflow-hidden p-3">
															<div className="absolute left-3 right-3 top-1/2 h-px bg-white/10" />

															<div
																aria-label={`${getEmployeeName(assignment)} 투입일 ${formatDate(startDate)} 철수일 ${formatDate(endDate)}`}
																onMouseEnter={(event) => showTooltip(event, assignment, group, startDate, endDate)}
																onMouseLeave={hideTooltip}
																className={`absolute top-1/2 z-10 h-7 max-w-full -translate-y-1/2 cursor-help overflow-hidden rounded-full px-3 text-xs font-semibold leading-7 text-white shadow-sm ${group.color}`}
																style={getBarStyle(projectStartDate, projectEndDate, startDate, endDate)}
															>
																<span className="block truncate">{getEmployeeName(assignment)}</span>
															</div>
														</div>
													</div>
												);
											})
										)}
									</div>
								);
							})
						)}
					</div>
				</div>
			</section>

			{tooltip.visible && (
				<div
					className="pointer-events-none fixed z-[9999] min-w-[180px] rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-left text-[11px] leading-5 text-slate-200 shadow-xl"
					style={{
						left: tooltip.x,
						top: tooltip.y - 8,
						transform: 'translate(-50%, -100%)',
					}}
				>
					<p className="font-semibold text-white">{tooltip.title}</p>
					<p className="text-slate-400">직무구분: {tooltip.groupText}</p>
					<p className="text-slate-400">직무: {tooltip.jobRoleText}</p>
					<p className="text-slate-400">직급: {tooltip.positionText}</p>
					<p>투입일: {tooltip.startDate}</p>
					<p>철수일: {tooltip.endDate}</p>
				</div>
			)}
		</div>
	);
}