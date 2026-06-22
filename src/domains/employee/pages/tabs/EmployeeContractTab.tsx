
import { formatDate, formatAmount } from '@/shared/lib/shadcn/js/common';

export type TAssignmentContractInfo = {
	assignment_id: number;
	project_id: number;
	project_name: string;
	client: string;
	role: string;
	contract_start_date: string | null;
	contract_end_date: string | null;
	total_amount: number | null;
	performance_rating: string | null;
};

type Props = {
	contracts: TAssignmentContractInfo[];
};

const performanceRatingMap: Record<string, string> = {
	excellent: '우수',
	good: '양호',
	normal: '보통',
	poor: '미흡',
};

const formatPerformanceRating = (rating?: string | null) => {
	if (!rating) return '-';

	return performanceRatingMap[rating] ?? rating;
};

export default function EmployeeContractTab({ contracts }: Props) {
	return (
		<div className="bg-card rounded-xl border overflow-hidden">
			<div className="px-4 py-3 border-b bg-muted/30">
				<h3 className="font-semibold text-foreground text-sm">
					계약 정보
				</h3>
			</div>

			<table className="w-full text-sm">
				<thead className="bg-muted/50">
					<tr>
						<th className="text-left py-2.5 px-4 font-medium text-muted-foreground">
							프로젝트
						</th>
						<th className="text-left py-2.5 px-4 font-medium text-muted-foreground">
							고객사
						</th>
						<th className="text-left py-2.5 px-4 font-medium text-muted-foreground">
							역할
						</th>
						<th className="text-left py-2.5 px-4 font-medium text-muted-foreground">
							계약기간
						</th>
						<th className="text-left py-2.5 px-4 font-medium text-muted-foreground">
							계약금액
						</th>
						<th className="text-left py-2.5 px-4 font-medium text-muted-foreground">
							수행평가
						</th>
					</tr>
				</thead>

				<tbody>
					{contracts.length > 0 ? (
						contracts.map((contract) => (
							<tr
								key={contract.assignment_id}
								className="border-t hover:bg-muted/20 transition-colors"
							>
								<td className="py-2.5 px-4 font-medium text-foreground">
									{contract.project_name || '-'}
								</td>

								<td className="py-2.5 px-4 text-muted-foreground">
									{contract.client || '-'}
								</td>

								<td className="py-2.5 px-4">
									<span className="px-2 py-0.5 rounded text-xs bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 font-medium">
										{contract.role || '-'}
									</span>
								</td>

								<td className="py-2.5 px-4 text-muted-foreground">
									{formatDate(contract.contract_start_date)} ~{' '}
									{contract.contract_end_date ? formatDate(contract.contract_end_date) : '현재'}
								</td>
		
								<td className="py-2.5 px-4 font-medium">
									{formatAmount(contract.total_amount)}
								</td>

								<td className="py-2.5 px-4">
									<span className="px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground font-medium">
										{formatPerformanceRating(contract.performance_rating)}
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
								계약 정보가 없습니다.
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
}