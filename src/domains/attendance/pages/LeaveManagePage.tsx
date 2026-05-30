import { Button, Input } from '@axiom/components/ui';
import PageHeader from '@/shared/components/ui/PageHeader';

const leaveTypes = ['연차', '반차(오전)', '반차(오후)', '병가', '경조사'];

const myLeaves = [
	{ type: '연차', period: '05.28 ~ 05.28', days: '1일', status: '승인대기' },
	{ type: '반차', period: '05.15 ~ 05.15', days: '0.5일', status: '승인' },
	{ type: '연차', period: '05.01 ~ 05.02', days: '2일', status: '승인' },
	{ type: '병가', period: '04.20 ~ 04.21', days: '2일', status: '승인' },
];

export default function LeaveManagePage(): React.ReactNode {
	return (
		<div className="p-5">
			<PageHeader title="휴가 관리" />

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
				{/* 좌측: 연차 현황 + 신청 폼 */}
				<div className="lg:col-span-1 space-y-4">
					{/* 연차 현황 */}
					<div className="bg-card rounded-xl border p-4">
						<h2 className="font-semibold text-foreground mb-3">연차 현황</h2>
						<div className="grid grid-cols-2 gap-2">
							{[
								{ label: '총 부여', value: '15일', color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' },
								{ label: '사용', value: '6일', color: 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300' },
								{ label: '잔여', value: '9일', color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' },
								{ label: '신청중', value: '1일', color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300' },
							].map((item) => (
								<div
									key={item.label}
									className={`rounded-lg p-3 text-center ${item.color}`}
								>
									<p className="text-xs mb-1 opacity-70">{item.label}</p>
									<p className="text-xl font-bold">{item.value}</p>
								</div>
							))}
						</div>
					</div>

					{/* 신청 폼 */}
					<div className="bg-card rounded-xl border p-4">
						<h2 className="font-semibold text-foreground mb-4">휴가 신청</h2>
						<div className="space-y-3">
							<div>
								<label className="block text-sm font-medium text-foreground mb-1">휴가 종류 *</label>
								<div className="flex flex-wrap gap-1.5">
									{leaveTypes.map((type, idx) => (
										<button
											key={type}
											className={`px-3 py-1.5 text-xs rounded-full border font-medium transition-colors ${
												idx === 0
													? 'bg-brand-600 text-white border-brand-600'
													: 'border-slate-300 dark:border-slate-600 text-muted-foreground hover:border-brand-400 hover:text-brand-600'
											}`}
										>
											{type}
										</button>
									))}
								</div>
							</div>
							<div>
								<label className="block text-sm font-medium text-foreground mb-1">시작일 *</label>
								<Input
									type="date"
									defaultValue="2026-05-28"
									className="h-9 bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm focus-visible:border-brand-500 focus-visible:ring-brand-500/20"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-foreground mb-1">종료일</label>
								<Input
									type="date"
									defaultValue="2026-05-28"
									className="h-9 bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm focus-visible:border-brand-500 focus-visible:ring-brand-500/20"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-foreground mb-1">사유 *</label>
								<textarea
									rows={2}
									className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 dark:border-slate-600 bg-muted/60 text-foreground outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 resize-none placeholder:text-muted-foreground"
									placeholder="사유 입력..."
								/>
							</div>
							<div className="p-2.5 bg-brand-50 dark:bg-brand-900/20 rounded-lg text-xs text-brand-700 dark:text-brand-300">
								★ 현장 투입 중 휴가 시 프로젝트 PM에게도 알림 자동 발송
							</div>
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
									신청
								</Button>
							</div>
						</div>
					</div>
				</div>

				{/* 우측: 신청 내역 */}
				<div className="lg:col-span-2 bg-card rounded-xl border p-4">
					<h2 className="font-semibold text-foreground mb-4">내 신청 내역</h2>
					<div className="space-y-2">
						{myLeaves.map((leave, idx) => (
							<div
								key={idx}
								className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/20 transition-colors"
							>
								<div className="flex items-center gap-3">
									<div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
										leave.type === '연차' ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300' :
										leave.type === '반차' ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300' :
										'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
									}`}>
										{leave.type}
									</div>
									<div>
										<p className="text-sm font-medium text-foreground">{leave.period}</p>
										<p className="text-xs text-muted-foreground">{leave.days}</p>
									</div>
								</div>
								<span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
									leave.status === '승인' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
									'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
								}`}>
									{leave.status}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
