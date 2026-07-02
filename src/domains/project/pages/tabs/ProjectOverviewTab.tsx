type Assignment = {
	id?: number | string;
	assignment_id?: number | string;
	employee_id?: number | string;
	employee_name?: string;
	name?: string;

	role?: string | null;

	job_role_code?: string | null;
	job_role_name?: string | null;
	job_role_category_code?: string | null;
	job_role_category_name?: string | null;

	start_date?: string | null;
	end_date?: string | null;
	position?: string;
};

type CommonCode = {
	code: string;
	code_name?: string;
	name?: string;
	parent_code?: string | null;
	sort_order?: number;
};

type ProjectOverviewTabProps = {
	assignments?: Assignment[];
	jobRoleOptions: CommonCode[];
	jobRoleCategoryOptions: CommonCode[];
};

function getCodeName(item?: CommonCode | null) {
	return item?.code_name || item?.name || item?.code || '';
}

function getDisplayCodeName(item?: CommonCode | null) {
	return getCodeName(item) || '-';
}

function getEmployeeName(assignment: Assignment) {
	return assignment.employee_name || assignment.name || '-';
}

function getAssignmentJobRoleCode(assignment: Assignment) {
	return assignment.job_role_code || assignment.role || '';
}

function getAssignmentJobRoleName(
	assignment: Assignment,
	jobRoleMap: Map<string, CommonCode>,
) {
	const jobRoleCode = getAssignmentJobRoleCode(assignment);
	const jobRole = jobRoleMap.get(jobRoleCode);

	return assignment.job_role_name || getCodeName(jobRole) || assignment.role || '직무 미지정';
}

function getAssignmentCategoryCode(
	assignment: Assignment,
	jobRoleMap: Map<string, CommonCode>,
) {
	const jobRoleCode = getAssignmentJobRoleCode(assignment);
	const jobRole = jobRoleMap.get(jobRoleCode);

	return assignment.job_role_category_code || jobRole?.parent_code || '';
}

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

function getActiveRoleGroupCount(groupedAssignments: Record<string, Assignment[]>) {
	return Object.entries(groupedAssignments).filter(
		([categoryCode, members]) => categoryCode !== 'ETC' && members.length > 0,
	).length;
}

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

function SummaryCard({
	label,
	value,
	description,
}: {
	label: string;
	value: string;
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

function RoleCard({
	label,
	description,
	count,
	members,
	jobRoleMap,
}: {
	label: string;
	description?: string;
	count: number;
	members: Assignment[];
	jobRoleMap: Map<string, CommonCode>;
}) {
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

function buildDisplayCategoryOptions(jobRoleCategoryOptions: CommonCode[]) {
	const options = [...jobRoleCategoryOptions];

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
		const aOrder = a.sort_order ?? 999;
		const bOrder = b.sort_order ?? 999;

		if (aOrder !== bOrder) return aOrder - bOrder;

		return a.code.localeCompare(b.code);
	});
}

export default function ProjectOverviewTab({
	assignments,
	jobRoleOptions,
	jobRoleCategoryOptions,
}: ProjectOverviewTabProps) {
	const jobRoleMap = new Map(jobRoleOptions.map((item) => [item.code, item]));

	// 공통코드 JOB_ROLE_CATEGORY가 화면 카드의 기준 목록
	const displayCategoryOptions = buildDisplayCategoryOptions(jobRoleCategoryOptions);

	const groupedAssignments: Record<string, Assignment[]> = {};

	displayCategoryOptions.forEach((category) => {
		groupedAssignments[category.code] = [];
	});

	assignments.forEach((assignment) => {
		const categoryCode = getAssignmentCategoryCode(assignment, jobRoleMap);

		if (!categoryCode || !groupedAssignments[categoryCode]) {
			groupedAssignments.ETC.push(assignment);
			return;
		}

		groupedAssignments[categoryCode].push(assignment);
	});

	const totalEmployeeCount = getUniqueEmployeeCount(assignments);
	const activeRoleGroupCount = getActiveRoleGroupCount(groupedAssignments);
	const compositionStatus = getCompositionStatus(totalEmployeeCount);

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