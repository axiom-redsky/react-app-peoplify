import { Button } from '@/shared/ui';
import PageHeader from '@/shared/components/ui/PageHeader';
import StatusBadge from '@/shared/components/ui/StatusBadge';
import { Mail, Phone, Calendar, Edit, Trash2 } from 'lucide-react';

const projectHistory = [
	{ project: 'A금융 차세대', client: 'A금융', role: 'PL', period: '25.03~26.09', rate: '100%', status: '투입중' },
	{ project: 'C제조 MES', client: 'C제조', role: '개발', period: '24.01~24.12', rate: '100%', status: '완료' },
	{ project: 'B공공 ERP', client: 'B공공', role: '개발', period: '23.03~23.12', rate: '100%', status: '완료' },
	{ project: 'D유통 물류', client: 'D유통', role: '개발', period: '22.01~22.12', rate: '50%', status: '완료' },
	{ project: 'E통신 CRM', client: 'E통신', role: 'PL', period: '21.03~22.12', rate: '100%', status: '완료' },
];

const skills = ['Java', 'Spring Boot', 'React', 'Oracle', 'iBatis', 'Git', 'Jenkins'];

const tabs = ['기본정보', '투입 이력', '기술스택', '계약정보'];

export default function EmployeeDetailPage(): React.ReactNode {
	return (
		<div className="p-5">
			<PageHeader
				title="직원 상세"
				breadcrumb={[
					{ label: '직원관리', path: '/employees' },
					{ label: '김민준' },
				]}
				actions={
					<div className="flex gap-2">
						<Button variant="outline" size="sm">
							<Edit className="w-4 h-4 mr-1.5" />
							수정
						</Button>
						<Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
							<Trash2 className="w-4 h-4 mr-1.5" />
							삭제
						</Button>
					</div>
				}
			/>

			{/* 직원 요약 카드 */}
			<div className="bg-card rounded-xl border p-5 mb-4 flex flex-col sm:flex-row sm:items-center gap-4">
				<div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-2xl font-bold">
					김
				</div>
				<div className="flex-1">
					<div className="flex items-center gap-2 mb-1">
						<h2 className="text-xl font-bold text-foreground">김민준</h2>
						<span className="text-sm text-muted-foreground">개발팀 · 과장</span>
						<StatusBadge status="active" />
					</div>
					<div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
						<span className="flex items-center gap-1.5">
							<Mail className="w-3.5 h-3.5" />
							kim.mj@peoplify.com
						</span>
						<span className="flex items-center gap-1.5">
							<Phone className="w-3.5 h-3.5" />
							010-1234-5678
						</span>
						<span className="flex items-center gap-1.5">
							<Calendar className="w-3.5 h-3.5" />
							입사 2021.03.15
						</span>
					</div>
				</div>
				<div className="text-right">
					<p className="text-sm text-muted-foreground">현 투입 프로젝트</p>
					<p className="font-semibold text-foreground">A금융 차세대</p>
					<p className="text-sm text-teal-600 font-medium">투입률 100%</p>
				</div>
			</div>

			{/* 탭 */}
			<div className="border-b mb-4">
				<div className="flex gap-0">
					{tabs.map((tab, idx) => (
						<button
							key={tab}
							className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
								idx === 1
									? 'border-teal-600 text-teal-600'
									: 'border-transparent text-muted-foreground hover:text-foreground'
							}`}
						>
							{tab}
							{tab === '투입 이력' && <span className="ml-1 text-xs text-teal-500">★</span>}
						</button>
					))}
				</div>
			</div>

			{/* 투입 이력 탭 내용 */}
			<div className="bg-card rounded-xl border overflow-hidden">
				<div className="px-4 py-3 border-b bg-muted/30">
					<h3 className="font-semibold text-foreground text-sm">프로젝트 투입 이력</h3>
				</div>
				<table className="w-full text-sm">
					<thead className="bg-muted/50">
						<tr>
							<th className="text-left py-2.5 px-4 font-medium text-muted-foreground">프로젝트</th>
							<th className="text-left py-2.5 px-4 font-medium text-muted-foreground">고객사</th>
							<th className="text-left py-2.5 px-4 font-medium text-muted-foreground">역할</th>
							<th className="text-left py-2.5 px-4 font-medium text-muted-foreground">투입기간</th>
							<th className="text-left py-2.5 px-4 font-medium text-muted-foreground">투입률</th>
							<th className="text-left py-2.5 px-4 font-medium text-muted-foreground">상태</th>
						</tr>
					</thead>
					<tbody>
						{projectHistory.map((proj, idx) => (
							<tr key={idx} className="border-t hover:bg-muted/20 transition-colors">
								<td className="py-2.5 px-4 font-medium text-foreground">{proj.project}</td>
								<td className="py-2.5 px-4 text-muted-foreground">{proj.client}</td>
								<td className="py-2.5 px-4">
									<span className="px-2 py-0.5 rounded text-xs bg-teal-50 text-teal-700 font-medium">
										{proj.role}
									</span>
								</td>
								<td className="py-2.5 px-4 text-muted-foreground">{proj.period}</td>
								<td className="py-2.5 px-4 font-medium">{proj.rate}</td>
								<td className="py-2.5 px-4">
									<span className={`text-xs font-medium ${proj.status === '투입중' ? 'text-emerald-600' : 'text-slate-500'}`}>
										{proj.status}
									</span>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* 기술스택 미리보기 */}
			<div className="mt-4 bg-card rounded-xl border p-4">
				<h3 className="font-semibold text-foreground text-sm mb-3">기술스택</h3>
				<div className="flex flex-wrap gap-2">
					{skills.map((skill) => (
						<span key={skill} className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-sm font-medium border border-teal-100">
							{skill}
						</span>
					))}
				</div>
			</div>
		</div>
	);
}
