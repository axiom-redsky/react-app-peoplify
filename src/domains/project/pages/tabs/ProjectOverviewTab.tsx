type Assignment = {
	id?: number | string;
	assignment_id?: number | string;
	employee_id?: number | string;
	employee_name?: string;
	name?: string;
	role?: string | null;
	start_date?: string | null;
	end_date?: string | null;
	position?: string;
};

type ProjectOverviewTabProps = {
	assignments?: Assignment[];
};

const ROLE_GROUPS = [
	{
		key: 'PM',
		label: 'PM',
		description: '프로젝트 총괄',
		keywords: ['pm', '프로젝트 관리자', '프로젝트관리자', 'project manager'],
	},
	{
		key: 'PL',
		label: 'PL',
		description: '파트 리딩',
		keywords: ['pl', '파트리더', '리더', 'lead', 'leader'],
	},
	{
		key: 'DEVELOPER',
		label: '개발자',
		description: '개발 수행',
		keywords: ['개발', '백엔드', '프론트엔드', '풀스택', 'backend', 'frontend', 'fullstack', 'developer'],
	},
	{
		key: 'PUBLISH_DESIGN',
		label: '퍼블리셔/디자인',
		description: 'UI 구현 및 디자인',
		keywords: ['퍼블리셔', '퍼블', '디자이너', '디자인', '디자인팀', 'ui', 'ux', 'publisher', 'designer'],
	},
	{
		key: 'BUSINESS',
		label: '사업관리',
		description: '사업/운영 관리',
		keywords: ['사업관리', 'pmo', '기획', '운영관리', 'business'],
	},
	{
		key: 'QA',
		label: 'QA/테스터',
		description: '검증 및 테스트',
		keywords: ['qa', 'QA팀', '테스터', '테스트', '검증', 'tester'],
	},
] as const;

function getEmployeeName(assignment: Assignment) {
	return assignment.employee_name || assignment.name || '-';
}

function getRoleName(assignment: Assignment) {
	return assignment.role?.trim() || '역할 미지정';
}

function getRoleGroupKey(role?: string | null) {
	const roleText = (role || '').toLowerCase();

	const matchedGroup = ROLE_GROUPS.find((group) =>
		group.keywords.some((keyword) => roleText.includes(keyword.toLowerCase())),
	);

	return matchedGroup?.key || 'ETC';
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
	return ROLE_GROUPS.filter((group) => groupedAssignments[group.key]?.length > 0).length;
}

function getCompositionStatus(groupedAssignments: Record<string, Assignment[]>, totalCount: number) {
	if (totalCount === 0) {
		return {
			label: '미배정',
			message: '아직 배정된 인력이 없습니다.',
			className: 'border-slate-600 bg-slate-900/30 text-slate-300',
		};
	}

	const hasPm = groupedAssignments.PM?.length > 0;
	const hasDeveloper = groupedAssignments.DEVELOPER?.length > 0;

	if (!hasPm || !hasDeveloper) {
		return {
			label: '확인 필요',
			message: 'PM 또는 개발자 역할 배정 여부를 확인하세요.',
			className: 'border-amber-400/40 bg-amber-500/10 text-amber-200',
		};
	}

	return {
		label: '구성 완료',
		message: '프로젝트 운영에 필요한 핵심 역할이 배정되어 있습니다.',
		className: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200',
	};
}

function RoleCard({
	label,
	description,
	count,
	members,
}: {
	label: string;
	description: string;
	count: number;
	members: Assignment[];
}) {
	const isAssigned = count > 0;

	return (
		<div
			className={[
				'rounded-lg border p-4 transition',
				isAssigned ? 'border-violet-400/40 bg-violet-500/10' : 'border-white/10 bg-white/[0.03] opacity-60',
			].join(' ')}
		>
			<div className="flex items-start justify-between gap-3">
				<div>
					<p className="text-sm font-semibold text-slate-100">{label}</p>
					<p className="mt-1 text-xs text-slate-400">{description}</p>
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
							</span>
						))}

						{members.length > 3 && (
							<span className="rounded-md bg-slate-900/70 px-2 py-1 text-xs text-slate-400">+{members.length - 3}</span>
						)}
					</div>
				) : (
					<p className="text-xs text-slate-500">미배정</p>
				)}
			</div>
		</div>
	);
}

function SummaryCard({ label, value, description }: { label: string; value: string; description: string }) {
	return (
		<div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
			<p className="text-xs font-medium text-slate-400">{label}</p>
			<p className="mt-2 text-2xl font-bold text-slate-100">{value}</p>
			<p className="mt-1 text-xs text-slate-500">{description}</p>
		</div>
	);
}

export default function ProjectOverviewTab({ assignments = [] }: ProjectOverviewTabProps) {
	const groupedAssignments: Record<string, Assignment[]> = {
		PM: [],
		PL: [],
		DEVELOPER: [],
		PUBLISH_DESIGN: [],
		BUSINESS: [],
		QA: [],
		ETC: [],
	};

	assignments.forEach((assignment) => {
	const groupKey = getRoleGroupKey(
		assignment.role?.trim() || assignment.position?.trim(),
	);

	groupedAssignments[groupKey].push(assignment);
});

	const totalEmployeeCount = getUniqueEmployeeCount(assignments);
	const activeRoleGroupCount = getActiveRoleGroupCount(groupedAssignments);
	const compositionStatus = getCompositionStatus(groupedAssignments, totalEmployeeCount);

	const roleNames = Array.from(new Set(assignments.map((assignment) => getRoleName(assignment)).filter(Boolean)));

	return (
		<div className="space-y-4">
			<section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
				<div className="flex items-start justify-between gap-4">
					<div>
						<h3 className="text-base font-semibold text-slate-100">투입 구성 요약</h3>
						<p className="mt-1 text-sm text-slate-400">프로젝트에 배정된 인력을 역할 기준으로 요약합니다.</p>
					</div>

					<span
						className={['rounded-full border px-3 py-1 text-xs font-semibold', compositionStatus.className].join(' ')}
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
						label="배정 역할군"
						value={`${activeRoleGroupCount}개`}
						description="PM, 개발자 등 역할 그룹 기준"
					/>

					<SummaryCard
						label="등록 역할"
						value={`${roleNames.length}개`}
						description="실제 입력된 역할명 기준"
					/>
				</div>

				<div className="mt-4 rounded-lg border border-white/10 bg-slate-950/30 px-4 py-3">
					<p className="text-sm text-slate-300">{compositionStatus.message}</p>
				</div>
			</section>

			<section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
				<div className="flex items-center justify-between">
					<div>
						<h3 className="text-base font-semibold text-slate-100">역할별 투입 현황</h3>
						<p className="mt-1 text-sm text-slate-400">역할군별 배정 인원과 주요 투입자를 확인합니다.</p>
					</div>
				</div>

				<div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
					{ROLE_GROUPS.map((group) => {
						const members = groupedAssignments[group.key] ?? [];

						return (
							<RoleCard
								key={group.key}
								label={group.label}
								description={group.description}
								count={members.length}
								members={members}
							/>
						);
					})}
				</div>

				{groupedAssignments.ETC.length > 0 && (
					<div className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] p-4">
						<div className="flex items-start justify-between gap-3">
							<div>
								<p className="text-sm font-semibold text-slate-100">기타 역할</p>
								<p className="mt-1 text-xs text-slate-400">정의된 역할군에 포함되지 않은 역할입니다.</p>
							</div>

							<div className="rounded-md bg-slate-700 px-2 py-1 text-sm font-bold text-slate-200">
								{groupedAssignments.ETC.length}명
							</div>
						</div>

						<div className="mt-4 flex flex-wrap gap-1.5">
							{groupedAssignments.ETC.map((member, index) => (
								<span
									key={`${getEmployeeName(member)}-${index}`}
									className="rounded-md bg-slate-900/70 px-2 py-1 text-xs text-slate-200"
								>
									{getEmployeeName(member)} · {getRoleName(member)}
								</span>
							))}
						</div>
					</div>
				)}
			</section>
		</div>
	);
}
