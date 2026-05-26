import PageHeader from '@/shared/components/ui/PageHeader';
import StatusBadge from '@/shared/components/ui/StatusBadge';
import { Users, FolderKanban, UserCheck, AlertTriangle, TrendingUp } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

const kpiCards = [
	{
		label: '전체 인원', value: '32', unit: '명', sub: '재직 중 30명',
		icon: Users, trend: '+2',
		iconBg: 'bg-teal-500/15', iconColor: 'text-teal-400',
		accent: 'from-teal-500/20 to-transparent', ring: 'ring-teal-500/20', border: 'border-t-teal-500',
	},
	{
		label: '투입 중', value: '26', unit: '명', sub: '26개 프로젝트 현장',
		icon: UserCheck, trend: '81%',
		iconBg: 'bg-emerald-500/15', iconColor: 'text-emerald-400',
		accent: 'from-emerald-500/20 to-transparent', ring: 'ring-emerald-500/20', border: 'border-t-emerald-500',
	},
	{
		label: '벤치(가용)', value: '6', unit: '명', sub: '배정 가능 인원',
		icon: Users, trend: '19%',
		iconBg: 'bg-amber-500/15', iconColor: 'text-amber-400',
		accent: 'from-amber-500/20 to-transparent', ring: 'ring-amber-500/20', border: 'border-t-amber-500',
	},
	{
		label: '진행 프로젝트', value: '5', unit: '건', sub: '완료1 · 예정1 별도',
		icon: FolderKanban, trend: '3건',
		iconBg: 'bg-sky-500/15', iconColor: 'text-sky-400',
		accent: 'from-sky-500/20 to-transparent', ring: 'ring-sky-500/20', border: 'border-t-sky-500',
	},
];

const activeProjects = [
	{ name: 'A금융 차세대 코어뱅킹', client: 'A금융그룹', count: 7, period: '2025.03~2026.12', status: 'active' as const },
	{ name: 'B공공기관 ERP 구축', client: 'B공공기관', count: 5, period: '2025.06~2026.06', status: 'active' as const },
	{ name: 'C제조 MES 고도화', client: 'C제조', count: 8, period: '2024.12~2026.03', status: 'active' as const },
];

const benchAvatarColors = [
	{ bg: 'bg-violet-500/20', text: 'text-violet-400', ring: 'ring-violet-500/30' },
	{ bg: 'bg-sky-500/20', text: 'text-sky-400', ring: 'ring-sky-500/30' },
	{ bg: 'bg-rose-500/20', text: 'text-rose-400', ring: 'ring-rose-500/30' },
];

const benchMembers = [
	{ name: '이서연', dept: '디자인', since: '1개월째' },
	{ name: '김민준', dept: '개발팀', since: '2주째' },
	{ name: '박지훈', dept: '마케팅', since: '3일째' },
];

const urgentWithdrawals = [
	{ name: '최유나', project: 'A금융', date: '06.15', dday: 'D-20' },
	{ name: '정다은', project: 'B공공', date: '06.28', dday: 'D-33' },
];

const maxCount = Math.max(...activeProjects.map((p) => p.count));

export default function DashboardPage(): React.ReactNode {
	return (
		<div className="p-6 space-y-6">
			<PageHeader
				title="대시보드"
				actions={
					<span className="text-sm text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-lg">
						2026년 5월 26일 (화)
					</span>
				}
			/>

			{/* KPI 카드 */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
				{kpiCards.map((card) => {
					const Icon = card.icon;
					return (
						<div
							key={card.label}
							className={cn(
								'relative bg-card rounded-2xl border border-t-2 p-5 overflow-hidden',
								'ring-1 transition-shadow hover:shadow-lg',
								card.border, card.ring,
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
									{card.value}<span className="text-base font-medium text-muted-foreground ml-0.5">{card.unit}</span>
								</p>
								<p className="text-xs text-muted-foreground mt-2">{card.sub}</p>
							</div>
						</div>
					);
				})}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
				{/* 진행 중 프로젝트 */}
				<div className="lg:col-span-2 bg-card rounded-2xl border p-5">
					<div className="flex items-center justify-between mb-4">
						<h2 className="font-semibold text-foreground">진행 중 프로젝트</h2>
						<span className="text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">
							{activeProjects.length}건
						</span>
					</div>
					<div className="space-y-1">
						<div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
							<span>프로젝트명</span>
							<span className="text-center">투입</span>
							<span>기간</span>
							<span>상태</span>
						</div>
						{activeProjects.map((proj) => (
							<div
								key={proj.name}
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
											style={{ width: `${(proj.count / maxCount) * 100}%` }}
										/>
									</div>
								</div>
								<div className="text-center">
									<span className="text-lg font-bold text-foreground">{proj.count}</span>
									<span className="text-xs text-muted-foreground">명</span>
								</div>
								<div className="text-xs text-muted-foreground whitespace-nowrap">{proj.period}</div>
								<StatusBadge status={proj.status} />
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
								{benchMembers.length}명 가용
							</span>
						</div>
						<div className="space-y-3">
							{benchMembers.map((m, i) => {
								const color = benchAvatarColors[i % benchAvatarColors.length];
								return (
									<div key={m.name} className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div className={cn(
												'w-9 h-9 rounded-full ring-2 flex items-center justify-center font-semibold text-sm',
												color.bg, color.text, color.ring,
											)}>
												{m.name[0]}
											</div>
											<div>
												<p className="text-sm font-semibold text-foreground">{m.name}</p>
												<p className="text-xs text-muted-foreground">{m.dept}</p>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<span className="text-xs text-muted-foreground">{m.since}</span>
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
							<h2 className="font-semibold text-foreground text-sm">철수 임박 <span className="text-orange-400">30일 이내</span></h2>
						</div>
						<div className="space-y-3">
							{urgentWithdrawals.map((u) => (
								<div key={u.name} className="flex items-center justify-between p-3 bg-orange-500/5 rounded-xl border border-orange-500/10">
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
		</div>
	);
}
