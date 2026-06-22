import { useParams } from 'react-router';
import { useApi } from '@axiom/hooks';
import { Button } from '@axiom/components/ui';
import PageHeader from '@/shared/components/ui/PageHeader';
import { formatPhoneNumber, formatDate, formatRate } from '@/shared/lib/shadcn/js/common';
import { Mail, Phone, Calendar, Edit, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import EmployeeAssignmentHistoryTab from './tabs/EmployeeAssignmentHistoryTab';
import EmployeeSkillsTab from './tabs/EmployeeSkillsTab';
import EmployeeBasicInfoTab from './tabs/EmployeeBasicInfoTab';
import EmployeeContractTab from './tabs/EmployeeContractTab';

// API 응답 타입 정의
export type TAssignmentHistory = {
	assignment_id: number;
	role: string;
	rate_pct: number;
	start_date: string;
	end_date: string | null;
	project_name: string;
	client: string;
	project_status: string;
	project_id: number;
	created_at: string;
	updated_at: string;
};

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

export type TEmployeeDetail = {
	id: number;
	name: string;
	email: string;
	phone: string;
	department: string;
	position: string;
	employment_status: string;
	hire_date: string;
	resign_date?: string | null;
	skills: string[];
	assignment_history: TAssignmentHistory[];
	contracts?: TAssignmentContractInfo[];
};

// API 응답 wrapper 타입
type TEmployeeDetailResponse = {
	success: boolean;
	data: TEmployeeDetail;
	meta: {
		total: number;
		page: number;
		limit: number;
	};
};

//const tabs = ['기본정보', '투입 이력', '기술스택', '계약정보'];
const tabs = [
	{ key: 'basic', label: '기본정보' },
	{ key: 'assignment', label: '투입 이력' },
	{ key: 'skills', label: '기술스택' },
	{ key: 'contracts', label: '계약정보' },
] as const;

type TabKey = (typeof tabs)[number]['key'];

export default function EmployeeDetailPage(): React.ReactNode {
	const { id } = useParams<{ id: string }>();

	/** 직원 상세 정보 상태 관리 */
	const [employee, setEmployee] = useState<TEmployeeDetail | null>(null);

	/** 현재 활성화된 탭 상태 관리 */
	const [activeTab, setActiveTab] = useState<TabKey>('basic');

	/**
	 * 목록 복귀
	 * 상세 URL에 returnUrl 이 있으면 기존 검색조건이 담긴 목록으로 복귀
	 * 없으면 일반 목록으로 이동
	 */
	const handleMoveList = () => {
		if (!employee?.id) return;

		const queryString = getCurrentQueryString();

		$router.push(`/employee/employee-list${queryString}`);
	};

	/**
	 * 수정 화면 이동
	 * 수정 화면에서도 다시 목록 조건을 유지할 수 있도록 returnUrl 전달
	 */
	const getCurrentQueryString = () => {
		const hash = window.location.hash;
		const queryString = hash.includes('?') ? hash.split('?')[1] : '';

		return queryString ? `?${queryString}` : '';
	};

	const handleMoveEdit = () => {
		if (!employee?.id) return;

		const queryString = getCurrentQueryString();

		$router.push(`/employee/employee-edit/${employee.id}${queryString}`);
	};

	// API 조회
	const {
		data: response,
		isPending,
		error,
		refetch,
		isFetching,
	} = useApi<TEmployeeDetailResponse>(`/api/employees/${id}`, {
		params: { id },
	});

	// DELETE API 호출
	const { mutate: deleteEmployee } = useApi<{ success: boolean; message: string }, void>(`/api/employees/${id}`, {
		method: 'DELETE',
		type: 'mutation',
		mutationOptions: {
			onSuccess: (res) => {
				alert(res.message);

				// 삭제 후에도 검색조건 유지된 목록으로 복귀
				handleMoveList();
			},
			onError: () => {
				alert('퇴직처리 실패했습니다.');
			},
		},
	});

	/** 퇴직 처리 액션 */
	const deleteEmployeeAct = () => {
		if (!confirm('퇴직 처리 하시겠습니까?')) return;

		deleteEmployee();
	};

	/** 직원 데이터 업데이트 */
	useEffect(() => {
		setEmployee(response?.data ?? null);
	}, [response]);

	/** 퇴사 여부 판단 */
	const isResigned = employee?.employment_status === 'resigned';

	/** 로딩 상태 처리 */
	if (isPending) {
		return (
			<div className="p-5">
				<PageHeader
					title="직원 상세"
					breadcrumb={[{ label: '직원관리', path: '/employee/employee-list' }, { label: '로딩 중...' }]}
				/>
				<p className="text-sm text-gray-500">데이터를 불러오는 중…</p>
			</div>
		);
	}

	/** 에러 상태 처리 */
	if (error) {
		return (
			<div className="p-5">
				<PageHeader
					title="직원 상세"
					breadcrumb={[{ label: '직원관리', path: '/employee/employee-list' }, { label: '에러 발생' }]}
				/>
				<p className="text-sm text-red-600">에러: {error.message}</p>
				<Button
					onClick={() => refetch()}
					disabled={isFetching}
					className="mt-4"
				>
					{isFetching ? '다시 가져오는 중…' : '다시 가져오기'}
				</Button>
			</div>
		);
	}

	/** 데이터 없음 처리 */
	if (!employee) {
		return (
			<div className="p-5">
				<PageHeader
					title="직원 상세"
					breadcrumb={[{ label: '직원관리', path: '/employee/employee-list' }, { label: '데이터 없음' }]}
				/>
				<p className="text-sm text-gray-500">해당 직원을 찾을 수 없습니다.</p>

				<div className="flex justify-end gap-2 mt-4">
					<Button
						variant="outline"
						onClick={handleMoveList}
					>
						목록으로
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="p-5">
			<PageHeader
				title="직원 상세"
				breadcrumb={[{ label: '직원관리', path: '/employee/employee-list' }, { label: employee.name }]}
				actions={
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={handleMoveEdit}
						>
							<Edit className="w-4 h-4 mr-1.5" />
							수정
						</Button>

						{/* 퇴사 상태가 아닐 경우에만 삭제 버튼 노출 */}
						{!isResigned && (
							<Button
								variant="outline"
								size="sm"
								className="text-destructive hover:text-destructive"
								onClick={deleteEmployeeAct}
							>
								<Trash2 className="w-4 h-4 mr-1.5" />
								삭제
							</Button>
						)}
					</div>
				}
			/>

			{/* 직원 요약 카드 */}
			<div className="bg-card rounded-xl border p-5 mb-4 flex flex-col sm:flex-row sm:items-center gap-4">
				<div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-2xl font-bold">
					{String(employee.name).charAt(0)}
				</div>

				<div className="flex-1">
					<div className="flex items-center gap-2 mb-1">
						<h2 className="text-xl font-bold text-foreground">{employee.name}</h2>
						<span className="text-sm text-muted-foreground">
							{employee.department} · {employee.position}
						</span>
					</div>

					<div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
						<span className="flex items-center gap-1.5">
							<Mail className="w-3.5 h-3.5" />
							{employee.email}
						</span>

						<span className="flex items-center gap-1.5">
							<Phone className="w-3.5 h-3.5" />
							{formatPhoneNumber(employee.phone)}
						</span>

						<span className="flex items-center gap-1.5">
							<Calendar className="w-3.5 h-3.5" />
							입사 {formatDate(employee.hire_date)}
						</span>
					</div>
				</div>

				<div className="text-right">
					<p className="text-sm text-muted-foreground">현 투입 프로젝트</p>
					<p className="font-semibold text-foreground">{employee.assignment_history?.[0]?.project_name || '-'}</p>
					<p className="text-sm text-brand-600 font-medium">
						{employee.assignment_history?.[0]?.rate_pct
							? `투입률 ${employee.assignment_history[0].rate_pct}%`
							: '미투입'}
					</p>
				</div>
			</div>

			{/* 탭 */}
			<div className="border-b mb-4">
				<div className="flex gap-0">
					{tabs.map((tab) => (
						<button
							key={tab.key}
							type="button"
							onClick={() => setActiveTab(tab.key)}
							className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
								activeTab === tab.key
									? 'border-brand-600 text-brand-600'
									: 'border-transparent text-muted-foreground hover:text-foreground'
							}`}
						>
							{tab.label}

							{activeTab === tab.key && <span className="ml-1 text-xs text-brand-500">★</span>}
						</button>
					))}
				</div>
			</div>

			{/* 탭 내용 */}

			{activeTab === 'basic' && <EmployeeBasicInfoTab employee={employee} />}

			{activeTab === 'assignment' && (
				<EmployeeAssignmentHistoryTab assignmentHistory={employee.assignment_history ?? []} />
			)}

			{activeTab === 'skills' && <EmployeeSkillsTab skills={employee.skills ?? []} />}

			{activeTab === 'contracts' && <EmployeeContractTab contracts={employee.contracts ?? []} />}
			{/* 하단 버튼 */}
			<div className="flex justify-end gap-2 mt-4">
				<Button
					variant="outline"
					onClick={handleMoveList}
				>
					목록으로
				</Button>
			</div>
		</div>
	);
}
