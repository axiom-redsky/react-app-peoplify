// React 타입과 화면 구성에 필요한 UI 컴포넌트를 import한다.
import type React from 'react';
import {
	Button,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Calendar,
	FormField,
} from '@axiom/components/ui';
import PageHeader from '@/shared/components/ui/PageHeader';
import { SlidersHorizontal, CheckSquare } from 'lucide-react';
import { useApi } from '@axiom/hooks';
import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router';
import { useAppAlert } from '@/shared/components/layout/default/AppAlertProvider';
import { validateRequired, getFieldClassName } from '@/shared/lib/shadcn/js/common';

/**
 * 벤치 인력 목록에서 사용하는 직원 정보 타입.
 * /api/dashboard/bench-members 응답의 개별 인력 데이터를 화면 표시와 선택 처리에 사용한다.
 */
interface BenchMember {
	id: number; // 직원 ID
	name: string; // 직원명
	department: string; // 소속 부서명
	position: string; // 직급/직책 정보
	hire_date: string; // 입사일
	skills: string[]; // 보유 기술스택 목록
	job_role_code?: string | null; // 직무 코드
	job_role_name?: string | null; // 직무명
	job_role_category_code?: string | null; // 직무구분 코드
	job_role_category_name?: string | null; // 직무구분명
}

/**
 * 가용 인력 목록 상단 필터의 선택 상태 타입.
 * 현재 화면에서는 각 필터 값만 보관하고, 실제 필터링 로직은 추후 확장 가능하다.
 */
interface FilterState {
	techStack: string; // 기술스택 필터 값
	rate: string; // 투입률 필터 값
	experience: string; // 경력 필터 값
	dept: string; // 부서 필터 값
}

/** 벤치 인력 목록 API 응답 타입. */
type TBenchMemberListResponse = {
	success: boolean;
	data: BenchMember[];
};

/**
 * 프로젝트 상세 API에서 내려오는 투입 인력 정보 타입.
 * assignments 배열의 개별 row를 표현한다.
 */
type TProjectAssignment = {
	id: number;
	role: string;
	rate_pct: number;
	start_date: string;
	end_date: string | null;
	employee_id: number;
	employee_name: string;
	department: string;
	position: string;
	job_role_code?: string | null;
	job_role_name?: string | null;
	job_role_category_code?: string | null;
	job_role_category_name?: string | null;
};

/** 프로젝트 상세 전체 응답 데이터 타입. */
type TProjectDetail = {
	assignments: TProjectAssignment[];
	client: string;
	created_at: string;
	description: string;
	end_date: string;
	id: number;
	name: string;
	progress_pct: number;
	start_date: string;
	status: string;
	tech_stack: string[];
	updated_at: string;
};

/** 화면 상태로 보관하는 프로젝트 기본 정보 타입. */
type TProjectDetailData = {
	id: number;
	name: string;
	client: string;
	start_date: string;
	end_date: string;
	description: string;
	progress_pct: number;
	status: string;
	tech_stack: string[];
};

/** 프로젝트 상세 API 응답 타입. */
type TProjectDetailResponse = {
	success: boolean;
	data: TProjectDetail;
};

/**
 * 인력 배정 등록 API 요청 타입.
 * 선택된 직원 ID 배열과 투입 기간, 역할, 투입률을 서버에 전달한다.
 */
type TAssignMemberRequest = {
	project_id: string; // 배정 대상 프로젝트 ID
	employee_id: number[]; // 배정 대상 직원 ID 목록
	role: string; // 프로젝트 내 역할
	rate_pct: number; // 투입률
	start_date: string; // 투입 시작일
	end_date: string | null; // 종료 예정일
	job_role_name: string;
	job_role_category_name: string;
};

/** 배정 설정 영역의 필수 입력값 검증 대상 타입. */
type TAssignRegisterRequest = {
	startDate: string; // 투입 시작일
	endDate: string; // 종료 예정일
};
// 배정 설정 폼의 필드별 에러 메시지 타입.
type TAssignRegisterErrors = Partial<Record<keyof TAssignRegisterRequest, string>>;
// 현재 열려 있는 날짜 선택기를 구분하기 위한 타입.
type TOpenDatePicker = 'startDate' | 'endDate' | null;
// 역할 Select에 표시할 고정 역할 목록.
const roles = ['PM', 'PL', '개발', 'QA', '디자인', 'BA'];

/**
 * 프로젝트 인력 배정 화면 컴포넌트.
 * 프로젝트 상세 정보와 벤치 인력 목록을 조회하고, 선택한 인력을 프로젝트에 배정한다.
 */
export default function ProjectAssignPage(): React.ReactNode {
	// URL 파라미터에서 프로젝트 ID를 가져온다.
	const { id } = useParams<{ id: string }>();
	// 공통 알림 팝업을 호출하기 위한 훅.
	const { openAlert } = useAppAlert();

	// 프로젝트 상세 조회 및 캐시 무효화에 사용하는 API 엔드포인트.
	const PROJECTS_ENDPOINT = `/api/projects/${id}` as const;

	// 시작일/종료일 날짜 선택기 중 현재 열려 있는 항목을 관리한다.
	const [openDatePicker, setOpenDatePicker] = useState<TOpenDatePicker>(null);
	// 시작일 날짜 선택기 DOM 참조.
	const startPickerRef = useRef<HTMLDivElement>(null);
	// 종료일 날짜 선택기 DOM 참조.
	const endPickerRef = useRef<HTMLDivElement>(null);
	// 화면 헤더와 breadcrumb에 표시할 프로젝트 기본 정보.
	const [project, setProject] = useState<TProjectDetailData | undefined>(undefined);
	// 프로젝트에 이미 배정된 인력 목록.
	const [assignments, setAssignments] = useState<TProjectAssignment[]>([]);
	// 프로젝트 고객사명 상태.
	const [client, setClient] = useState<string>('');

	// 가용 인력 목록 상단 필터 상태.
	const [filters, setFilters] = useState<FilterState>({
		techStack: 'all',
		rate: 'all',
		experience: 'all',
		dept: 'all',
	});

	// 배정 대상으로 선택한 직원 ID 목록.
	const [selectedIds, setSelectedIds] = useState<number[]>([]);
	// 현재 프로젝트에 투입 가능한 벤치 인력 목록.
	const [benchMembers, setBenchMembers] = useState<BenchMember[]>([]);

	// 배정 설정에서 선택한 역할 값.
	const [position, setPosition] = useState('');
	// 투입 시작일 값.
	const [startDate, setStartDate] = useState('');
	// 종료 예정일 값.
	const [endDate, setEndDate] = useState('');

	// 배정 확정 버튼 중복 클릭을 방지하기 위한 잠금 플래그.
	const isLockedRef = useRef(false);

	// 프로젝트 상세 정보를 조회한다.
	const { data, isPending } = useApi<TProjectDetailResponse>(PROJECTS_ENDPOINT);

	// 배정 가능한 벤치 인력 목록을 조회한다.
	const { data: benchResp, isLoading, error } = useApi<TBenchMemberListResponse>('/api/dashboard/bench-members');

	// FormField 검증 유틸과 연동하기 위한 폼 상태.
	const [form, setForm] = useState({
		name: '',
		client: '',
		start_date: '',
		end_date: '',
		status: 'planned',
		progress_pct: 0,
		description: '',
		tech_stack: [],
	});

	// 투입 시작일/종료 예정일 입력 검증 에러 상태.
	const [errors, setErrors] = useState<TAssignRegisterErrors>({});
	/**
	 * 폼 필드 값을 변경하고, 해당 필드에 남아 있는 에러 메시지를 초기화한다.
	 */
	const setField = <K extends keyof TAssignRegisterRequest>(key: K, value: TAssignRegisterRequest[K]): void => {
		setForm((prev) => ({
			...prev,
			[key]: value,
		}));

		if (errors[key]) {
			setErrors((prev) => ({
				...prev,
				[key]: undefined,
			}));
		}
	};

	// 인력 배정 등록 API mutation과 관련 캐시 무효화 함수를 준비한다.
	const {
		mutate: assignMembers,
		isPending: isAssigning,
		invalidateQueries,
	} = useApi<TAssignMemberRequest>('/api/assignments', {
		method: 'POST',
		type: 'mutation',
	});

	// 프로젝트 상세 API 응답을 화면 상태로 반영한다.
	useEffect(() => {
		if (data?.data) {
			setProject(data.data);
			setAssignments(data.data.assignments ?? []);
			setClient(data.data.client);
		}
	}, [data]);

	// 벤치 인력 API 응답을 목록 상태로 반영한다.
	useEffect(() => {
		if (benchResp?.data) {
			setBenchMembers(benchResp.data);
		}
	}, [benchResp]);

	// 필터 값 변경 감지용 effect. 현재는 실제 필터링 API 연동 전이라 별도 처리하지 않는다.
	useEffect(() => {
		// params 변경 시 useApi가 자동 재요청되는 구조라면 비워둬도 됨
	}, [filters]);

	/**
	 * 검증 실패 시 첫 번째 에러 필드로 포커스를 이동한다.
	 */
	const focusFirstError = (nextErrors: TAssignRegisterErrors): void => {
		const firstErrorKey = Object.keys(nextErrors)[0];

		if (!firstErrorKey) return;

		const target = document.querySelector(`[name="${firstErrorKey}"]`) as
			| HTMLInputElement
			| HTMLTextAreaElement
			| HTMLButtonElement
			| null;

		target?.focus();
	};

	/**
	 * 벤치 인력 row 선택/해제를 토글한다.
	 */
	const toggleMemberSelection = (employeeId: number) => {
		setSelectedIds((prev) =>
			prev.includes(employeeId) ? prev.filter((id) => id !== employeeId) : [...prev, employeeId],
		);
	};

	/**
	 * 배정 설정 입력값을 검증한다.
	 * 시작일/종료일 필수 여부와 종료일의 유효 범위를 확인한다.
	 */
	const validateForm = (): boolean => {
		const requiredResult = validateRequired(
			{
				startDate: startDate,
				endDate: endDate,
			},
			[
				{ key: 'startDate', message: '투입 시작일을 선택해주세요.' },
				{ key: 'endDate', message: '종료일을 선택해주세요.' },
			],
		);

		const nextErrors: TAssignRegisterErrors = {
			...(requiredResult.errors as TAssignRegisterErrors),
		};

		if (endDate !== '') {
			if (startDate > endDate) {
				nextErrors.endDate = '종료일은 시작일보다 빠를 수 없습니다.';
			}

			const today = new Date();
			const todayStr = [
				today.getFullYear(),
				String(today.getMonth() + 1).padStart(2, '0'),
				String(today.getDate()).padStart(2, '0'),
			].join('-');

			if (endDate && endDate <= todayStr) {
				nextErrors.endDate = '오늘 날짜 포함 하여 과거일은 선택할 수 없습니다.';
			}
		}
		setErrors(nextErrors);
		focusFirstError(nextErrors);

		return Object.keys(nextErrors).length === 0;
	};

	/**
	 * 상단 필터 Select 값 변경을 처리한다.
	 */
	const handleFilterChange = (key: keyof FilterState, value: string) => {
		setFilters((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	/**
	 * 프로젝트 상세 화면으로 돌아간다.
	 */
	const handleCancel = (): void => {
		$router.back();
	};

	/**
	 * 배정 확정 버튼 클릭 시 실행한다.
	 * 선택 인력 확인, 폼 검증, 중복 요청 방지 후 배정 등록 API를 호출한다.
	 */
	const handleAssignConfirm = () => {
		if (selectedIds.length === 0) {
			openAlert({
				title: '인력 선택 필요',
				message: '배정할 인력을 선택해주세요.',
				confirmText: '확인',
			});
			return;
		}
		if (!validateForm()) return;

		if (isLockedRef.current) return;

		isLockedRef.current = true;

		assignMembers(
			{
				project_id: id,
				employee_id: selectedIds,
				role: position,
				rate_pct: 100,
				start_date: startDate,
				end_date: endDate || null,
			},
			{
				onSuccess: async () => {
					await invalidateQueries(PROJECTS_ENDPOINT);
					await invalidateQueries('/api/dashboard/bench-members');

					openAlert({
						title: '등록 성공',
						message: '인력 배정이 완료되었습니다.',
						confirmText: '확인',
						onConfirm: () => {
							$router.push(`/project/${id}`);
						},
					});
				},
				onError: (error: any) => {
					isLockedRef.current = false;

					const message = error?.response?.data?.message || error?.message || '인력 배정 중 오류가 발생했습니다.';

					openAlert({
						title: '인력 배정 실패',
						message,
						confirmText: '확인',
					});
				},
			},
		);
	};

	// 선택된 직원 ID에 해당하는 벤치 인력 정보 목록.
	const selectedMembers = benchMembers.filter((member) => selectedIds.includes(member.id));

	return (
		<div className="p-5">
			<PageHeader
				title="인력 배정"
				breadcrumb={[
					{ label: '프로젝트', path: '/projects' },
					{
						label: project?.name ?? '프로젝트 상세',
						path: `/project/${id}`,
					},
					{ label: '인력 배정' },
				]}
			/>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
				<div className="lg:col-span-2">
					<div className="flex flex-wrap gap-2 mb-3">
						<Select
							value={filters.techStack}
							onValueChange={(value) => handleFilterChange('techStack', value)}
						>
							<SelectTrigger
								size="lg"
								className="bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm"
							>
								<SelectValue placeholder="기술스택" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">기술스택 전체</SelectItem>
							</SelectContent>
						</Select>

						<Select
							value={filters.rate}
							onValueChange={(value) => handleFilterChange('rate', value)}
						>
							<SelectTrigger
								size="lg"
								className="bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm"
							>
								<SelectValue placeholder="투입률 (현재)" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">투입률 전체</SelectItem>
							</SelectContent>
						</Select>

						<Select
							value={filters.experience}
							onValueChange={(value) => handleFilterChange('experience', value)}
						>
							<SelectTrigger
								size="lg"
								className="bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm"
							>
								<SelectValue placeholder="경력" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">경력 전체</SelectItem>
							</SelectContent>
						</Select>

						<Select
							value={filters.dept}
							onValueChange={(value) => handleFilterChange('dept', value)}
						>
							<SelectTrigger
								size="lg"
								className="bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm"
							>
								<SelectValue placeholder="부서" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">부서 전체</SelectItem>
							</SelectContent>
						</Select>

						<button
							type="button"
							className="flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg text-muted-foreground hover:bg-muted transition-colors"
							onClick={() =>
								setFilters({
									techStack: 'all',
									rate: 'all',
									experience: 'all',
									dept: 'all',
								})
							}
						>
							<SlidersHorizontal className="w-4 h-4" />
							초기화
						</button>

						<div className="flex gap-2 ml-auto">
							<Button
								variant="outline"
								onClick={handleCancel}
							>
								프로젝트 상세
							</Button>
						</div>
					</div>

					{isPending && <div className="text-center py-8 text-muted-foreground">프로젝트 정보를 불러오는 중...</div>}

					{isLoading && <div className="text-center py-8 text-muted-foreground">가용 인력을 불러오는 중...</div>}

					{error && <div className="text-center py-8 text-red-600">데이터를 불러오지 못했습니다.</div>}

					{!isLoading && !error && (
						<div className="bg-card rounded-xl border overflow-hidden">
							<div className="px-4 py-3 border-b bg-muted/30">
								<h3 className="font-semibold text-foreground text-sm">가용 인력 목록 (벤치 {benchMembers.length}명)</h3>
							</div>

							<table className="w-full text-sm">
								<thead className="bg-muted/50">
									<tr>
										<th className="text-left py-2.5 px-4 font-medium text-muted-foreground">선택</th>
										<th className="text-left py-2.5 px-4 font-medium text-muted-foreground">이름</th>
										<th className="text-left py-2.5 px-4 font-medium text-muted-foreground">부서</th>
										<th className="text-left py-2.5 px-4 font-medium text-muted-foreground">직무구분</th>
										<th className="text-left py-2.5 px-4 font-medium text-muted-foreground">직무</th>
										<th className="text-left py-2.5 px-4 font-medium text-muted-foreground">기술스택</th>
										<th className="text-left py-2.5 px-4 font-medium text-muted-foreground">현 투입률</th>
									</tr>
								</thead>

								<tbody>
									{benchMembers.length > 0 ? (
										benchMembers.map((member) => (
											<tr
												key={member.id}
												className={`border-t transition-colors ${
													selectedIds.includes(member.id) ? 'bg-brand-50 dark:bg-brand-900/20' : 'hover:bg-muted/20'
												}`}
											>
												<td className="py-2.5 px-4">
													<div
														className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
															selectedIds.includes(member.id)
																? 'bg-brand-600 border-brand-600'
																: 'border-slate-300 dark:border-slate-600'
														}`}
														onClick={() => toggleMemberSelection(member.id)}
													>
														{selectedIds.includes(member.id) && <CheckSquare className="w-3 h-3 text-white" />}
													</div>
												</td>

												<td className="py-2.5 px-4">
													<div className="flex items-center gap-2">
														<div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-700 dark:text-brand-300 font-semibold text-xs">
															{member.name?.[0] ?? '-'}
														</div>
														<span
															className={`font-medium ${
																selectedIds.includes(member.id)
																	? 'text-brand-700 dark:text-brand-300'
																	: 'text-foreground'
															}`}
														>
															{member.name}
														</span>
													</div>
												</td>

												<td className="py-2.5 px-4 text-muted-foreground">{member.department}</td>
												<td className="py-2.5 px-4 text-muted-foreground">{member.job_role_category_name || '-'}</td>
												<td className="py-2.5 px-4 text-muted-foreground">{member.job_role_name || '-'}</td>

												<td className="py-2.5 px-4 text-muted-foreground text-xs">
													{Array.isArray(member.skills) ? member.skills.join(', ') : '-'}
												</td>

												<td className="py-2.5 px-4 font-medium text-muted-foreground">0%</td>
											</tr>
										))
									) : (
										<tr>
											<td
												colSpan={5}
												className="py-8 text-center text-muted-foreground"
											>
												가용 인력이 없습니다.
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					)}
				</div>

				<div className="bg-card rounded-xl border p-4 h-fit">
					<h3 className="font-semibold text-foreground mb-4 text-sm">배정 설정</h3>

					<div className="mb-3 p-2.5 bg-brand-50 dark:bg-brand-900/20 rounded-lg">
						<p className="text-xs text-brand-600 dark:text-brand-400 font-medium mb-1">선택 인력:</p>
						<p className="text-sm text-brand-800 dark:text-brand-200 font-semibold">
							{selectedMembers.map((member) => member.name).join(', ') || '선택된 인력이 없습니다'}
						</p>
					</div>

					<div className="space-y-3">
						<div>
							<label className="block text-sm font-medium text-foreground mb-1">역할 *</label>
							<Select
								value={position}
								onValueChange={setPosition}
							>
								<SelectTrigger
									size="lg"
									className="w-full bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm"
								>
									<SelectValue placeholder="역할 선택" />
								</SelectTrigger>
								<SelectContent>
									{roles.map((role) => (
										<SelectItem
											key={role}
											value={role}
										>
											{role}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div>
							<label className="block text-sm font-medium text-foreground mb-1">투입률 *</label>
							<div className="flex gap-2">
								<button
									type="button"
									className="flex-1 py-2 text-sm border rounded-lg text-center bg-brand-600 text-white font-medium"
								>
									100%
								</button>
								<button
									type="button"
									className="flex-1 py-2 text-sm border rounded-lg text-center hover:bg-muted transition-colors text-muted-foreground"
								>
									50%
								</button>
							</div>
						</div>
						<div>
							<FormField
								name="startDate"
								label="투입 시작일"
								required
								error={errors.startDate}
							>
								<div
									className="relative"
									ref={startPickerRef}
								>
									<Button
										id="startDate"
										name="startDate"
										type="button"
										variant="outline"
										onClick={() => setOpenDatePicker((prev) => (prev === 'startDate' ? null : 'startDate'))}
										className={getFieldClassName(
											errors.startDate,
											'w-full justify-start text-left focus-visible:border-brand-500 focus-visible:ring-brand-500/20',
										)}
									>
										{startDate || '날짜 선택'}
									</Button>

									{openDatePicker === 'startDate' && (
										<div className="absolute top-full left-0 z-50 mt-2">
											<Calendar
												mode="single"
												selected={startDate ? new Date(startDate) : undefined}
												onSelect={(date) => {
													if (date) {
														const year = date.getFullYear();
														const month = String(date.getMonth() + 1).padStart(2, '0');
														const day = String(date.getDate()).padStart(2, '0');
														const formattedDate = `${year}-${month}-${day}`;

														setStartDate(formattedDate);
														setField('startDate', formattedDate);

														setErrors((prev) => ({
															...prev,
															startDate: undefined,
														}));
													}

													setOpenDatePicker(null);
												}}
												className="bg-popover text-popover-foreground border border-border rounded-md shadow-lg"
											/>
										</div>
									)}
								</div>
							</FormField>
						</div>
						<div>
							<FormField
								name="endDate"
								label="종료 예정일"
								error={errors.endDate}
								required
							>
								<div
									className="relative"
									ref={endPickerRef}
								>
									<Button
										id="endDate"
										name="endDate"
										type="button"
										variant="outline"
										onClick={() => setOpenDatePicker((prev) => (prev === 'endDate' ? null : 'endDate'))}
										className={getFieldClassName(
											errors.endDate,
											'w-full justify-start text-left focus-visible:border-brand-500 focus-visible:ring-brand-500/20',
										)}
									>
										{endDate || '날짜 선택'}
									</Button>

									{openDatePicker === 'endDate' && (
										<div className="absolute top-full left-0 z-50 mt-2">
											<Calendar
												mode="single"
												selected={endDate ? new Date(endDate) : undefined}
												onSelect={(date) => {
													if (date) {
														const year = date.getFullYear();
														const month = String(date.getMonth() + 1).padStart(2, '0');
														const day = String(date.getDate()).padStart(2, '0');
														const formattedDate = `${year}-${month}-${day}`;

														setEndDate(formattedDate);
														setField('endDate', formattedDate);
													}

													setOpenDatePicker(null);
												}}
												className="bg-popover text-popover-foreground border border-border rounded-md shadow-lg"
											/>
										</div>
									)}
								</div>
							</FormField>
						</div>
					</div>
					<div className="mt-4 pt-4 border-t">
						<p className="text-xs text-orange-600 dark:text-orange-400 mb-3">
							⚠ 배정 확정 시 투입 현황 자동 갱신 · 해당 직원 이메일 알림 발송
						</p>

						<div className="flex gap-2">
							<Button
								variant="outline"
								className="flex-1"
								size="sm"
								onClick={() => setSelectedIds([])}
							>
								초기화
							</Button>

							<Button
								className="flex-1"
								size="sm"
								disabled={isAssigning || selectedIds.length === 0}
								onClick={handleAssignConfirm}
							>
								{isAssigning ? '배정 중...' : '배정 확정'}
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
