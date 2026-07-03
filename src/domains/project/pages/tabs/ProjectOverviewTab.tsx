/**
 * ProjectOverviewTab
 *
 * 프로젝트 상세 화면의 개요 탭 컴포넌트입니다.
 * 프로젝트에 배정된 인력을 공통코드 직무구분 기준으로 그룹핑하여
 * 총 투입 인원, 배정 직무구분 수, 등록 직무 수를 요약해서 표시합니다.
 */

/**
 * 프로젝트 배정 인력 정보 타입입니다.
 *
 * API 응답에서 assignment_id, employee_id, employee_name 형태로 내려오거나,
 * 기존 화면 호환을 위해 id, name, role 값이 함께 사용될 수 있습니다.
 */
type Assignment = {
	/** 배정 또는 직원 식별자로 사용할 수 있는 기본 id */
	id?: number | string;
	/** 프로젝트 배정 이력 id */
	assignment_id?: number | string;
	/** 직원 id */
	employee_id?: number | string;
	/** 직원명 */
	employee_name?: string;
	/** 직원명 대체 필드 */
	name?: string;

	/** 기존 배정 역할 값입니다. job_role_code가 없을 때 대체값으로 사용합니다. */
	role?: string | null;

	/** 직원 직무 코드 */
	job_role_code?: string | null;
	/** 직원 직무명 */
	job_role_name?: string | null;
	/** 직원 직무구분 코드 */
	job_role_category_code?: string | null;
	/** 직원 직무구분명 */
	job_role_category_name?: string | null;

	/** 프로젝트 투입 시작일 */
	start_date?: string | null;
	/** 프로젝트 투입 종료일 */
	end_date?: string | null;
	/** 직급 */
	position?: string;
};

/**
 * 공통코드 타입입니다.
 *
 * JOB_ROLE, JOB_ROLE_CATEGORY 등의 공통코드 목록을 화면 옵션으로 받을 때 사용합니다.
 */
type CommonCode = {
	/** 공통코드 값 */
	code: string;
	/** 공통코드명 */
	code_name?: string;
	/** 공통코드명 대체 필드 */
	name?: string;
	/** 상위 공통코드 값입니다. 직무 코드의 경우 직무구분 코드가 들어갑니다. */
	parent_code?: string | null;
	/** 화면 표시 순서 */
	sort_order?: number;
};

/**
 * ProjectOverviewTab 컴포넌트 props 타입입니다.
 */
type ProjectOverviewTabProps = {
	/** 프로젝트에 배정된 인력 목록 */
	assignments?: Assignment[];
	/** 직무 공통코드 목록 */
	jobRoleOptions: CommonCode[];
	/** 직무구분 공통코드 목록 */
	jobRoleCategoryOptions: CommonCode[];
};

/**
 * 공통코드 객체에서 화면에 표시할 이름을 가져옵니다.
 * code_name, name, code 순서로 fallback 처리합니다.
 */
function getCodeName(item?: CommonCode | null) {
	return item?.code_name || item?.name || item?.code || '';
}

/**
 * 공통코드 표시명을 가져오되 값이 없으면 '-'를 반환합니다.
 */
function getDisplayCodeName(item?: CommonCode | null) {
	return getCodeName(item) || '-';
}

/**
 * 배정 정보에서 직원명을 가져옵니다.
 * employee_name이 없으면 name을 사용하고, 둘 다 없으면 '-'를 반환합니다.
 */
function getEmployeeName(assignment: Assignment) {
	return assignment.employee_name || assignment.name || '-';
}

/**
 * 배정 정보에서 직무 코드를 가져옵니다.
 * 신규 컬럼 job_role_code를 우선 사용하고, 값이 없으면 기존 role을 대체값으로 사용합니다.
 */
function getAssignmentJobRoleCode(assignment: Assignment) {
	return assignment.job_role_code || assignment.role || '';
}

/**
 * 배정 인력의 직무명을 가져옵니다.
 *
 * 1순위: API에서 내려온 job_role_name
 * 2순위: jobRoleMap에서 찾은 공통코드명
 * 3순위: 기존 role 값
 * 최종 fallback: '직무 미지정'
 */
function getAssignmentJobRoleName(
	assignment: Assignment,
	jobRoleMap: Map<string, CommonCode>,
) {
	const jobRoleCode = getAssignmentJobRoleCode(assignment);
	const jobRole = jobRoleMap.get(jobRoleCode);

	return assignment.job_role_name || getCodeName(jobRole) || assignment.role || '직무 미지정';
}

/**
 * 배정 인력의 직무구분 코드를 가져옵니다.
 *
 * API에서 job_role_category_code가 내려오면 해당 값을 우선 사용하고,
 * 없으면 직무 공통코드의 parent_code를 사용합니다.
 */
function getAssignmentCategoryCode(
	assignment: Assignment,
	jobRoleMap: Map<string, CommonCode>,
) {
	const jobRoleCode = getAssignmentJobRoleCode(assignment);
	const jobRole = jobRoleMap.get(jobRoleCode);

	return assignment.job_role_category_code || jobRole?.parent_code || '';
}

/**
 * 배정 목록에서 중복을 제거한 총 투입 인원 수를 계산합니다.
 *
 * employee_id를 우선 기준으로 사용하고, 값이 없는 경우 id, assignment_id,
 * employee_name, name, index 순서로 대체 키를 생성합니다.
 */
function getUniqueEmployeeCount(assignments: Assignment[]) {
	const employeeSet = new Set<string>();

	assignments.forEach((assignment, index) => {
		const key =
			assignment.employee_id ??
			assignment.id ??
			assignment.assignment_id ??
			assignment.employee_name ??
			assignment.name ??
			index;

		employeeSet.add(String(key));
	});

	return employeeSet.size;
}

/**
 * 실제 인력이 배정된 직무구분 수를 계산합니다.
 *
 * ETC는 기타 그룹이므로 정식 직무구분 카운트에서 제외합니다.
 */
function getActiveRoleGroupCount(groupedAssignments: Record<string, Assignment[]>) {
	return Object.entries(groupedAssignments).filter(
		([categoryCode, members]) => categoryCode !== 'ETC' && members.length > 0,
	).length;
}

/**
 * 총 투입 인원 수에 따라 상단 상태 배지와 안내 문구를 반환합니다.
 */
function getCompositionStatus(totalCount: number) {
	if (totalCount === 0) {
		return {
			label: '미배정',
			message: '아직 배정된 인력이 없습니다.',
			className: 'border-slate-600 bg-slate-900/30 text-slate-300',
		};
	}

	return {
		label: '구성 확인',
		message: '프로젝트에 배정된 인력을 직무구분 기준으로 확인할 수 있습니다.',
		className: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200',
	};
}

/**
 * 상단 요약 영역에 표시되는 카드 컴포넌트입니다.
 */
function SummaryCard({
	label,
	value,
	description,
}: {
	/** 카드 제목 */
	label: string;
	/** 카드에 크게 표시할 값 */
	value: string;
	/** 카드 하단 설명 */
	description: string;
}) {
	return (
		<div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
			<p className="text-xs font-medium text-slate-400">{label}</p>
			<p className="mt-2 text-2xl font-bold text-slate-100">{value}</p>
			<p className="mt-1 text-xs text-slate-500">{description}</p>
		</div>
	);
}

/**
 * 직무구분별 투입 현황 카드 컴포넌트입니다.
 *
 * 직무구분명, 배정 인원 수, 주요 투입자 최대 3명을 표시합니다.
 */
function RoleCard({
	label,
	description,
	count,
	members,
	jobRoleMap,
}: {
	/** 직무구분명 */
	label: string;
	/** 직무구분 설명 */
	description?: string;
	/** 해당 직무구분에 배정된 인원 수 */
	count: number;
	/** 해당 직무구분에 속한 배정 인력 목록 */
	members: Assignment[];
	/** 직무 코드 기준으로 공통코드를 빠르게 찾기 위한 Map */
	jobRoleMap: Map<string, CommonCode>;
}) {
	/** 인원이 1명 이상 배정되었는지 여부 */
	const isAssigned = count > 0;

	return (
		<div
			className={[
				'rounded-lg border p-4 transition',
				isAssigned
					? 'border-violet-400/40 bg-violet-500/10'
					: 'border-white/10 bg-white/[0.03] opacity-60',
			].join(' ')}
		>
			<div className="flex items-start justify-between gap-3">
				<div>
					<p className="text-sm font-semibold text-slate-100">{label}</p>
					<p className="mt-1 text-xs text-slate-400">
						{description || '직무구분 기준'}
					</p>
				</div>

				<div
					className={[
						'min-w-12 rounded-md px-2 py-1 text-center text-sm font-bold',
						isAssigned ? 'bg-violet-500 text-white' : 'bg-slate-700 text-slate-300',
					].join(' ')}
				>
					{count}명
				</div>
			</div>

			<div className="mt-4 min-h-8">
				{isAssigned ? (
					<div className="flex flex-wrap gap-1.5">
						{members.slice(0, 3).map((member, index) => (
							<span
								key={`${getEmployeeName(member)}-${index}`}
								className="rounded-md bg-slate-900/70 px-2 py-1 text-xs text-slate-200"
							>
								{getEmployeeName(member)}
								<span className="text-slate-500">
									{' · '}
									{getAssignmentJobRoleName(member, jobRoleMap)}
								</span>
							</span>
						))}

						{members.length > 3 && (
							<span className="rounded-md bg-slate-900/70 px-2 py-1 text-xs text-slate-400">
								+{members.length - 3}
							</span>
						)}
					</div>
				) : (
					<p className="text-xs text-slate-500">미배정</p>
				)}
			</div>
		</div>
	);
}

/**
 * 화면에 표시할 직무구분 목록을 생성합니다.
 *
 * 공통코드 JOB_ROLE_CATEGORY 목록을 기준으로 사용하되,
 * 분류할 수 없는 배정 인력을 표시하기 위해 ETC 코드가 없으면 임의로 추가합니다.
 */
function buildDisplayCategoryOptions(jobRoleCategoryOptions: CommonCode[]) {
	/** 원본 props 배열을 직접 수정하지 않기 위한 복사본 */
	const options = [...jobRoleCategoryOptions];

	/** 기타 그룹이 이미 공통코드에 존재하는지 여부 */
	const hasEtc = options.some((item) => item.code === 'ETC');

	if (!hasEtc) {
		options.push({
			code: 'ETC',
			code_name: '기타',
			name: '기타',
			parent_code: null,
			sort_order: 999,
		});
	}

	return options.sort((a, b) => {
		/** 정렬 순서가 없으면 가장 뒤로 보내기 위한 기본값 */
		const aOrder = a.sort_order ?? 999;
		const bOrder = b.sort_order ?? 999;

		if (aOrder !== bOrder) return aOrder - bOrder;

		return a.code.localeCompare(b.code);
	});
}

/**
 * 프로젝트 개요 탭 메인 컴포넌트입니다.
 *
 * 배정 인력 데이터를 직무구분별로 그룹핑한 뒤,
 * 요약 카드와 직무구분별 현황 카드를 렌더링합니다.
 */
export default function ProjectOverviewTab({
	assignments = [],
	jobRoleOptions,
	jobRoleCategoryOptions,
}: ProjectOverviewTabProps) {
	/** 직무 코드를 key로 직무 공통코드를 빠르게 찾기 위한 Map */
	const jobRoleMap = new Map(jobRoleOptions.map((item) => [item.code, item]));

	/** 공통코드 JOB_ROLE_CATEGORY가 화면 카드의 기준 목록 */
	const displayCategoryOptions = buildDisplayCategoryOptions(jobRoleCategoryOptions);

	/** 직무구분 코드별 배정 인력 목록 */
	const groupedAssignments: Record<string, Assignment[]> = {};

	/** 직무구분 카드가 비어 있어도 화면에 표시되도록 그룹을 먼저 초기화 */
	displayCategoryOptions.forEach((category) => {
		groupedAssignments[category.code] = [];
	});

	/** 배정 인력의 직무구분 코드를 기준으로 그룹핑 */
	assignments.forEach((assignment) => {
		const categoryCode = getAssignmentCategoryCode(assignment, jobRoleMap);

		if (!categoryCode || !groupedAssignments[categoryCode]) {
			groupedAssignments.ETC.push(assignment);
			return;
		}

		groupedAssignments[categoryCode].push(assignment);
	});

	/** 중복을 제거한 총 투입 인원 수 */
	const totalEmployeeCount = getUniqueEmployeeCount(assignments);
	/** 실제 인력이 배정된 직무구분 수 */
	const activeRoleGroupCount = getActiveRoleGroupCount(groupedAssignments);
	/** 총 투입 인원 수에 따른 상태 배지와 안내 문구 */
	const compositionStatus = getCompositionStatus(totalEmployeeCount);

	/** 현재 프로젝트에 실제 등록된 직무명 목록 */
	const roleNames = Array.from(
		new Set(
			assignments
				.map((assignment) => getAssignmentJobRoleName(assignment, jobRoleMap))
				.filter((name) => name && name !== '직무 미지정'),
		),
	);

	return (
		<div className="space-y-4">
			<section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
				<div className="flex items-start justify-between gap-4">
					<div>
						<h3 className="text-base font-semibold text-slate-100">투입 구성 요약</h3>
						<p className="mt-1 text-sm text-slate-400">
							프로젝트에 배정된 인력을 공통코드 직무구분 기준으로 요약합니다.
						</p>
					</div>

					<span
						className={[
							'rounded-full border px-3 py-1 text-xs font-semibold',
							compositionStatus.className,
						].join(' ')}
					>
						{compositionStatus.label}
					</span>
				</div>

				<div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
					<SummaryCard
						label="총 투입 인원"
						value={`${totalEmployeeCount}명`}
						description="현재 프로젝트에 배정된 인원"
					/>

					<SummaryCard
						label="배정 직무구분"
						value={`${activeRoleGroupCount}개`}
						description="공통코드 직무구분 기준"
					/>

					<SummaryCard
						label="등록 직무"
						value={`${roleNames.length}개`}
						description="실제 배정된 직무 코드 기준"
					/>
				</div>

				<div className="mt-4 rounded-lg border border-white/10 bg-slate-950/30 px-4 py-3">
					<p className="text-sm text-slate-300">{compositionStatus.message}</p>
				</div>
			</section>

			<section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
				<div className="flex items-center justify-between">
					<div>
						<h3 className="text-base font-semibold text-slate-100">직무구분별 투입 현황</h3>
						<p className="mt-1 text-sm text-slate-400">
							공통코드에 등록된 직무구분별 배정 인원과 주요 투입자를 확인합니다.
						</p>
					</div>
				</div>

				<div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
					{displayCategoryOptions.map((category) => {
						/** 현재 직무구분에 해당하는 배정 인력 목록 */
						const members = groupedAssignments[category.code] ?? [];

						return (
							<RoleCard
								key={category.code}
								label={getDisplayCodeName(category)}
								description="직무구분"
								count={members.length}
								members={members}
								jobRoleMap={jobRoleMap}
							/>
						);
					})}
				</div>
			</section>
		</div>
	);
}
