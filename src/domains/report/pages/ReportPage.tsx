import { Button, Card, CardHeader, CardTitle, CardContent, CardDescription } from '@axiom/components/ui';
import PageHeader from '@/shared/components/ui/PageHeader';
import { Download, FileSpreadsheet } from 'lucide-react';
import { useApi } from '@axiom/hooks';
import dayjs from 'dayjs';

const monthlyRates = [
	{ month: '1월', rate: 70 },
	{ month: '2월', rate: 78 },
	{ month: '3월', rate: 82 },
	{ month: '4월', rate: 80 },
	{ month: '5월', rate: 85 },
	{ month: '6월', rate: 81 },
];

const memberSummary = [
	{
		name: '김민준',
		dept: '개발팀',
		project: 'A금융 차세대',
		role: 'PL',
		rate: '100%',
		period: '25.03~26.09',
		status: '투입중',
	},
	{ name: '이서연', dept: '디자인', project: '벤치', role: '—', rate: '0%', period: '—', status: '벤치' },
	{
		name: '박지훈',
		dept: '마케팅',
		project: 'C제조 MES',
		role: '개발',
		rate: '100%',
		period: '24.12~26.03',
		status: '투입중',
	},
];

const periodFilters = ['이번달', '지난달', '분기', '연도', '직접입력'];

type TProjectDeployment = {
	id: number;
	name: string;
	status: string;
	deployed_count: number;
};

export default function ReportPage(): React.ReactNode {
	const { data } = useApi<{
		data: { year: number; month: number; projects: TProjectDeployment[] };
		success: boolean;
	}>('/api/reports/project-deployment');

	const projectStats = data?.data?.projects ?? [
		{ name: 'A금융 차세대', deployed_count: 0, id: 0, status: '' },
		{ name: 'B공공 ERP', deployed_count: 0, id: 0, status: '' },
		{ name: 'C제조 MES', deployed_count: 0, id: 0, status: '' },
		{ name: 'D유통 (예정)', deployed_count: 0, id: 0, status: '' },
		{ name: 'E통신 (완료)', deployed_count: 0, id: 0, status: '' },
	];

	const projStatusBadge = (status: string): { label: string; cls: string } | null => {
		if (status === 'complete') {
			return { label: '완료', cls: 'bg-muted text-muted-foreground' };
		} else if (status === 'active') {
			return { label: '진행중', cls: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' };
		} else if (status === 'planned') {
			return { label: '예정', cls: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' };
		} else {
			return null;
		}
	};

	return (
		<div className="p-5">
			<PageHeader
				title="통계 / 리포트"
				actions={
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
						>
							<Download className="w-4 h-4 mr-1.5" />
							PDF 저장
						</Button>
						<Button
							variant="outline"
							size="sm"
						>
							<FileSpreadsheet className="w-4 h-4 mr-1.5" />
							엑셀
						</Button>
					</div>
				}
			/>

			{/* 기간 필터 */}
			<div className="flex gap-1.5 mb-5">
				{periodFilters.map((f, idx) => (
					<button
						key={f}
						className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
							idx === 0 ? 'bg-brand-600 text-white' : 'bg-card border text-muted-foreground hover:bg-muted'
						}`}
					>
						{f}
					</button>
				))}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
				{/* 프로젝트별 투입 인원 */}
				<div className="bg-card rounded-xl border p-5">
					<div className="flex items-center justify-between mb-5">
						<h2 className="font-semibold text-foreground text-sm">프로젝트별 투입 인원</h2>
						<span className="rounded-md bg-muted/60 px-2 py-0.5 text-xs text-muted-foreground">
							{dayjs().format('M월 기준')}
						</span>
					</div>
					<div className="space-y-4">
						{[...projectStats]
							.sort((a, b) => b.deployed_count - a.deployed_count)
							.map((proj: TProjectDeployment, idx) => {
								const max = Math.max(...projectStats.map((p) => p.deployed_count), 1);
								const pct = (proj.deployed_count / max) * 100;
								const badge = projStatusBadge(proj.status);
								return (
									<div
										key={proj.name}
										className="group"
									>
										<div className="mb-1.5 flex items-center justify-between gap-2">
											<div className="flex min-w-0 items-center gap-2">
												<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-muted text-[11px] font-bold text-muted-foreground">
													{idx + 1}
												</span>
												<span className="truncate text-sm text-foreground">{proj.name}</span>
												{badge && (
													<span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${badge.cls}`}>
														{badge.label}
													</span>
												)}
											</div>
											<span className="shrink-0 text-sm font-bold tabular-nums text-foreground">
												{proj.deployed_count}
												<span className="ml-0.5 text-xs font-normal text-muted-foreground">명</span>
											</span>
										</div>
										<div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted/60">
											<div
												className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-brand-600 to-brand-400 transition-all duration-700 ease-out group-hover:from-brand-500 group-hover:to-brand-300"
												style={{ width: `${pct}%` }}
											/>
										</div>
									</div>
								);
							})}
					</div>
				</div>

				{/* 투입률 추이 */}
				<div className="bg-card rounded-xl border p-4">
					<h2 className="font-semibold text-foreground mb-4 text-sm">투입률 추이 (월별)</h2>
					<div className="flex items-end justify-around gap-2 h-32">
						{monthlyRates.map((m) => (
							<div
								key={m.month}
								className="flex-1 flex flex-col items-center gap-1"
							>
								<span className="text-xs font-semibold text-brand-600">{m.rate}%</span>
								<div
									className="w-full bg-brand-500 rounded-t-md transition-all hover:bg-brand-600"
									style={{ height: `${(m.rate / 100) * 96}px` }}
								/>
								<span className="text-xs text-muted-foreground">{m.month}</span>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* 개인별 투입 요약 */}
			<div className="bg-card rounded-xl border overflow-hidden">
				<div className="px-4 py-3 border-b bg-muted/30">
					<h2 className="font-semibold text-foreground text-sm">개인별 투입 요약</h2>
					<p className="text-xs text-muted-foreground mt-0.5">* 행 클릭 시 해당 직원 투입 이력 상세 팝업 표시</p>
				</div>
				<table className="w-full text-sm">
					<thead className="bg-muted/50">
						<tr>
							<th className="text-left py-2.5 px-4 font-medium text-muted-foreground">이름</th>
							<th className="text-left py-2.5 px-4 font-medium text-muted-foreground">부서</th>
							<th className="text-left py-2.5 px-4 font-medium text-muted-foreground">현재 프로젝트</th>
							<th className="text-left py-2.5 px-4 font-medium text-muted-foreground">역할</th>
							<th className="text-left py-2.5 px-4 font-medium text-muted-foreground">투입률</th>
							<th className="text-left py-2.5 px-4 font-medium text-muted-foreground">투입기간</th>
							<th className="text-left py-2.5 px-4 font-medium text-muted-foreground">상태</th>
						</tr>
					</thead>
					<tbody>
						{memberSummary.map((m) => (
							<tr
								key={m.name}
								className="border-t hover:bg-muted/20 cursor-pointer transition-colors"
							>
								<td className="py-2.5 px-4 font-medium text-foreground">{m.name}</td>
								<td className="py-2.5 px-4 text-muted-foreground">{m.dept}</td>
								<td className="py-2.5 px-4 text-foreground">{m.project}</td>
								<td className="py-2.5 px-4">
									{m.role !== '—' ? (
										<span className="px-2 py-0.5 rounded text-xs bg-brand-50 text-brand-700 font-medium">{m.role}</span>
									) : (
										<span className="text-muted-foreground">—</span>
									)}
								</td>
								<td className="py-2.5 px-4 font-medium text-muted-foreground">{m.rate}</td>
								<td className="py-2.5 px-4 text-muted-foreground">{m.period}</td>
								<td className="py-2.5 px-4">
									<span
										className={`text-xs font-medium ${m.status === '투입중' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}
									>
										{m.status}
									</span>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
