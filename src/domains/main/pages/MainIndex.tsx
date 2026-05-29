import PageHeader from '@/shared/components/ui/PageHeader';
import StatusBadge, { type StatusType } from '@/shared/components/ui/StatusBadge';
import { Users, FolderKanban, UserCheck, AlertTriangle, TrendingUp } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { useApi } from '@axiom/hooks';
import dayjs from 'dayjs';

// ─── 타입 정의 ────────────────────────────────────────────────────────────────────

type TDashboardSummary = {
	totalEmployees: number;
	deployed: number;
	bench: number;
	activeProjects: number;
};

type TActiveProject = {
	id: number;
	name: string;
	client: string;
	start_date: string;
	end_date: string;
	status: string;
	progress_pct: number;
	deployed_count: string;
	tech_stack: string[];
};

type TBenchMember = {
	id: number;
	name: string;
	department: string;
	position: string;
	hire_date: string;
	skills: string[];
};

// ─── 상수 데이터 ───────────────────────────────────────────────────────────────────

const kpiCards = [
	{
		label: '전체 인원',
		valueKey: 'totalEmployees',
		unit: '명',
		sub: '재직 중',
		icon: Users,
		trend: '+2',
		iconBg: 'bg-teal-500/15',
		iconColor: 'text-teal-400',
		accent: 'from-teal-500/20 to-transparent',
		ring: 'ring-teal-500/20',
		border: 'border-t-teal-500',
	},
	{
		label: '투입 중',
		valueKey: 'deployed',
		unit: '명',
		sub: '26 개 프로젝트 현장',
		icon: UserCheck,
		trend: '81%',
		iconBg: 'bg-emerald-500/15',
		iconColor: 'text-emerald-400',
		accent: 'from-emerald-500/20 to-transparent',
		ring: 'ring-emerald-500/20',
		border: 'border-t-emerald-500',
	},
	{
		label: '벤치 (가용)',
		valueKey: 'bench',
		unit: '명',
		sub: '배정 가능 인원',
		icon: Users,
		trend: '19%',
		iconBg: 'bg-amber-500/15',
		iconColor: 'text-amber-400',
		accent: 'from-amber-500/20 to-transparent',
		ring: 'ring-amber-500/20',
		border: 'border-t-amber-500',
	},
	{
		label: '진행 프로젝트',
		valueKey: 'activeProjects',
		unit: '건',
		sub: '완료 1 · 예정 1 별도',
		icon: FolderKanban,
		trend: '3 건',
		iconBg: 'bg-sky-500/15',
		iconColor: 'text-sky-400',
		accent: 'from-sky-500/20 to-transparent',
		ring: 'ring-sky-500/20',
		border: 'border-t-sky-500',
	},
];

const benchAvatarColors = [
	{ bg: 'bg-violet-500/20', text: 'text-violet-400', ring: 'ring-violet-500/30' },
	{ bg: 'bg-sky-500/20', text: 'text-sky-400', ring: 'ring-sky-500/30' },
	{ bg: 'bg-rose-500/20', text: 'text-rose-400', ring: 'ring-rose-500/30' },
];

const urgentWithdrawals = [
	{ name: '최유나', project: 'A 금융', date: '06.15', dday: 'D-20' },
	{ name: '정다은', project: 'B 공공', date: '06.28', dday: 'D-33' },
];

// ─── 유틸리티 ─────────────────────────────────────────────────────────────────────

/** 날짜 포맷팅 (YYYY-MM-DD → YYYY.MM.DD) */
const formatDate = (dateString: string): string => {
	return dayjs(dateString).format('YYYY.MM.DD');
};

/** 입사일로부터 재직 기간 계산 (예: 2 년 3 개월) */
const calculateTenure = (hireDate: string): string => {
	const hire = dayjs(hireDate);
	const now = dayjs();
	const years = now.diff(hire, 'year');
	const months = now.diff(hire, 'month') % 12;
	if (years > 0 && months > 0) {
		return `${years}년 ${months}개월`;
	}
	if (years > 0) {
		return `${years}년`;
	}
	if (months > 0) {
		return `${months}개월`;
	}
	return `${now.diff(hire, 'day')}일`;
};

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────────────

export default function MainIndex(): React.ReactNode {
	/** KPI 데이터 조회 */
	const {
		data: summary,
		isPending: isSummaryPending,
		error: summaryError,
	} = useApi<{ data: TDashboardSummary; success: boolean }>('/api/dashboard/summary');

	/** 진행 중 프로젝트 조회 */
	const {
		data: activeProjectsData,
		isPending: isProjectsPending,
		error: projectsError,
	} = useApi<{ data: TActiveProject[]; success: boolean }>('/api/dashboard/active-projects');

	/** 벤치 인원 조회 */
	const {
		data: benchMembersData,
		isPending: isBenchPending,
		error: benchError,
	} = useApi<{ data: TBenchMember[]; success: boolean }>('/api/dashboard/bench-members');

	// 로딩/에러 상태
	const isPending = isSummaryPending || isProjectsPending || isBenchPending;
	const error = summaryError || projectsError || benchError;

	// UI 렌더링
	return (
		<div className="p-6 space-y-6">
			<PageHeader
				title="대시보드"
				actions={
					<span className="text-sm text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-lg">
						2026 년 5 월 26 일 (화)
					</span>
				}
			/>

			{/* KPI 카드 */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
				{kpiCards.map((card) => {
					const Icon = card.icon;
					const value = summary?.data?.[card.valueKey as keyof TDashboardSummary] ?? 0;
					return (
						<div
							key={card.label}
							className={cn(
								'relative bg-card rounded-2xl border border-t-2 p-5 overflow-hidden',
								'ring-1 transition-shadow hover:shadow-lg',
								card.border,
								card.ring,
							)}
						>
							<div className={cn('absolute inset-0 bg-linear-to-br opacity-60', card.accent)} />
							<div className="relative">
								<div className="flex items-start justify-between mb-3">
									<div className={cn('p-2.5 rounded-xl', card.iconBg)}>
										<Icon className={cn('w-5 h-5', card.iconColor)} />
									</div>
									<span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
										<TrendingUp className="w-3 h-3" />
										{card.trend}
									</span>
								</div>
								<p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{card.label}</p>
								<p className="text-3xl font-bold text-foreground mt-0.5 leading-none">
									{value}
									<span className="text-base font-medium text-muted-foreground ml-0.5">{card.unit}</span>
								</p>
								<p className="text-xs text-muted-foreground mt-2">{card.sub}</p>
							</div>
						</div>
					);
				})}
			</div>

			{/* 로딩/에러 상태 */}
			{isPending && (
				<div className="text-center py-12">
					<p className="text-sm text-muted-foreground">로딩 중…</p>
				</div>
			)}

			{error && (
				<div className="text-center py-12">
					<p className="text-sm text-red-600">에러: {error.message}</p>
				</div>
			)}

			{/* 진행 중 프로젝트 및 사이드바 */}
			{!isPending && !error && (
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
					{/* 진행 중 프로젝트 */}
					<div className="lg:col-span-2 bg-card rounded-2xl border p-5">
						<div className="flex items-center justify-between mb-4">
							<h2 className="font-semibold text-foreground">진행 중 프로젝트</h2>
							<span className="text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">
								{activeProjectsData?.data?.length ?? 0} 건
							</span>
						</div>
						<div className="space-y-1">
							<div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
								<span>프로젝트명</span>
								<span className="text-center">투입</span>
								<span>기간</span>
								<span>상태</span>
							</div>
							{activeProjectsData?.data?.map((proj) => (
								<div
									key={proj.id}
									className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 items-center px-3 py-3 rounded-xl hover:bg-muted/40 transition-colors group"
								>
									<div>
										<p className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
											{proj.name}
										</p>
										<p className="text-xs text-muted-foreground mt-0.5">{proj.client}</p>
										<div className="mt-2 h-1 bg-muted rounded-full overflow-hidden w-32">
											<div
												className="h-full bg-emerald-500 rounded-full transition-all"
												style={{ width: `${proj.progress_pct}%` }}
											/>
										</div>
										{/* 기술스택 표시 */}
										<div className="mt-1 flex flex-wrap gap-1">
											{proj.tech_stack.slice(0, 3).map((tech) => (
												<span
													key={tech}
													className="text-[10px] px-1.5 py-0.5 bg-sky-500/10 text-sky-400 rounded"
												>
													{tech}
												</span>
											))}
											{proj.tech_stack.length > 3 && (
												<span className="text-[10px] px-1.5 py-0.5 bg-muted text-muted-foreground rounded">
													+{proj.tech_stack.length - 3}
												</span>
											)}
										</div>
									</div>
									<div className="text-center">
										<span className="text-lg font-bold text-foreground">{proj.deployed_count}</span>
										<span className="text-xs text-muted-foreground">명</span>
									</div>
									<div className="text-xs text-muted-foreground whitespace-nowrap">
										{formatDate(proj.start_date)} ~ {formatDate(proj.end_date)}
									</div>
									<StatusBadge status={proj.status as StatusType} />
								</div>
							))}
						</div>
					</div>

					{/* 우측 사이드 */}
					<div className="space-y-4">
						{/* 벤치 인원 현황 */}
						<div className="bg-card rounded-2xl border p-5">
							<div className="flex items-center justify-between mb-4">
								<h2 className="font-semibold text-foreground">벤치 인원 현황</h2>
								<span className="text-xs font-medium text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full">
									{benchMembersData?.data?.length ?? 0}명 가용
								</span>
							</div>
							<div className="space-y-3">
								{benchMembersData?.data?.map((member, i) => {
									const color = benchAvatarColors[i % benchAvatarColors.length];
									return (
										<div
											key={member.id}
											className="flex items-center justify-between"
										>
											<div className="flex items-center gap-3">
												<div
													className={cn(
														'w-9 h-9 rounded-full ring-2 flex items-center justify-center font-semibold text-sm',
														color.bg,
														color.text,
														color.ring,
													)}
												>
													{member.name[0]}
												</div>
												<div>
													<p className="text-sm font-semibold text-foreground">{member.name}</p>
													<p className="text-xs text-muted-foreground">{member.department}</p>
												</div>
											</div>
											<div className="flex items-center gap-2">
												<span className="text-xs text-muted-foreground">{calculateTenure(member.hire_date)}</span>
												<StatusBadge status="bench" />
											</div>
										</div>
									);
								})}
							</div>
						</div>

						{/* 철수 임박 알림 */}
						<div className="bg-card rounded-2xl border border-orange-500/20 p-5 ring-1 ring-orange-500/10">
							<div className="flex items-center gap-2.5 mb-4">
								<div className="p-1.5 rounded-lg bg-orange-500/15">
									<AlertTriangle className="w-4 h-4 text-orange-400" />
								</div>
								<h2 className="font-semibold text-foreground text-sm">
									철수 임박 <span className="text-orange-400">30 일 이내</span>
								</h2>
							</div>
							<div className="space-y-3">
								{urgentWithdrawals.map((u) => (
									<div
										key={u.name}
										className="flex items-center justify-between p-3 bg-orange-500/5 rounded-xl border border-orange-500/10"
									>
										<div>
											<p className="text-sm font-semibold text-foreground">{u.name}</p>
											<p className="text-xs text-muted-foreground mt-0.5">
												<span className="text-orange-400">{u.project}</span> · 철수 {u.date}
											</p>
										</div>
										<span className="text-xs font-bold text-orange-400 bg-orange-500/15 px-2.5 py-1 rounded-full">
											{u.dday}
										</span>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}