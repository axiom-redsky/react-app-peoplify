import type { TEmployeeDetail } from '../EmployeeDetailPage';
import { formatPhoneNumber, formatDate } from '@/shared/lib/shadcn/js/common';

type CommonCode = {
	code: string;
	code_name?: string;
	name?: string;
	parent_code?: string | null;
};

type Props = {
	employee: TEmployeeDetail;
	positionOptions: CommonCode[];
	jobRoleOptions: CommonCode[];
	jobRoleCategoryOptions: CommonCode[];
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

const getCodeName = (options: CommonCode[], code?: string | null) => {
	if (!code) return '-';

	const found = options.find((item) => item.code === code);

	return found?.code_name ?? found?.name ?? code;
};

export default function EmployeeBasicInfoTab({
	employee,
	positionOptions,
	jobRoleOptions,
	jobRoleCategoryOptions,
}: Props) {
	
	const currentJobRole = jobRoleOptions.find((item) => item.code === employee.job_role_code);
	const jobRoleCategoryCode = currentJobRole?.parent_code ?? null;
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
						value={employee.name}
					/>

					<InfoField
						label="이메일"
						value={employee.email}
					/>

					<InfoField
						label="연락처"
						value={employee.phone ? formatPhoneNumber(employee.phone) : '-'}
					/>

					<InfoField
						label="입사일"
						value={employee.hire_date ? formatDate(employee.hire_date) : '-'}
					/>

					<InfoField
						label="부서"
						value={employee.department}
					/>

					<InfoField
						label="직급"
						value={getCodeName(positionOptions, employee.position)}
					/>

					<InfoField
						label="직무구분"
						value={getCodeName(jobRoleCategoryOptions, jobRoleCategoryCode)}
					/>

					<InfoField
						label="직무"
						value={getCodeName(jobRoleOptions, employee.job_role_code)}
					/>
				</div>
			</section>

			<section className="bg-card rounded-xl border p-5">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<InfoField
						label="재직 상태"
						value={employmentStatusMap[employee.employment_status] ?? '-'}
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
