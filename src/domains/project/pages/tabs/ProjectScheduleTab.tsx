// ProjectScheduleTab v6 - stable hover tooltip without mouse-follow jitter
import { useMemo, useState, type MouseEvent } from 'react';

type Assignment = {
	id?: number | string;
	assignment_id?: number | string;
	employee_id?: number | string;
	employee_name?: string;
	name?: string;
	position?: string | null;
	role?: string | null;
	start_date?: string | null;
	end_date?: string | null;
};

type Project = {
	start_date?: string | null;
	end_date?: string | null;
	startDate?: string | null;
	endDate?: string | null;
};

type ProjectScheduleTabProps = {
	project?: Project | null;
	assignments?: Assignment[];
};

type RoleGroup = {
	key: string;
	label: string;
	keywords: string[];
	color: string;
	dot: string;
	selectedClassName: string;
};

type TooltipState = {
	visible: boolean;
	x: number;
	y: number;
	title: string;
	startDate: string;
	endDate: string;
	roleText: string;
};

const ROLE_GROUPS: RoleGroup[] = [
	{
		key: 'PM',
		label: 'PM',
		keywords: ['pm', '프로젝트 관리자', '프로젝트관리자', 'project manager'],
		color: 'bg-violet-500',
		dot: 'bg-violet-400',
		selectedClassName: 'border-violet-400 bg-violet-500/20 text-violet-100 ring-2 ring-violet-400/30',
	},
	{
		key: 'PL',
		label: 'PL',
		keywords: ['pl', '파트리더', '리더', 'lead', 'leader'],
		color: 'bg-blue-500',
		dot: 'bg-blue-400',
		selectedClassName: 'border-blue-400 bg-blue-500/20 text-blue-100 ring-2 ring-blue-400/30',
	},
	{
		key: 'DEVELOPER',
		label: '개발자',
		keywords: ['개발', '백엔드', '프론트엔드', '풀스택', 'backend', 'frontend', 'fullstack', 'developer'],
		color: 'bg-emerald-500',
		dot: 'bg-emerald-400',
		selectedClassName: 'border-emerald-400 bg-emerald-500/20 text-emerald-100 ring-2 ring-emerald-400/30',
	},
	{
		key: 'PUBLISH_DESIGN',
		label: '퍼블리셔/디자인',
		keywords: ['퍼블리셔', '퍼블', '디자인', '디자이너', '디자인팀', 'ui', 'ux', 'publisher', 'designer'],
		color: 'bg-pink-500',
		dot: 'bg-pink-400',
		selectedClassName: 'border-pink-400 bg-pink-500/20 text-pink-100 ring-2 ring-pink-400/30',
	},
	{
		key: 'BUSINESS',
		label: '사업관리',
		keywords: ['사업관리', 'pmo', '기획', '운영관리', 'business'],
		color: 'bg-amber-500',
		dot: 'bg-amber-400',
		selectedClassName: 'border-amber-400 bg-amber-500/20 text-amber-100 ring-2 ring-amber-400/30',
	},
	{
		key: 'QA',
		label: 'QA/테스터',
		keywords: ['qa', '테스터', '테스트', '검증', 'tester'],
		color: 'bg-cyan-500',
		dot: 'bg-cyan-400',
		selectedClassName: 'border-cyan-400 bg-cyan-500/20 text-cyan-100 ring-2 ring-cyan-400/30',
	},
	{
		key: 'ETC',
		label: '기타',
		keywords: [],
		color: 'bg-slate-500',
		dot: 'bg-slate-400',
		selectedClassName: 'border-slate-400 bg-slate-500/20 text-slate-100 ring-2 ring-slate-400/30',
	},
];

const DAY_MS = 24 * 60 * 60 * 1000;

function parseDate(value?: string | null) {
	if (!value) return null;

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return null;
	}

	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatDate(date?: Date | null) {
	if (!date) return '-';

	const yyyy = date.getFullYear();
	const mm = String(date.getMonth() + 1).padStart(2, '0');
	const dd = String(date.getDate()).padStart(2, '0');

	return `${yyyy}.${mm}.${dd}`;
}

function getDays(startDate: Date, endDate: Date) {
	return Math.max(Math.round((endDate.getTime() - startDate.getTime()) / DAY_MS) + 1, 1);
}

function getOffsetDays(baseDate: Date, targetDate: Date) {
	return Math.round((targetDate.getTime() - baseDate.getTime()) / DAY_MS);
}

function getEmployeeName(assignment: Assignment) {
	return assignment.employee_name || assignment.name || '-';
}

function getRoleName(assignment: Assignment) {
	return assignment.role?.trim() || assignment.position?.trim() || '역할 미지정';
}

function getRoleGroupKeyByText(value?: string | null) {
	const text = value?.trim().toLowerCase() || '';

	if (!text) return 'ETC';

	const matchedGroup = ROLE_GROUPS.find((group) =>
		group.keywords.some((keyword) => text.includes(keyword.toLowerCase())),
	);

	return matchedGroup?.key || 'ETC';
}

function getRoleGroupKey(assignment: Assignment) {
	const roleGroupKey = getRoleGroupKeyByText(assignment.role);

	if (roleGroupKey !== 'ETC') {
		return roleGroupKey;
	}

	return getRoleGroupKeyByText(assignment.position);
}

function getRoleStyle(groupKey: string) {
	return ROLE_GROUPS.find((group) => group.key === groupKey) || ROLE_GROUPS[ROLE_GROUPS.length - 1];
}

function getProjectStartDate(project?: Project | null) {
	return parseDate(project?.start_date || project?.startDate || null);
}

function getProjectEndDate(project?: Project | null) {
	return parseDate(project?.end_date || project?.endDate || null);
}

function getStatus(startDate: Date, endDate: Date) {
	const today = new Date();
	const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

	if (todayDate < startDate) return '예정';
	if (todayDate > endDate) return '종료';

	return '투입중';
}

function getBarStyle(projectStartDate: Date, projectEndDate: Date, startDate: Date, endDate: Date) {
	const totalDays = getDays(projectStartDate, projectEndDate);
	const normalizedStartDate = startDate < projectStartDate ? projectStartDate : startDate;
	const normalizedEndDate = endDate > projectEndDate ? projectEndDate : endDate;

	const left = Math.max((getOffsetDays(projectStartDate, normalizedStartDate) / totalDays) * 100, 0);
	const width = Math.max(
		Math.min((getDays(normalizedStartDate, normalizedEndDate) / totalDays) * 100, 100 - left),
		1,
	);

	return {
		left: `calc(12px + ${left}%)`,
		width: `calc(${width}% - 24px)`,
		minWidth: '40px',
	};
}

export default function ProjectScheduleTab({ project, assignments = [] }: ProjectScheduleTabProps) {
	const [selectedGroupKeys, setSelectedGroupKeys] = useState<string[]>([]);
	const [tooltip, setTooltip] = useState<TooltipState>({
		visible: false,
		x: 0,
		y: 0,
		title: '',
		startDate: '',
		endDate: '',
		roleText: '',
	});

	const projectStartDate = getProjectStartDate(project);
	const projectEndDate = getProjectEndDate(project);

	const groupedAssignments = useMemo(() => {
		const groups: Record<string, Assignment[]> = {
			PM: [],
			PL: [],
			DEVELOPER: [],
			PUBLISH_DESIGN: [],
			BUSINESS: [],
			QA: [],
			ETC: [],
		};

		assignments.forEach((assignment) => {
			const groupKey = getRoleGroupKey(assignment);
			groups[groupKey].push(assignment);
		});

		return groups;
	}, [assignments]);

	if (!projectStartDate || !projectEndDate) {
		return (
			<div className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center">
				<p className="text-sm font-semibold text-slate-200">프로젝트 일정 정보가 없습니다.</p>
				<p className="mt-2 text-sm text-slate-500">프로젝트 시작일과 종료일을 확인하세요.</p>
			</div>
		);
	}

	const totalDays = getDays(projectStartDate, projectEndDate);
	const assignedGroups = ROLE_GROUPS.filter((group) => groupedAssignments[group.key].length > 0);
	const isAllSelected = selectedGroupKeys.length === 0;
	const visibleGroups = isAllSelected
		? assignedGroups
		: ROLE_GROUPS.filter((group) => selectedGroupKeys.includes(group.key));

	function handleSelectAll() {
		setSelectedGroupKeys([]);
		setTooltip((prev) => ({ ...prev, visible: false }));
	}

	function handleToggleGroup(groupKey: string) {
		setSelectedGroupKeys((prev) => {
			if (prev.includes(groupKey)) {
				return prev.filter((key) => key !== groupKey);
			}

			return [...prev, groupKey];
		});

		setTooltip((prev) => ({ ...prev, visible: false }));
	}

	function showTooltip(event: MouseEvent<HTMLDivElement>, assignment: Assignment, startDate: Date, endDate: Date) {
		const rect = event.currentTarget.getBoundingClientRect();

		setTooltip({
			visible: true,
			x: rect.left + rect.width / 2,
			y: rect.top,
			title: getEmployeeName(assignment),
			startDate: formatDate(startDate),
			endDate: formatDate(endDate),
			roleText: getRoleName(assignment),
		});
	}

	function hideTooltip() {
		setTooltip((prev) => ({ ...prev, visible: false }));
	}

	return (
		<div className="space-y-4">
			<section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
				<div className="flex items-start justify-between gap-4">
					<div>
						<h3 className="text-base font-semibold text-slate-100">일정 요약</h3>
						<p className="mt-1 text-sm text-slate-400">프로젝트 전체 기간과 인력별 투입 기간을 확인합니다.</p>
					</div>

					<div className="rounded-full border border-violet-400/40 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-200">
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
						<p className="text-xs text-slate-400">역할군</p>
						<p className="mt-2 text-xl font-bold text-slate-100">{assignedGroups.length}개</p>
					</div>
				</div>
			</section>

			<section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
				<div className="mb-4">
					<h3 className="text-base font-semibold text-slate-100">역할별 투입 캘린더</h3>
					<p className="mt-1 text-sm text-slate-400">역할별 색상으로 투입 시작일과 종료일을 표시합니다.</p>
				</div>

				<div className="mb-4 flex flex-wrap gap-2">
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
						<span className="rounded-full bg-slate-950/40 px-1.5 py-0.5 text-[10px] text-slate-300">{assignments.length}</span>
					</button>

					{ROLE_GROUPS.map((group) => {
						const count = groupedAssignments[group.key].length;
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
									isSelected ? group.selectedClassName : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/30 hover:text-slate-100',
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
					현재 선택: <span className="font-semibold text-slate-200">{isAllSelected ? '전체' : selectedGroupKeys.map((key) => getRoleStyle(key).label).join(', ')}</span>
				</div>

				<div className="overflow-x-auto rounded-lg border border-white/10">
					<div className="min-w-[1000px]">
						<div className="grid grid-cols-[220px_1fr] border-b border-white/10 bg-slate-950/40">
							<div className="border-r border-white/10 p-3 text-xs font-semibold text-slate-400">투입 인력</div>

							<div className="relative p-3">
								<div className="flex justify-between text-xs text-slate-400">
									<span>{formatDate(projectStartDate)}</span>
									<span>{formatDate(projectEndDate)}</span>
								</div>
							</div>
						</div>

						<div className="grid grid-cols-[220px_1fr] border-b border-white/10">
							<div className="border-r border-white/10 bg-white/[0.03] p-3">
								<p className="text-sm font-semibold text-slate-100">프로젝트 전체</p>
								<p className="mt-1 text-xs text-slate-500">{formatDate(projectStartDate)} ~ {formatDate(projectEndDate)}</p>
							</div>

							<div className="relative h-14 p-3">
								<div className="absolute left-3 right-3 top-1/2 h-7 -translate-y-1/2 rounded-full bg-violet-600/80 px-3 text-xs font-semibold leading-7 text-white">
									프로젝트 기간
								</div>
							</div>
						</div>

						{visibleGroups.length === 0 ? (
							<div className="p-6 text-center text-sm text-slate-500">
								{isAllSelected ? '배정된 인력이 없습니다.' : '선택한 역할군에 배정된 인력이 없습니다.'}
							</div>
						) : (
							visibleGroups.map((group) => {
								const style = getRoleStyle(group.key);
								const members = groupedAssignments[group.key];

								return (
									<div key={group.key}>
										<div className="grid grid-cols-[220px_1fr] border-b border-white/10 bg-white/[0.02]">
											<div className="border-r border-white/10 px-3 py-2">
												<div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
													<span className={`h-2 w-2 rounded-full ${style.dot}`} />
													{group.label}
												</div>
											</div>
											<div />
										</div>

										{members.length === 0 ? (
											<div className="grid grid-cols-[220px_1fr] border-b border-white/10">
												<div className="border-r border-white/10 p-3">
													<div className="flex items-start justify-between gap-2">
														<div className="min-w-0">
															<p className="truncate text-sm font-semibold text-slate-400">배정 인력 없음</p>
															<p className="mt-1 truncate text-xs text-slate-500">{group.label}</p>
															<p className="mt-1 text-[11px] text-slate-500">-</p>
														</div>

														<span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-slate-400">
															미배정
														</span>
													</div>
												</div>

												<div className="relative h-16 p-3">
													<div className="absolute left-3 right-3 top-1/2 h-px bg-white/10" />
													<div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/10 bg-white/[0.02] px-3 py-1 text-xs text-slate-500">
														해당 역할군에 배정된 인력이 없습니다.
													</div>
												</div>
											</div>
										) : (
											members.map((assignment, index) => {
												const startDate = parseDate(assignment.start_date) || projectStartDate;
												const endDate = parseDate(assignment.end_date) || projectEndDate;
												return (
													<div
														key={`${assignment.employee_id ?? assignment.id ?? assignment.assignment_id ?? index}`}
														className="grid grid-cols-[220px_1fr] border-b border-white/10"
													>
														<div className="border-r border-white/10 p-3">
															<div className="flex items-start justify-between gap-2">
																<div className="min-w-0">
																	<p className="truncate text-sm font-semibold text-slate-100">{getEmployeeName(assignment)}</p>
																	<p className="mt-1 truncate text-xs text-slate-500">{getRoleName(assignment)}</p>
																	<p className="mt-1 text-[11px] text-slate-500">{formatDate(startDate)} ~ {formatDate(endDate)}</p>
																</div>

																<span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-slate-300">
																	{getStatus(startDate, endDate)}
																</span>
															</div>
														</div>

														<div className="relative h-16 p-3">
															<div className="absolute left-3 right-3 top-1/2 h-px bg-white/10" />

															<div
																aria-label={`${getEmployeeName(assignment)} 투입일 ${formatDate(startDate)} 철수일 ${formatDate(endDate)}`}
																onMouseEnter={(event) => showTooltip(event, assignment, startDate, endDate)}
																onMouseLeave={hideTooltip}
																className={`absolute top-1/2 z-10 h-7 -translate-y-1/2 cursor-help rounded-full px-3 text-xs font-semibold leading-7 text-white shadow-sm ${style.color}`}
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
					<p className="text-slate-400">{tooltip.roleText}</p>
					<p>투입일: {tooltip.startDate}</p>
					<p>철수일: {tooltip.endDate}</p>
				</div>
			)}
		</div>
	);
}
