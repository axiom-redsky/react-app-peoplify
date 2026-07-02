import { useApi } from '@axiom/hooks';
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@axiom/components/ui';
import PageHeader from '@/shared/components/ui/PageHeader';
import StatusEmployBadge from '@/shared/components/ui/StatusEmployBadge';
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, UserPlus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAppAlert } from '@/shared/components/layout/default/AppAlertProvider';

// 직원 타입 정의 — 실제 API response 구조에 맞춤
type TEmployee = {
	id: number;
	name: string;
	email: string;
	phone: string;
	department: string;
	position: string;
	skills: string[];
	employment_status: 'active' | 'leave' | 'resigned';
	hire_date: string;
	created_at: string;
	updated_at: string;
};

// API 응답 wrapper 타입
type TEmployeeListResponse = {
	success: boolean;
	data: TEmployee[];
	meta: {
		total: number;
		page: number;
		limit: number;
	};
};

const EMPLOYEES_ENDPOINT = '/api/employees' as const;
const PAGE_LIMIT = 10; // 페이지당 표시할 항목 수

type TDepartment = {
	id: number;
	name: string;
};

type TDepartmentListResponse = {
	success: boolean;
	data: TDepartment[];
};

const DEPARTMENTS_ENDPOINT = '/api/departments';

type TCommonCode = {
	id: number;
	group_code: string;
	code: string;
	code_name: string;
	sort_order: number;
	use_yn: boolean;
	extra1: string | null;
	extra2: string | null;
	extra3: string | null;
};

type TCommonCodesResponse = {
	success: boolean;
	data: {
		EMPLOYMENT_STATUS?: TCommonCode[];
		DEPLOYMENT_STATUS?: TCommonCode[];
		POSITION?: TCommonCode[];
	};
};

/**
 * URL query string 에서 검색조건 초기값 복원
 */
const getHashSearchParams = () => {
	const queryString = window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '';

	return new URLSearchParams(queryString);
};

const getInitialSearch = () => {
	const params = getHashSearchParams();

	return params.get('search') || '';
};

const getInitialValue = (key: string, defaultValue = 'all') => {
	const params = getHashSearchParams();

	return params.get(key) || defaultValue;
};

const getInitialPage = () => {
	const params = getHashSearchParams();
	const page = Number(params.get('page'));

	return Number.isNaN(page) || page < 1 ? 1 : page;
};

export default function EmployeeListPage(): React.ReactNode {
	/** 페이지네이션 상태 */
	const [currentPage, setCurrentPage] = useState<number>(getInitialPage);

	/** 검색어 상태 */
	const [searchQuery, setSearchQuery] = useState<string>(getInitialSearch);

	/** 검색 타이머 ID — Debounce 구현용 */
	const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	const [selectedDepartment, setSelectedDepartment] = useState<string>(() => getInitialValue('department'));
	const [selectedStatus, setSelectedStatus] = useState<string>(() => getInitialValue('status'));
	const [selectedDeployment, setSelectedDeployment] = useState<string>(() => getInitialValue('deployment_status'));

	const [employees, setEmployees] = useState<TEmployee[]>([]);
	const [employmentStatusCodes, setEmploymentStatusCodes] = useState<TCommonCode[]>([]);

	const { openAlert } = useAppAlert();

	/** GET 조회 - 직원 목록 (페이지네이션 + 검색 파라미터 포함) */
	const {
		data: response,
		isPending,
		error: loadError,
		refetch,
		isFetching,
	} = useApi<TEmployeeListResponse>(EMPLOYEES_ENDPOINT, {
		params: {
			page: currentPage,
			limit: PAGE_LIMIT,
			search: searchQuery || undefined,
			department: selectedDepartment === 'all' ? undefined : selectedDepartment,
			status: selectedStatus === 'all' ? undefined : selectedStatus,
			deployment_status: selectedDeployment === 'all' ? undefined : selectedDeployment,
		},
	});

	const { data: departmentsResponse } = useApi<TDepartmentListResponse>(DEPARTMENTS_ENDPOINT);
	const departments = departmentsResponse?.data ?? [];

	const { data: commonCodesResponse } = useApi<TCommonCodesResponse>('/api/common-codes', {
		params: {
			groups: 'EMPLOYMENT_STATUS,POSITION',
			include_disabled: 'true',
		},
	});

	const { data: deploymentResponse } = useApi<TCommonCodesResponse>('/api/common-codes', {
		params: {
			groups: 'DEPLOYMENT_STATUS',
		},
	});

	const deploymentStatuses = deploymentResponse?.data?.DEPLOYMENT_STATUS ?? [];
	const positionOptions = commonCodesResponse?.data?.POSITION ?? [];
	// 총 페이지 수 계산
	const totalPages = Math.ceil((response?.meta.total ?? 0) / PAGE_LIMIT);
	const getCodeName = (options: TCommonCode[], code?: string | null) => {
		if (!code) return '-';

		const found = options.find((item) => item.code === code);

		return found?.code_name ?? code;
	};
	/**
	 * 검색조건 변경 시 URL query string 동기화
	 * 상세 화면 이동 후 목록 복귀 시 검색조건 유지 목적
	 */
	/*
	useEffect(() => {
		const params = new URLSearchParams();

		if (searchQuery) params.set('search', searchQuery);
		if (selectedDepartment !== 'all') params.set('department', selectedDepartment);
		if (selectedStatus !== 'all') params.set('status', selectedStatus);
		if (selectedDeployment !== 'all') params.set('deployment_status', selectedDeployment);
		if (currentPage > 1) params.set('page', String(currentPage));

		const queryString = params.toString();
		const nextUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;

		window.history.replaceState(null, '', nextUrl);
	}, [searchQuery, selectedDepartment, selectedStatus, selectedDeployment, currentPage]);
*/
	/**
	 * 목록 조회 에러 처리
	 */
	useEffect(() => {
		if (!loadError) return;

		const error = loadError as any;

		const message =
			error?.response?.data?.message ||
			error?.data?.message ||
			error?.message ||
			'직원 목록 조회 중 오류가 발생했습니다.';

		openAlert({
			title: '조회 실패',
			message,
			confirmText: '확인',
		});
	}, [loadError, openAlert]);

	/**
	 * 직원 목록 response 반영
	 */
	useEffect(() => {
		setEmployees(response?.data ?? []);
	}, [response]);

	/**
	 * 재직상태 공통코드 반영
	 */
	useEffect(() => {
		if (commonCodesResponse?.data?.EMPLOYMENT_STATUS) {
			setEmploymentStatusCodes(commonCodesResponse.data.EMPLOYMENT_STATUS);
		}
	}, [commonCodesResponse]);

	/**
	 * 컴포넌트 언마운트 시 검색 타이머 정리
	 */
	useEffect(() => {
		return () => {
			if (searchTimeoutRef.current) {
				clearTimeout(searchTimeoutRef.current);
			}
		};
	}, []);

	// 검색어 변경 핸들러 (Debounce 적용)
	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;

		setSearchQuery(value);
		setCurrentPage(1);

		if (searchTimeoutRef.current) {
			clearTimeout(searchTimeoutRef.current);
		}

		searchTimeoutRef.current = setTimeout(() => {
			refetch();
		}, 800);
	};

	const handleDepartmentChange = (value: string) => {
		setSelectedDepartment(value);
		setCurrentPage(1);
	};

	const handleStatusChange = (value: string) => {
		setSelectedStatus(value);
		setCurrentPage(1);
	};

	const handleDeploymentChange = (value: string) => {
		setSelectedDeployment(value);
		setCurrentPage(1);
	};

	const handleReset = () => {
		setSearchQuery('');
		setCurrentPage(1);
		setSelectedDepartment('all');
		setSelectedStatus('all');
		setSelectedDeployment('all');

		window.history.replaceState(null, '', window.location.pathname);

		//refetch();
	};

	// 페이지 변경 핸들러
	const handlePageChange = (page: number) => {
		if (page >= 1 && page <= totalPages) {
			setCurrentPage(page);
		}
	};

	// 직원등록 화면이동
	const handleMoveEmployeeForm = () => {
		$router.push('/employee/employee-form');
	};

	// 직원 상세 화면이동
	const handleMoveDetail = (employeeId: number) => {
		const params = new URLSearchParams();

		if (searchQuery.trim()) {
			params.set('search', searchQuery.trim());
		}

		if (selectedDepartment !== 'all') {
			params.set('department', selectedDepartment);
		}

		if (selectedStatus !== 'all') {
			params.set('status', selectedStatus);
		}

		if (selectedDeployment !== 'all') {
			params.set('deployment_status', selectedDeployment);
		}

		if (currentPage > 1) {
			params.set('page', String(currentPage));
		}

		const queryString = params.toString();

		$router.push(`/employee/employee-detail/${employeeId}${queryString ? `?${queryString}` : ''}`);
	};

	return (
		<div className="p-5">
			<PageHeader
				title="직원 관리"
				actions={
					<Button
						size="lg"
						onClick={handleMoveEmployeeForm}
					>
						<UserPlus className="w-4 h-4 mr-1.5" />
						직원 등록
					</Button>
				}
			/>

			{/* 필터바 */}
			<div className="flex flex-wrap gap-2 mb-4">
				<div className="relative flex-1 min-w-48">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
					<Input
						onChange={handleSearchChange}
						value={searchQuery}
						className="h-9 pl-9 bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm focus-visible:border-primary focus-visible:ring-primary/20"
						placeholder="이름 검색..."
					/>
				</div>

				<Select
					value={selectedDepartment}
					onValueChange={handleDepartmentChange}
				>
					<SelectTrigger
						size="lg"
						className="bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm"
					>
						<SelectValue placeholder="부서 선택" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">부서 전체</SelectItem>
						{departments.map((dept) => (
							<SelectItem
								key={dept.id}
								value={dept.name}
							>
								{dept.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select
					value={selectedStatus}
					onValueChange={handleStatusChange}
				>
					<SelectTrigger
						size="lg"
						className="bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm"
					>
						<SelectValue placeholder="재직상태 선택" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">재직상태 전체</SelectItem>
						{employmentStatusCodes.map((code) => (
							<SelectItem
								key={code.code}
								value={code.code}
							>
								{code.code_name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select
					value={selectedDeployment}
					onValueChange={handleDeploymentChange}
				>
					<SelectTrigger
						size="lg"
						className="bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm"
					>
						<SelectValue placeholder="투입상태 선택" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">투입상태 전체</SelectItem>
						{deploymentStatuses.map((status) => (
							<SelectItem
								key={status.code}
								value={status.code}
							>
								{status.code_name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Button
					variant="outline"
					size="lg"
					onClick={handleReset}
					className="flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg text-muted-foreground hover:bg-muted transition-colors"
				>
					<SlidersHorizontal className="w-4 h-4" />
					초기화
				</Button>
			</div>

			{/* 테이블 */}
			<div className="bg-card rounded-xl border overflow-hidden">
				{loadError ? (
					<div className="p-8 text-center text-red-600">
						<p>에러: {loadError.message}</p>
						<button
							onClick={() => refetch()}
							disabled={isFetching}
							className="mt-2 px-4 py-2 text-sm border rounded-lg hover:bg-muted"
						>
							{isFetching ? '다시 가져오는 중…' : '다시 가져오기'}
						</button>
					</div>
				) : (
					<>
						<table className="w-full text-sm">
							<thead className="bg-muted/50">
								<tr>
									<th className="text-left py-3 px-4 font-medium text-muted-foreground">이름</th>
									<th className="text-left py-3 px-4 font-medium text-muted-foreground">부서</th>
									<th className="text-left py-3 px-4 font-medium text-muted-foreground">직급</th>
									<th className="text-left py-3 px-4 font-medium text-muted-foreground">이메일</th>
									<th className="text-left py-3 px-4 font-medium text-muted-foreground">입사일</th>
									<th className="text-left py-3 px-4 font-medium text-muted-foreground">상태</th>
									<th className="text-left py-3 px-4 font-medium text-muted-foreground">액션</th>
								</tr>
							</thead>

							<tbody>
								{isPending ? (
									Array.from({ length: 10 }).map((_, index) => (
										<tr
											key={index}
											className="border-t"
										>
											<td className="py-3 px-4">
												<div className="flex items-center gap-2">
													<div className="w-8 h-8 rounded-full bg-muted animate-pulse"></div>
													<div className="h-4 bg-muted animate-pulse rounded w-20"></div>
												</div>
											</td>
											<td className="py-3 px-4">
												<div className="h-4 bg-muted animate-pulse rounded w-16"></div>
											</td>
											<td className="py-3 px-4">
												<div className="h-4 bg-muted animate-pulse rounded w-16"></div>
											</td>
											<td className="py-3 px-4">
												<div className="h-4 bg-muted animate-pulse rounded w-24"></div>
											</td>
											<td className="py-3 px-4">
												<div className="h-4 bg-muted animate-pulse rounded w-16"></div>
											</td>
											<td className="py-3 px-4">
												<div className="h-4 bg-muted animate-pulse rounded w-12"></div>
											</td>
											<td className="py-3 px-4">
												<div className="h-4 bg-muted animate-pulse rounded w-16"></div>
											</td>
										</tr>
									))
								) : employees.length > 0 ? (
									employees.map((emp: TEmployee) => (
										<tr
											key={emp.id}
											className="border-t hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors cursor-pointer"
										>
											<td className="py-3 px-4">
												<div className="flex items-center gap-2">
													<div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-300 font-semibold text-xs">
														{emp.name[0]}
													</div>
													<span className="font-medium text-foreground">{emp.name}</span>
												</div>
											</td>
											<td className="py-3 px-4 text-muted-foreground">{emp.department}</td>
											<td className="py-3 px-4 text-muted-foreground">{getCodeName(positionOptions, emp.position)}</td>
											<td className="py-3 px-4 text-muted-foreground">{emp.email}</td>
											<td className="py-3 px-4 text-muted-foreground">{emp.hire_date.split('T')[0]}</td>
											<td className="py-3 px-4">
												<StatusEmployBadge status={emp.employment_status} />
											</td>
											<td className="py-3 px-4">
												<Button
													variant="link"
													className="text-primary hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 px-0"
													onClick={() => handleMoveDetail(emp.id)}
												>
													상세보기
												</Button>
											</td>
										</tr>
									))
								) : (
									<tr>
										<td
											colSpan={7}
											className="py-8 text-center text-muted-foreground"
										>
											등록된 직원이 없습니다.
										</td>
									</tr>
								)}
							</tbody>
						</table>

						{/* 페이지네이션 */}
						<div className="flex items-center justify-between px-4 py-3 border-t bg-muted/30">
							<div className="text-sm text-muted-foreground">
								총 {response?.meta.total ?? 0}개 중 {currentPage}페이지
							</div>

							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									disabled={currentPage === 1}
									onClick={() => handlePageChange(currentPage - 1)}
								>
									<ChevronLeft className="w-4 h-4" />
								</Button>

								<div className="flex items-center gap-1">
									{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
										<Button
											key={page}
											variant={currentPage === page ? 'default' : 'outline'}
											size="sm"
											onClick={() => handlePageChange(page)}
											className="w-8 h-8 p-0"
										>
											{page}
										</Button>
									))}
								</div>

								<Button
									variant="outline"
									size="sm"
									disabled={currentPage === totalPages || totalPages === 0}
									onClick={() => handlePageChange(currentPage + 1)}
								>
									<ChevronRight className="w-4 h-4" />
								</Button>
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
