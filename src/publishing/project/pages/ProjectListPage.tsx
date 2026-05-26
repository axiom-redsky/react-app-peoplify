import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@axiom/components/ui';
import PageHeader from '@/shared/components/ui/PageHeader';
import StatusBadge from '@/shared/components/ui/StatusBadge';
import { Search, Plus, Calendar, Users } from 'lucide-react';

const projects = [
	{ id: 1, name: 'A금융 차세대 코어뱅킹', client: 'A금융그룹', period: '2025.03 ~ 2026.12', count: 7, rate: '100%', tech: ['Java', 'Spring', 'Oracle'], status: 'active' as const },
	{ id: 2, name: 'B공공기관 ERP 구축', client: 'B공공기관', period: '2025.06 ~ 2026.06', count: 5, rate: '100%', tech: ['SAP', 'ABAP'], status: 'active' as const },
	{ id: 3, name: 'C제조 MES 고도화', client: 'C제조', period: '2024.12 ~ 2026.03', count: 8, rate: '100%', tech: ['Java', 'React', 'MySQL'], status: 'active' as const },
	{ id: 4, name: 'D유통 물류 시스템', client: 'D유통', period: '2026.08 ~ 2027.06', count: 0, rate: '—', tech: ['MSA', 'K8s'], status: 'planned' as const },
	{ id: 5, name: 'E통신 CRM 재구축', client: 'E통신', period: '2024.01 ~ 2025.12', count: 6, rate: '100%', tech: ['Python', 'Django'], status: 'complete' as const },
];

const tabs = [
	{ label: '전체', count: 5 },
	{ label: '진행 중', count: 3 },
	{ label: '완료', count: 1 },
	{ label: '예정', count: 1 },
];

export default function ProjectListPage(): React.ReactNode {
	return (
		<div className="p-5">
			<PageHeader
				title="프로젝트 관리"
				actions={
					<Button size="sm">
						<Plus className="w-4 h-4 mr-1.5" />
						프로젝트 등록
					</Button>
				}
			/>

			{/* 상태 탭 */}
			<div className="flex gap-1 mb-4 border-b">
				{tabs.map((tab, idx) => (
					<button
						key={tab.label}
						className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
							idx === 0
								? 'border-teal-600 text-teal-600'
								: 'border-transparent text-muted-foreground hover:text-foreground'
						}`}
					>
						{tab.label}
						<span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">
							{tab.count}
						</span>
					</button>
				))}
			</div>

			{/* 검색/필터 */}
			<div className="flex flex-wrap gap-2 mb-4">
				<div className="relative flex-1 min-w-48">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
					<Input
						className="h-9 pl-9 bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm focus-visible:border-teal-500 focus-visible:ring-teal-500/20"
						placeholder="프로젝트명·고객사 검색..."
					/>
				</div>
				<Select defaultValue="all">
					<SelectTrigger
						size="lg"
						className="bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm"
					>
						<SelectValue placeholder="기술스택" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">기술스택 전체</SelectItem>
						<SelectItem value="java">Java</SelectItem>
						<SelectItem value="react">React</SelectItem>
						<SelectItem value="python">Python</SelectItem>
						<SelectItem value="sap">SAP</SelectItem>
					</SelectContent>
				</Select>
				<Select defaultValue="all">
					<SelectTrigger
						size="lg"
						className="bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm"
					>
						<SelectValue placeholder="PM" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">PM 전체</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* 카드형 목록 */}
			<div className="grid grid-cols-1 gap-3">
				{projects.map((proj) => (
					<div
						key={proj.id}
						className="bg-card rounded-xl border p-4 hover:border-teal-200 dark:hover:border-teal-700 hover:shadow-sm transition-all"
					>
						<div className="flex items-start justify-between gap-3">
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2 mb-1">
									<h3 className="font-semibold text-foreground truncate">{proj.name}</h3>
									<StatusBadge status={proj.status} />
								</div>
								<p className="text-sm text-muted-foreground mb-2">{proj.client}</p>
								<div className="flex flex-wrap gap-4 text-sm">
									<span className="flex items-center gap-1 text-muted-foreground">
										<Calendar className="w-3.5 h-3.5" />
										{proj.period}
									</span>
									<span className="flex items-center gap-1 text-muted-foreground">
										<Users className="w-3.5 h-3.5" />
										투입 {proj.count}명
									</span>
									<span className="text-muted-foreground">투입률 {proj.rate}</span>
								</div>
								<div className="flex flex-wrap gap-1.5 mt-2">
									{proj.tech.map((t) => (
										<span
											key={t}
											className="px-2 py-0.5 text-xs rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
										>
											{t}
										</span>
									))}
								</div>
							</div>
							<Button
								variant="outline"
								size="sm"
								className="shrink-0"
							>
								상세
							</Button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
