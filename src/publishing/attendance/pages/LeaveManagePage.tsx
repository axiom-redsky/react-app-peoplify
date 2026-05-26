import { Button } from '@/shared/ui';
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
								{ label: '총 부여', value: '15일', color: 'bg-slate-50 text-slate-700' },
								{ label: '사용', value: '6일', color: 'bg-teal-50 text-teal-700' },
								{ label: '잔여', value: '9일', color: 'bg-emerald-50 text-emerald-700' },
								{ label: '신청중', value: '1일', color: 'bg-amber-50 text-amber-700' },
							].map((item) => (
								<div key={item.label} className={`rounded-lg p-3 text-center ${item.color}`}>
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
													? 'bg-teal-600 text-white border-teal-600'
													: 'border-gray-200 text-muted-foreground hover:border-teal-400 hover:text-teal-600'
											}`}
										>
											{type}
										</button>
									))}
								</div>
							</div>
							<div>
								<label className="block text-sm font-medium text-foreground mb-1">시작일 *</label>
								<input type="date" defaultValue="2026-05-28" className="w-full px-3 py-2 text-sm border rounded-lg outline-none focus:border-teal-500" />
							</div>
							<div>
								<label className="block text-sm font-medium text-foreground mb-1">종료일</label>
								<input type="date" defaultValue="2026-05-28" className="w-full px-3 py-2 text-sm border rounded-lg outline-none focus:border-teal-500" />
							</div>
							<div>
								<label className="block text-sm font-medium text-foreground mb-1">사유 *</label>
								<textarea
									rows={2}
									className="w-full px-3 py-2 text-sm border rounded-lg outline-none focus:border-teal-500 resize-none"
									placeholder="사유 입력..."
								/>
							</div>
							<div className="p-2.5 bg-teal-50 rounded-lg text-xs text-teal-700">
								★ 현장 투입 중 휴가 시 프로젝트 PM에게도 알림 자동 발송
							</div>
							<div className="flex gap-2">
								<Button variant="outline" className="flex-1" size="sm">초기화</Button>
								<Button className="flex-1" size="sm">신청</Button>
							</div>
						</div>
					</div>
				</div>

				{/* 우측: 신청 내역 */}
				<div className="lg:col-span-2 bg-card rounded-xl border p-4">
					<h2 className="font-semibold text-foreground mb-4">내 신청 내역</h2>
					<div className="space-y-2">
						{myLeaves.map((leave, idx) => (
							<div key={idx} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/20 transition-colors">
								<div className="flex items-center gap-3">
									<div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
										leave.type === '연차' ? 'bg-teal-100 text-teal-700' :
										leave.type === '반차' ? 'bg-sky-100 text-sky-700' :
										'bg-red-100 text-red-700'
									}`}>
										{leave.type}
									</div>
									<div>
										<p className="text-sm font-medium text-foreground">{leave.period}</p>
										<p className="text-xs text-muted-foreground">{leave.days}</p>
									</div>
								</div>
								<span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
									leave.status === '승인' ? 'bg-emerald-100 text-emerald-700' :
									'bg-amber-100 text-amber-700'
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
