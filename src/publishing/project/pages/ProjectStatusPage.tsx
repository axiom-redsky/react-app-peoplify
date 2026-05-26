import { Button } from '@/shared/ui';
import PageHeader from '@/shared/components/ui/PageHeader';
import StatusBadge from '@/shared/components/ui/StatusBadge';
import { Download, SlidersHorizontal } from 'lucide-react';

const allMembers = [
	{ name: '김민준', dept: '개발팀', project: 'A금융 차세대', role: 'PL', rate: '100%', start: '25.03.01', end: '26.09.30', status: 'active' as const },
	{ name: '이서연', dept: '디자인', project: '벤치', role: '—', rate: '0%', start: '—', end: '—', status: 'bench' as const },
	{ name: '박지훈', dept: '마케팅', project: 'C제조 MES', role: '개발', rate: '100%', start: '24.12.01', end: '26.03.31', status: 'active' as const },
	{ name: '최유나', dept: 'HR', project: 'A금융 차세대', role: 'QA', rate: '50%', start: '25.08.01', end: '26.06.15', status: 'warning' as const },
	{ name: '정다은', dept: '개발팀', project: 'B공공 ERP', role: '개발', rate: '100%', start: '25.06.01', end: '26.06.28', status: 'warning' as const },
	{ name: '홍길동', dept: '영업', project: 'E통신 CRM', role: 'PM', rate: '100%', start: '24.01.01', end: '25.12.31', status: 'complete' as const },
];

const summaryCards = [
	{ label: '전체', value: '32명', color: 'text-foreground' },
	{ label: '투입 중', value: '26명', color: 'text-emerald-600' },
	{ label: '벤치', value: '6명', color: 'text-amber-600' },
	{ label: '휴가', value: '1명', color: 'text-sky-600' },
];

export default function ProjectStatusPage(): React.ReactNode {
	return (
		<div className="p-5">
			<PageHeader
				title="전체 투입 현황"
				actions={
					<Button variant="outline" size="sm">
						<Download className="w-4 h-4 mr-1.5" />
						엑셀 저장
					</Button>
				}
			/>

			{/* 요약 수치 */}
			<div className="flex flex-wrap gap-3 mb-4">
				{summaryCards.map((card) => (
					<div key={card.label} className="bg-card rounded-lg border px-4 py-2 flex items-center gap-2">
						<span className={`text-lg font-bold ${card.color}`}>{card.value}</span>
						<span className="text-sm text-muted-foreground">{card.label}</span>
					</div>
				))}
			</div>

			{/* 필터 */}
			<div className="flex flex-wrap gap-2 mb-4">
				<select className="px-3 py-2 text-sm border rounded-lg outline-none focus:border-teal-500 bg-background">
					<option>상태 ▾</option>
					<option>투입중</option>
					<option>벤치</option>
					<option>휴가</option>
				</select>
				<select className="px-3 py-2 text-sm border rounded-lg outline-none focus:border-teal-500 bg-background">
					<option>부서 ▾</option>
				</select>
				<select className="px-3 py-2 text-sm border rounded-lg outline-none focus:border-teal-500 bg-background">
					<option>철수 임박(30일) ▾</option>
				</select>
				<button className="flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg text-muted-foreground hover:bg-muted transition-colors">
					<SlidersHorizontal className="w-4 h-4" />
					초기화
				</button>
				<Button size="sm">조회</Button>
			</div>

			{/* 테이블 */}
			<div className="bg-card rounded-xl border overflow-hidden">
				<table className="w-full text-sm">
					<thead className="bg-muted/50">
						<tr>
							<th className="text-left py-3 px-4 font-medium text-muted-foreground">이름</th>
							<th className="text-left py-3 px-4 font-medium text-muted-foreground">부서</th>
							<th className="text-left py-3 px-4 font-medium text-muted-foreground">현재 프로젝트</th>
							<th className="text-left py-3 px-4 font-medium text-muted-foreground">역할</th>
							<th className="text-left py-3 px-4 font-medium text-muted-foreground">투입률</th>
							<th className="text-left py-3 px-4 font-medium text-muted-foreground">투입일</th>
							<th className="text-left py-3 px-4 font-medium text-muted-foreground">철수 예정일</th>
							<th className="text-left py-3 px-4 font-medium text-muted-foreground">상태</th>
						</tr>
					</thead>
					<tbody>
						{allMembers.map((m) => (
							<tr key={m.name} className={`border-t transition-colors hover:bg-muted/20 ${m.status === 'warning' ? 'bg-orange-50/50' : ''}`}>
								<td className="py-2.5 px-4">
									<div className="flex items-center gap-2">
										<div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold text-xs">
											{m.name[0]}
										</div>
										<span className="font-medium text-foreground">{m.name}</span>
									</div>
								</td>
								<td className="py-2.5 px-4 text-muted-foreground">{m.dept}</td>
								<td className="py-2.5 px-4 font-medium text-foreground">{m.project}</td>
								<td className="py-2.5 px-4">
									{m.role !== '—' && (
										<span className="px-2 py-0.5 rounded text-xs bg-teal-50 text-teal-700 font-medium">{m.role}</span>
									)}
									{m.role === '—' && <span className="text-muted-foreground">—</span>}
								</td>
								<td className="py-2.5 px-4 font-medium">{m.rate}</td>
								<td className="py-2.5 px-4 text-muted-foreground">{m.start}</td>
								<td className="py-2.5 px-4 text-muted-foreground">{m.end}</td>
								<td className="py-2.5 px-4">
									<StatusBadge status={m.status} />
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
