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

interface BenchMember {
	id: number;
	name: string;
	department: string;
	position: string;
	hire_date: string;
	skills: string[];
}

interface FilterState {
	techStack: string;
	rate: string;
	experience: string;
	dept: string;
}

type TBenchMemberListResponse = {
	success: boolean;
	data: BenchMember[];
};

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
};

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

type TProjectDetailResponse = {
	success: boolean;
	data: TProjectDetail;
};

type TAssignMemberRequest = {
	project_id: string;
	employee_id: number[];
	role: string;
	rate_pct: number;
	start_date: string;
	end_date: string | null;
};

type TAssignRegisterRequest = {
	startDate: string;
	endDate: string;
};
type TAssignRegisterErrors = Partial<Record<keyof TAssignRegisterRequest, string>>;
type TOpenDatePicker = 'startDate' | 'endDate' | null;
const roles = ['PM', 'PL', '개발', 'QA', '디자인', 'BA'];

export default function ProjectAssignPage(): React.ReactNode {
	const { id } = useParams<{ id: string }>();
	const { openAlert } = useAppAlert();

	const PROJECTS_ENDPOINT = `/api/projects/${id}` as const;

	const [openDatePicker, setOpenDatePicker] = useState<TOpenDatePicker>(null);
	const startPickerRef = useRef<HTMLDivElement>(null);
	const endPickerRef = useRef<HTMLDivElement>(null);
	const [project, setProject] = useState<TProjectDetailData | undefined>(undefined);
	const [assignments, setAssignments] = useState<TProjectAssignment[]>([]);
	const [client, setClient] = useState<string>('');

	const [filters, setFilters] = useState<FilterState>({
		techStack: 'all',
		rate: 'all',
		experience: 'all',
		dept: 'all',
	});

	const [selectedIds, setSelectedIds] = useState<number[]>([]);
	const [benchMembers, setBenchMembers] = useState<BenchMember[]>([]);

	const [position, setPosition] = useState('');
	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');

	const isLockedRef = useRef(false);

	const { data, isPending } = useApi<TProjectDetailResponse>(PROJECTS_ENDPOINT);

	const { data: benchResp, isLoading, error } = useApi<TBenchMemberListResponse>('/api/dashboard/bench-members');

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

	const [errors, setErrors] = useState<TAssignRegisterErrors>({});
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

	const {
		mutate: assignMembers,
		isPending: isAssigning,
		invalidateQueries,
	} = useApi<TAssignMemberRequest>('/api/assignments', {
		method: 'POST',
		type: 'mutation',
	});

	useEffect(() => {
		if (data?.data) {
			setProject(data.data);
			setAssignments(data.data.assignments ?? []);
			setClient(data.data.client);
		}
	}, [data]);

	useEffect(() => {
		if (benchResp?.data) {
			setBenchMembers(benchResp.data);
		}
	}, [benchResp]);

	useEffect(() => {
		// params 변경 시 useApi가 자동 재요청되는 구조라면 비워둬도 됨
	}, [filters]);

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

	const toggleMemberSelection = (employeeId: number) => {
		setSelectedIds((prev) =>
			prev.includes(employeeId) ? prev.filter((id) => id !== employeeId) : [...prev, employeeId],
		);
	};

	const validateForm = (): boolean => {
		const requiredResult = validateRequired(
			{
				startDate: startDate,
				end_date: endDate,
			},
			[{ key: 'startDate', message: '투입 시작일을 선택해주세요.' }],
		);

		const nextErrors: TAssignRegisterErrors = {
			...(requiredResult.errors as TAssignRegisterErrors),
		};

		if (endDate !== '') {
			if (startDate > endDate) {
				nextErrors.endDate = '종료일은 시작일보다 빠를 수 없습니다.';
			}
		}
		setErrors(nextErrors);
		focusFirstError(nextErrors);

		return Object.keys(nextErrors).length === 0;
	};

	const handleFilterChange = (key: keyof FilterState, value: string) => {
		setFilters((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	const handleCancel = (): void => {
		$router.back();
	};

	const handleAssignConfirm = () => {
		debugger;
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
