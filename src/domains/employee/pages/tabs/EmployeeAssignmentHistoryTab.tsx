import StatusBadge, { type StatusType } from '@/shared/components/ui/StatusBadge';
import { formatDate, formatRate } from '@/shared/lib/shadcn/js/common';
import type { TAssignmentHistory } from '../EmployeeDetailPage';

type Props = {
	assignmentHistory: TAssignmentHistory[];
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
						assignmentHistory.map((proj) => (
							<tr
								key={proj.assignment_id}
								className="border-t hover:bg-muted/20 transition-colors"
							>
								<td
									className="py-2.5 px-4 font-medium text-foreground cursor-pointer hover:underline"
									onClick={() => $router.push(`/project/${proj.project_id}`)}
								>
									{proj.project_name}
								</td>

								<td className="py-2.5 px-4 text-muted-foreground">{proj.client}</td>

								<td className="py-2.5 px-4">
									<span className="px-2 py-0.5 rounded text-xs bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 font-medium">
										{proj.role}
									</span>
								</td>

								<td className="py-2.5 px-4 text-muted-foreground">
									{formatDate(proj.start_date)} ~ {proj.end_date ? formatDate(proj.end_date) : '현재'}
								</td>

								<td className="py-2.5 px-4 font-medium">{formatRate(proj.rate_pct)}</td>

								<td className="py-2.5 px-4">
									<StatusBadge status={proj.project_status as StatusType} />
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
