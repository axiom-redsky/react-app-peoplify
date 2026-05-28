import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@axiom/components/ui';
import PageHeader from '@/shared/components/ui/PageHeader';
import { SlidersHorizontal, CheckSquare } from 'lucide-react';

const benchMembers = [
	{ id: 1, name: '김민준', dept: '개발팀', skills: 'Java · Spring · React', rate: '0%', selected: true },
	{ id: 2, name: '이서연', dept: '디자인', skills: 'Figma · CSS · React', rate: '0%', selected: false },
	{ id: 3, name: '박지훈', dept: '마케팅', skills: 'Python · Django', rate: '50%', selected: false },
	{ id: 4, name: '최유나', dept: 'HR', skills: '—', rate: '0%', selected: false },
	{ id: 5, name: '정다은', dept: '개발팀', skills: 'Java · Oracle · React', rate: '50%', selected: true },
	{ id: 6, name: '홍길동', dept: '영업', skills: 'Java · Spring', rate: '0%', selected: false },
];

const roles = ['PM', 'PL', '개발', 'QA', '디자인', 'BA'];

export default function ProjectAssignPage(): React.ReactNode {
	return (
		<div className="p-5">
			<PageHeader
				title="인력 배정"
				breadcrumb={[
					{ label: '프로젝트', path: '/projects' },
					{ label: 'A금융 차세대 코어뱅킹', path: '/projects/1' },
					{ label: '인력 배정' },
				]}
			/>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
				{/* 가용 인력 목록 */}
				<div className="lg:col-span-2">
					{/* 필터 */}
					<div className="flex flex-wrap gap-2 mb-3">
						<Select defaultValue="all">
							<SelectTrigger
								size="lg"
								className="bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm"
							>
								<SelectValue placeholder="기술스택" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">기술스택 전체</SelectItem>
							</SelectContent>
						</Select>
						<Select defaultValue="all">
							<SelectTrigger
								size="lg"
								className="bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm"
							>
								<SelectValue placeholder="투입률(현재)" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">투입률 전체</SelectItem>
							</SelectContent>
						</Select>
						<Select defaultValue="all">
							<SelectTrigger
								size="lg"
								className="bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm"
							>
								<SelectValue placeholder="경력" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">경력 전체</SelectItem>
							</SelectContent>
						</Select>
						<Select defaultValue="all">
							<SelectTrigger
								size="lg"
								className="bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm"
							>
								<SelectValue placeholder="부서" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">부서 전체</SelectItem>
							</SelectContent>
						</Select>
						<button className="flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg text-muted-foreground hover:bg-muted transition-colors">
							<SlidersHorizontal className="w-4 h-4" />
							초기화
						</button>
					</div>

					<div className="bg-card rounded-xl border overflow-hidden">
						<div className="px-4 py-3 border-b bg-muted/30">
							<h3 className="font-semibold text-foreground text-sm">가용 인력 목록 (벤치 8명)</h3>
						</div>
						<table className="w-full text-sm">
							<thead className="bg-muted/50">
								<tr>
									<th className="text-left py-2.5 px-4 font-medium text-muted-foreground">선택</th>
									<th className="text-left py-2.5 px-4 font-medium text-muted-foreground">이름</th>
									<th className="text-left py-2.5 px-4 font-medium text-muted-foreground">부서</th>
									<th className="text-left py-2.5 px-4 font-medium text-muted-foreground">기술스택</th>
									<th className="text-left py-2.5 px-4 font-medium text-muted-foreground">현 투입률</th>
								</tr>
							</thead>
							<tbody>
								{benchMembers.map((m) => (
									<tr
										key={m.id}
										className={`border-t transition-colors ${m.selected ? 'bg-teal-50 dark:bg-teal-900/20' : 'hover:bg-muted/20'}`}
									>
										<td className="py-2.5 px-4">
											<div
												className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${m.selected ? 'bg-teal-600 border-teal-600' : 'border-slate-300 dark:border-slate-600'}`}
											>
												{m.selected && <CheckSquare className="w-3 h-3 text-white" />}
											</div>
										</td>
										<td className="py-2.5 px-4">
											<div className="flex items-center gap-2">
												<div className="w-7 h-7 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-700 dark:text-teal-300 font-semibold text-xs">
													{m.name[0]}
												</div>
												<span
													className={`font-medium ${m.selected ? 'text-teal-700 dark:text-teal-300' : 'text-foreground'}`}
												>
													{m.name}
												</span>
											</div>
										</td>
										<td className="py-2.5 px-4 text-muted-foreground">{m.dept}</td>
										<td className="py-2.5 px-4 text-muted-foreground text-xs">{m.skills}</td>
										<td className="py-2.5 px-4 font-medium">{m.rate}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				{/* 배정 설정 폼 */}
				<div className="bg-card rounded-xl border p-4 h-fit">
					<h3 className="font-semibold text-foreground mb-4 text-sm">배정 설정</h3>

					<div className="mb-3 p-2.5 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
						<p className="text-xs text-teal-600 dark:text-teal-400 font-medium mb-1">선택 인력:</p>
						<p className="text-sm text-teal-800 dark:text-teal-200 font-semibold">김민준, 정다은</p>
					</div>

					<div className="space-y-3">
						<div>
							<label className="block text-sm font-medium text-foreground mb-1">역할 *</label>
							<Select>
								<SelectTrigger
									size="lg"
									className="w-full bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm"
								>
									<SelectValue placeholder="역할 선택" />
								</SelectTrigger>
								<SelectContent>
									{roles.map((r) => (
										<SelectItem
											key={r}
											value={r}
										>
											{r}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div>
							<label className="block text-sm font-medium text-foreground mb-1">투입률 *</label>
							<div className="flex gap-2">
								<button className="flex-1 py-2 text-sm border rounded-lg text-center bg-teal-600 text-white font-medium">
									100%
								</button>
								<button className="flex-1 py-2 text-sm border rounded-lg text-center hover:bg-muted transition-colors text-muted-foreground">
									50%
								</button>
							</div>
						</div>
						<div>
							<label className="block text-sm font-medium text-foreground mb-1">투입 시작일 *</label>
							<Input
								type="date"
								defaultValue="2026-06-01"
								className="h-9 bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm focus-visible:border-teal-500 focus-visible:ring-teal-500/20"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-foreground mb-1">종료 예정일</label>
							<Input
								type="date"
								defaultValue="2026-12-31"
								className="h-9 bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm focus-visible:border-teal-500 focus-visible:ring-teal-500/20"
							/>
						</div>
					</div>

					<div className="mt-4 pt-4 border-t">
						<p className="text-xs text-orange-600 dark:text-orange-400 mb-3">
							⚠ 배정 확정 시 투입 현황 자동 갱신 · 해당 직원 이메일 알림 발송
						</p>
						<div className="flex gap-2">
							<Button
								variant="outline"
								className="flex-1"
								size="sm"
							>
								초기화
							</Button>
							<Button
								className="flex-1"
								size="sm"
							>
								배정 확정
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
