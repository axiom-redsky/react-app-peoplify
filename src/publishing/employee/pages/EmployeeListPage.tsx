import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@axiom/components/ui';
import PageHeader from '@/shared/components/ui/PageHeader';
import StatusBadge from '@/shared/components/ui/StatusBadge';
import { Search, SlidersHorizontal, UserPlus } from 'lucide-react';

const employees = [
	{
		id: 1,
		name: '김민준',
		dept: '개발팀',
		grade: '과장',
		project: 'A금융 차세대 코어뱅킹',
		rate: '100%',
		status: 'active' as const,
	},
	{
		id: 2,
		name: '이서연',
		dept: '디자인',
		grade: '대리',
		project: '벤치 (미투입)',
		rate: '0%',
		status: 'bench' as const,
	},
	{
		id: 3,
		name: '박지훈',
		dept: '마케팅',
		grade: '사원',
		project: 'C제조 MES',
		rate: '100%',
		status: 'active' as const,
	},
	{
		id: 4,
		name: '최유나',
		dept: 'HR',
		grade: '차장',
		project: 'A금융 차세대 코어뱅킹',
		rate: '50%',
		status: 'warning' as const,
	},
	{
		id: 5,
		name: '정다은',
		dept: '개발팀',
		grade: '사원',
		project: 'B공공기관 ERP',
		rate: '100%',
		status: 'active' as const,
	},
	{
		id: 6,
		name: '홍길동',
		dept: '영업',
		grade: '부장',
		project: '벤치 (미투입)',
		rate: '0%',
		status: 'bench' as const,
	},
];

export default function EmployeeListPage(): React.ReactNode {
	return (
		<div className="p-5">
			<PageHeader
				title="직원 관리"
				actions={
					<Button size="lg">
						<UserPlus className="w-4 h-4 mr-1.5" />
						직원 등록
					</Button>
				}
			/>

			{/* 필터바 */}
			<div className="flex flex-wrap gap-2 mb-4">
				<div className="relative flex-1 min-w-48">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
					<Input
						className="h-9 pl-9 bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm focus-visible:border-teal-500 focus-visible:ring-teal-500/20"
						placeholder="이름 검색..."
					/>
				</div>
				<Select defaultValue="all">
					<SelectTrigger
						size="lg"
						className="bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm"
					>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">부서 전체</SelectItem>
						<SelectItem value="dev">개발팀</SelectItem>
						<SelectItem value="design">디자인</SelectItem>
						<SelectItem value="marketing">마케팅</SelectItem>
						<SelectItem value="hr">HR</SelectItem>
						<SelectItem value="sales">영업</SelectItem>
					</SelectContent>
				</Select>
				<Select defaultValue="all">
					<SelectTrigger
						size="lg"
						className="bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm"
					>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">재직상태 전체</SelectItem>
						<SelectItem value="active">재직</SelectItem>
						<SelectItem value="leave">휴직</SelectItem>
						<SelectItem value="resign">퇴직</SelectItem>
					</SelectContent>
				</Select>
				<Select defaultValue="all">
					<SelectTrigger
						size="lg"
						className="bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm"
					>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">투입상태 전체</SelectItem>
						<SelectItem value="active">투입중</SelectItem>
						<SelectItem value="bench">벤치</SelectItem>
						<SelectItem value="warning">철수임박</SelectItem>
					</SelectContent>
				</Select>
				<button className="flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg text-muted-foreground hover:bg-muted transition-colors">
					<SlidersHorizontal className="w-4 h-4" />
					초기화
				</button>
			</div>

			{/* 테이블 */}
			<div className="bg-card rounded-xl border overflow-hidden">
				<table className="w-full text-sm">
					<thead className="bg-muted/50">
						<tr>
							<th className="text-left py-3 px-4 font-medium text-muted-foreground">이름</th>
							<th className="text-left py-3 px-4 font-medium text-muted-foreground">부서</th>
							<th className="text-left py-3 px-4 font-medium text-muted-foreground">직급</th>
							<th className="text-left py-3 px-4 font-medium text-muted-foreground">현재 투입 프로젝트</th>
							<th className="text-left py-3 px-4 font-medium text-muted-foreground">투입률</th>
							<th className="text-left py-3 px-4 font-medium text-muted-foreground">상태</th>
							<th className="text-left py-3 px-4 font-medium text-muted-foreground">액션</th>
						</tr>
					</thead>
					<tbody>
						{employees.map((emp) => (
							<tr
								key={emp.id}
								className="border-t hover:bg-muted/20 transition-colors"
							>
								<td className="py-3 px-4">
									<div className="flex items-center gap-2">
										<div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold text-xs">
											{emp.name[0]}
										</div>
										<span className="font-medium text-foreground">{emp.name}</span>
									</div>
								</td>
								<td className="py-3 px-4 text-muted-foreground">{emp.dept}</td>
								<td className="py-3 px-4 text-muted-foreground">{emp.grade}</td>
								<td className="py-3 px-4 text-foreground">{emp.project}</td>
								<td className="py-3 px-4 font-medium">{emp.rate}</td>
								<td className="py-3 px-4">
									<StatusBadge status={emp.status} />
								</td>
								<td className="py-3 px-4">
									<button className="text-sm text-teal-600 hover:underline font-medium">상세</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>

				{/* 페이지네이션 */}
				<div className="flex items-center justify-between px-4 py-3 border-t bg-muted/30">
					<p className="text-sm text-muted-foreground">총 32명 중 1-6 표시</p>
					<div className="flex items-center gap-1">
						{[1, 2, 3, 4, 5].map((page) => (
							<button
								key={page}
								className={`w-8 h-8 text-sm rounded-md transition-colors ${page === 1 ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
							>
								{page}
							</button>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
