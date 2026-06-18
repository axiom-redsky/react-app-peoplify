import type { TEmployeeDetail } from '../EmployeeDetailPage';
import { formatPhoneNumber, formatDate } from '@/shared/lib/shadcn/js/common';

type Props = {
	employee: TEmployeeDetail;
};

const employmentStatusMap: Record<string, string> = {
	active: '재직',
	on_leave: '휴직',
	resigned: '퇴사',
};

const InfoField = ({ label, value }: { label: string; value?: string | number | null }) => {
	return (
		<div>
			<label className="block text-sm font-semibold text-foreground mb-2">{label}</label>

			<div className="h-10 px-3 rounded-md border bg-background/40 text-sm text-foreground flex items-center">
				{value || '-'}
			</div>
		</div>
	);
};

export default function EmployeeBasicInfoTab({ employee }: Props) {
	const isResigned = employee.employment_status === 'resigned';

	return (
		<div className="space-y-4">
			<section className="bg-card rounded-xl border p-5">
				<div className="flex items-center gap-2 mb-5">
					<h3 className="font-semibold text-foreground text-base">기본 정보</h3>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<InfoField
						label="이름"
						value={employee.name ? employee.name : '-'}
					/>
					<InfoField
						label="이메일"
						value={employee.email ? employee.email : '-'}
					/>
					<InfoField
						label="연락처"
						value={formatPhoneNumber(employee.phone ? employee.phone : '-')}
					/>
					<InfoField
						label="입사일"
						value={employee.hire_date ? formatDate(employee.hire_date) : '-'}
					/>
					<InfoField
						label="부서"
						value={employee.department ? employee.department : '-'}
					/>
					<InfoField
						label="직급"
						value={employee.position ? employee.position : '-'}
					/>
				</div>
			</section>

			<section className="bg-card rounded-xl border p-5">
				<div className="flex items-center gap-2 mb-5"></div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<InfoField
						label="재직 상태"
						value={employmentStatusMap[employee.employment_status] || employmentStatusMap[employee.employmentStatus]}
					/>

					{isResigned && (
						<InfoField
							label="퇴사일"
							value={employee.resign_date ? formatDate(employee.resign_date) : '-'}
						/>
					)}
				</div>
			</section>
		</div>
	);
}
