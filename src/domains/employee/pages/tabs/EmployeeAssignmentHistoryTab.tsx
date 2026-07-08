import { formatDate, formatRate } from '@/shared/lib/shadcn/js/common';
import type { TAssignmentHistory } from '../EmployeeDetailPage';

type Props = {
	assignmentHistory: TAssignmentHistory[];
};

/**
 * 투입 이력 상태 한글 표시값 변환
 */
const getHistoryStatusLabel = (status?: string | null): string => {
	switch (status) {
		case 'SCHEDULED':
			return '예정';
		case 'ACTIVE':
			return '투입중';
		case 'ENDED':
			return '종료';
		case 'CANCELED':
			return '취소';
		default:
			return '-';
	}
};

/**
 * 투입 이력 상태별 배지 스타일 반환
 */
const getHistoryStatusClassName = (status?: string | null): string => {
	switch (status) {
		case 'SCHEDULED':
			return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
		case 'ACTIVE':
			return 'bg-green-500/20 text-green-300 border-green-500/30';
		case 'ENDED':
			return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
		case 'CANCELED':
			return 'bg-red-500/20 text-red-300 border-red-500/30';
		default:
			return 'bg-muted text-muted-foreground border-border';
	}
};

export default function EmployeeAssignmentHistoryTab({ assignmentHistory }: Props): React.ReactNode {
	return (
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
					{assignmentHistory.length > 0 ? (
						assignmentHistory.map((history) => (
							<tr
								key={history.id}
								className="border-t hover:bg-muted/20 transition-colors"
							>
								<td
									className={`py-2.5 px-4 font-medium text-foreground ${
										history.project_id ? 'cursor-pointer hover:underline' : ''
									}`}
									onClick={() => {
										if (!history.project_id) return;

										$router.push(`/project/${history.project_id}`);
									}}
								>
									{history.project_name || '-'}
								</td>

								<td className="py-2.5 px-4 text-muted-foreground">
									{history.client || '-'}
								</td>

								<td className="py-2.5 px-4">
									{history.role ? (
										<span className="px-2 py-0.5 rounded text-xs bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 font-medium">
											{history.role}
										</span>
									) : (
										<span className="text-muted-foreground">-</span>
									)}
								</td>

								<td className="py-2.5 px-4 text-muted-foreground">
									{formatDate(history.start_date)} ~ {history.end_date ? formatDate(history.end_date) : '현재'}
								</td>

								<td className="py-2.5 px-4 font-medium">
									{formatRate(history.rate_pct)}
								</td>

								<td className="py-2.5 px-4">
									<span
										className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getHistoryStatusClassName(
											history.status,
										)}`}
									>
										{getHistoryStatusLabel(history.status)}
									</span>
								</td>
							</tr>
						))
					) : (
						<tr>
							<td
								colSpan={6}
								className="py-8 text-center text-muted-foreground"
							>
								투입 이력이 없습니다.
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
}