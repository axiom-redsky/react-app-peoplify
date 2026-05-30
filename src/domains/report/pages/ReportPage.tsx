import { Button } from '@axiom/components/ui';
import PageHeader from '@/shared/components/ui/PageHeader';
import { Download, FileSpreadsheet } from 'lucide-react';

const projectStats = [
	{ name: 'A금융 차세대', count: 7 },
	{ name: 'B공공 ERP', count: 5 },
	{ name: 'C제조 MES', count: 8 },
	{ name: 'D유통 (예정)', count: 0 },
	{ name: 'E통신 (완료)', count: 6 },
];

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

export default function ReportPage(): React.ReactNode {
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
				<div className="bg-card rounded-xl border p-4">
					<h2 className="font-semibold text-foreground mb-4 text-sm">프로젝트별 투입 인원 (5월)</h2>
					<div className="space-y-3">
						{projectStats.map((proj) => {
							const max = Math.max(...projectStats.map((p) => p.count));
							const pct = max > 0 ? (proj.count / max) * 100 : 0;
							return (
								<div key={proj.name}>
									<div className="flex justify-between text-sm mb-1">
										<span className="text-foreground">{proj.name}</span>
										<span className="font-semibold text-brand-600">{proj.count}명</span>
									</div>
									<div className="w-full h-2 bg-muted rounded-full overflow-hidden">
										<div
											className="h-full bg-brand-500 rounded-full transition-all"
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
								<td className="py-2.5 px-4 font-medium">{m.rate}</td>
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
