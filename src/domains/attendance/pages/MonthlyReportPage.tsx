import { Button, Input } from '@axiom/components/ui';
import PageHeader from '@/shared/components/ui/PageHeader';
import { Bell } from 'lucide-react';
import { useApi } from '@axiom/hooks';

type TTeamReport = {
	employee_id: number;
	employee_name: string;
	department: string;
	report_id: number | null;
	work_days: number | null;
	overtime_hours: number | null;
	status: 'submitted' | 'none' | 'approved';
};

type TWorkReport = {
	id: number;
	employee_id: number;
	year: number;
	month: number;
	work_days: number;
	overtime_hours: number;
	note: string | null;
	status: 'submitted' | 'none' | 'approved';
	submitted_at: string;
	approved_at: string | null;
};

export default function MonthlyReportPage(): React.ReactNode {
	const currentYear = new Date().getFullYear();
	const currentMonth = new Date().getMonth() + 1;

	const { data: teamReports } = useApi<{ data: TTeamReport[]; success: boolean }>('/api/work-reports/team', {
		params: {
			year: currentYear,
			month: currentMonth,
		},
	});
	const { data: reports } = useApi<{ data: TWorkReport[]; success: boolean }>('/api/work-reports', {
		params: {
			employee_id: 1, // 실제 구현 시 사용자 ID 로 대체 필요
			year: 2026, // 실제 구현 시 현재 연도로 대체 필요
		},
	});

	const recentReports = reports?.data?.map((r) => ({
		month: `${r.year}년 ${r.month}월`,
		summary: `근무 ${r.work_days}일 초과 ${r.overtime_hours}시간`,
		status: r.status === 'approved' ? '승인' : r.status === 'submitted' ? '승인 대기' : '미제출',
	}));

	// API 데이터를 UI 로직에 맞게 변환
	const formattedTeamReports = teamReports?.data?.map((report) => {
		const statusMap: Record<string, string> = {
			none: '미제출',
			submitted: '제출',
			approved: '승인',
		};

		const actionMap: Record<string, string> = {
			none: '알림',
			submitted: '승인',
			approved: '—',
		};

		return {
			name: report.employee_name,
			workDays: report.work_days,
			overtime: report.overtime_hours !== null ? `${report.overtime_hours}h` : '—',
			status: statusMap[report.status] || '미제출',
			action: actionMap[report.status] || '알림',
		};
	});
	return (
		<div className="p-5">
			<PageHeader title="월별 근무 보고" />

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				{/* 개인 보고 폼 */}
				<div className="space-y-4">
					<div className="bg-card rounded-xl border p-5">
						<div className="flex items-center justify-between mb-4">
							<h2 className="font-semibold text-foreground">이번달 내 근무 보고</h2>
							<span className="text-sm text-muted-foreground">2026년 5월 기준 · 제출 마감: 5월 31일</span>
						</div>

						<div className="grid grid-cols-2 gap-3 mb-4">
							<div>
								<label className="block text-sm font-medium text-foreground mb-1">근무일수 *</label>
								<Input
									type="number"
									defaultValue="22"
									className="h-9 bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm focus-visible:border-brand-500 focus-visible:ring-brand-500/20"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-foreground mb-1">초과근무(시간)</label>
								<Input
									type="number"
									defaultValue="8"
									className="h-9 bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm focus-visible:border-brand-500 focus-visible:ring-brand-500/20"
								/>
							</div>
						</div>

						<div className="mb-4">
							<label className="block text-sm font-medium text-foreground mb-1">현장 특이사항</label>
							<textarea
								rows={3}
								className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 dark:border-slate-600 bg-muted/60 text-foreground outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 resize-none placeholder:text-muted-foreground"
								placeholder="현장 특이사항 입력..."
							/>
						</div>

						<Button className="w-full">보고 제출</Button>
					</div>

					{/* 최근 보고 이력 */}
					<div className="bg-card rounded-xl border p-4">
						<h3 className="font-semibold text-foreground mb-3 text-sm">최근 보고 이력</h3>
						<div className="space-y-2">
							{recentReports?.map((r) => (
								<div
									key={r.month}
									className="flex items-center justify-between py-2 border-b last:border-0"
								>
									<div>
										<p className="text-sm font-medium text-foreground">{r.month}</p>
										<p className="text-xs text-muted-foreground">{r.summary}</p>
									</div>
									<span className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
										{r.status}
									</span>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* 팀 보고 현황 (Manager 뷰) */}
				<div className="bg-card rounded-xl border p-4">
					<div className="flex items-center gap-2 mb-1">
						<h2 className="font-semibold text-foreground">팀 보고 현황</h2>
						<span className="text-xs text-muted-foreground">(Manager 뷰)</span>
					</div>
					<div className="flex items-center gap-2 mb-4 p-2.5 bg-orange-50 dark:bg-orange-900/15 rounded-lg border border-orange-100 dark:border-orange-800/30">
						<Bell className="w-4 h-4 text-orange-500 shrink-0" />
						<p className="text-sm text-orange-700 dark:text-orange-400">
							미제출: 2명 (박지훈, 홍길동) — 알림 발송 가능
						</p>
					</div>
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead className="bg-muted/50">
								<tr>
									<th className="text-left py-2.5 px-3 font-medium text-muted-foreground">이름</th>
									<th className="text-left py-2.5 px-3 font-medium text-muted-foreground">근무일</th>
									<th className="text-left py-2.5 px-3 font-medium text-muted-foreground">초과</th>
									<th className="text-left py-2.5 px-3 font-medium text-muted-foreground">제출상태</th>
									<th className="text-left py-2.5 px-3 font-medium text-muted-foreground">작업</th>
								</tr>
							</thead>
							<tbody>
								{formattedTeamReports?.map((m) => (
									<tr
										key={m.name}
										className={`border-t transition-colors ${m.status === '미제출' ? 'bg-red-50/50 dark:bg-red-900/10' : 'hover:bg-muted/20'}`}
									>
										<td className="py-2.5 px-3 font-medium text-foreground">{m.name}</td>
										<td className="py-2.5 px-3 text-muted-foreground">{m.workDays ?? '—'}</td>
										<td className="py-2.5 px-3 text-muted-foreground">{m.overtime ?? '—'}</td>
										<td className="py-2.5 px-3">
											<span
												className={`text-xs font-medium px-2 py-0.5 rounded-full ${
													m.status === '승인'
														? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
														: m.status === '제출'
															? 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300'
															: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
												}`}
											>
												{m.status}
											</span>
										</td>
										<td className="py-2.5 px-3">
											{m.action === '알림' ? (
												<button className="text-xs text-orange-600 hover:underline font-medium flex items-center gap-1">
													<Bell className="w-3 h-3" />
													알림
												</button>
											) : m.action !== '—' ? (
												<button className="text-xs text-brand-600 hover:underline font-medium">{m.action}</button>
											) : (
												<span className="text-muted-foreground">—</span>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
}
