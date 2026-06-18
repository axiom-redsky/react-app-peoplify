import type React from 'react';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router';
import { formatPhoneNumber, validateRequired, getFieldClassName } from '@/shared/lib/shadcn/js/common';
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
import { Plus, X } from 'lucide-react';
import { useApi } from '@axiom/hooks';
import { useAppAlert } from '@/shared/components/layout/default/AppAlertProvider';

const grades = ['사원', '대리', '과장', '차장', '부장', '이사'];
const statuses = [
	{ value: 'active', label: '재직' },
	{ value: 'on_leave', label: '휴직' },
	{ value: 'resigned', label: '퇴사' },
];
const skillSuggestions = ['Java', 'Spring Boot', 'React', 'Vue', 'Python', 'Oracle', 'MySQL', 'AWS', 'Docker', 'Git'];

// 수정 요청 body 타입
type TUpdateEmployee = {
	name: string;
	email: string;
	phone: string;
	department: string;
	position: string;
	hire_date: string;
	employment_status: string;
	resign_date?: string | null;
	skills?: string[];
};

// 조회 응답 타입
type TEmployeeDetail = TUpdateEmployee & {
	id: number;
	resign_date: string | null;
	skills: string[];
};

type TEmployeeResponse = {
	success: boolean;
	data: TEmployeeDetail;
};

type TDepartmentResponse = {
	data: { id: number; name: string }[];
	success: boolean;
};

const getCurrentQueryString = () => {
	const hash = window.location.hash;
	const queryString = hash.includes('?') ? hash.split('?')[1] : '';

	return queryString ? `?${queryString}` : '';
};

export default function EmployeeEditPage(): React.ReactNode {
	const { id } = useParams<{ id: string }>();
	const { data: departments } = useApi<TDepartmentResponse>('/api/departments');
	// 입력 필드 상태 관리
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [phone, setPhone] = useState('');
	const [hireDate, setHireDate] = useState('');
	const [department, setDepartment] = useState('');
	const [position, setPosition] = useState('');
	const [employmentStatus, setEmploymentStatus] = useState('active');
	const [resignDate, setResignDate] = useState('');
	const [skills, setSkills] = useState<string[]>([]);
	const [newSkillInput, setNewSkillInput] = useState('');

	const [errors, setErrors] = useState<Record<string, string>>({});
	const { openAlert } = useAppAlert();

	/** DATE PICKER */
	const [pickerOpen, setPickerOpen] = useState(false);
	const pickerRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const h = (e: MouseEvent): void => {
			if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setPickerOpen(false);
		};
		document.addEventListener('mousedown', h);
		return () => document.removeEventListener('mousedown', h);
	}, []);

	// 기존 데이터 조회 (GET)
	const {
		data: response,
		isPending: isLoading,
		error: loadError,
	} = useApi<TEmployeeResponse>(`/api/employees/${id}`, {
		params: { id },
	});

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

	// 조회 결과로 폼 초기화
	useEffect(() => {
		const emp = response?.data;
		if (!emp) return;

		setName(emp.name ?? '');
		setEmail(emp.email ?? '');
		setPhone(formatPhoneNumber(emp.phone ?? ''));
		setHireDate(emp.hire_date ? emp.hire_date.slice(0, 10) : '');
		setDepartment(emp.department ?? '');
		setPosition(emp.position ?? '');
		setEmploymentStatus(emp.employment_status ?? 'active');
		setResignDate(emp.resign_date ? emp.resign_date.slice(0, 10) : '');
		setSkills(emp.skills ?? []);
	}, [response]);

	// PUT API 호출
	const {
		mutate,
		isPending: isSubmitting,
		invalidateQueries,
	} = useApi<TUpdateEmployee, TUpdateEmployee>(`/api/employees/${id}`, {
		method: 'PUT',
		type: 'mutation',
	});

	// 스킬 추가 핸들러
	const handleAddSkill = (): void => {
		const trimmed = newSkillInput.trim();
		if (trimmed && !skills.includes(trimmed)) {
			setSkills([...skills, trimmed]);
			setNewSkillInput('');
		}
	};

	// 스킬 제거 핸들러
	const handleRemoveSkill = (skill: string): void => {
		setSkills(skills.filter((s) => s !== skill));
	};

	// 추천 스킬 추가
	const handleAddSuggestedSkill = (skill: string): void => {
		if (!skills.includes(skill)) {
			setSkills([...skills, skill]);
		}
	};

	// 퇴사 상태 여부
	const isResigned = employmentStatus === 'resigned';

	// 폼 제출 핸들러
	const handleSubmit = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();
		const values = {
			name,
			email,
			phone,
			hireDate,
			department,
			position,
		};

		const result = validateRequired(values, [
			{ key: 'name', message: '이름을 입력해주세요.' },
			{ key: 'email', message: '이메일을 입력해주세요.' },
			{ key: 'phone', message: '연락처를 입력해주세요.' },
			{ key: 'hireDate', message: '입사일을 선택해주세요.' },
			{ key: 'department', message: '부서를 선택해주세요.' },
			{ key: 'position', message: '직급을 선택해주세요.' },
		]);

		if (!result.isValid) {
			setErrors(result.errors as Record<string, string>);
			return;
		}

		setErrors({});

		// 퇴사 상태일 때 퇴사일 필수
		if (isResigned && !resignDate) {
			alert('퇴사 상태인 경우 퇴사일을 입력해주세요.');
			return;
		}
		// API 호출
		mutate(
			{
				name,
				email,
				phone: phone.replace(/\D/g, ''),
				department,
				position,
				hire_date: hireDate,
				employment_status: employmentStatus,
				// 퇴사 상태가 아니면 퇴사일은 null로 정리
				resign_date: isResigned ? resignDate || null : null,
				skills,
			},
			{
				onSuccess: async () => {
					// 목록 및 상세 캐시 무효화
					await invalidateQueries('/api/employees');
					await invalidateQueries(`/api/employees/${id}`);
					// 성공 후 상세 페이지로 이동
					$router.push(`/employee/employee-detail/${id}`);
				},
				onError: (error: any) => {
					const message = error?.response?.data?.message || error?.message || '직원 등록 중 오류가 발생했습니다.';

					openAlert({
						title: '등록 실패',
						message,
						confirmText: '확인',
					});
				},
			},
		);
	};

	// 로딩 중
	if (isLoading) {
		return (
			<div className="p-5">
				<PageHeader
					title="직원 수정"
					breadcrumb={[{ label: '직원관리', path: '/employees' }, { label: '로딩 중...' }]}
				/>
				<p className="text-sm text-gray-500">데이터를 불러오는 중…</p>
			</div>
		);
	}

	// 조회 에러
	if (loadError) {
		return (
			<div className="p-5">
				<PageHeader
					title="직원 수정"
					breadcrumb={[{ label: '직원관리', path: '/employees' }, { label: '에러 발생' }]}
				/>
				<p className="text-sm text-red-600">에러: {loadError.message}</p>
			</div>
		);
	}

	return (
		<div className="p-5">
			<PageHeader
				title="직원 수정"
				breadcrumb={[{ label: '직원관리', path: '/employees' }, { label: name || '직원 수정' }]}
			/>

			<div className="max-w-2xl w-full">
				{/* 기본정보 섹션 */}
				<div className="bg-card rounded-xl border p-5 mb-4">
					<h2 className="font-semibold text-foreground mb-4 text-sm flex items-center gap-2">
						<span className="w-5 h-5 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center">
							1
						</span>
						기본 정보
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<FormField
							name="name"
							label="이름"
							required
							error={errors.name}
						>
							<Input
								id="name"
								name="name"
								value={name}
								onChange={(e) => {
									setName(e.target.value);

									if (errors.name) {
										setErrors((prev) => ({ ...prev, name: '' }));
									}
								}}
								className={getFieldClassName(
									errors.name,
									'focus-visible:border-brand-500 focus-visible:ring-brand-500/20',
								)}
								placeholder="홍길동"
							/>
						</FormField>
						<FormField
							name="email"
							label="이메일"
							required
							error={errors.email}
						>
							<Input
								id="email"
								name="email"
								type="email"
								value={email}
								onChange={(e) => {
									setEmail(e.target.value);

									if (errors.email) {
										setErrors((prev) => ({ ...prev, email: '' }));
									}
								}}
								className={getFieldClassName(
									errors.email,
									'focus-visible:border-brand-500 focus-visible:ring-brand-500/20',
								)}
								placeholder="name@niccompany.co.kr"
							/>
						</FormField>

						<FormField
							name="phone"
							label="연락처"
							required
							error={errors.phone}
						>
							<Input
								id="phone"
								name="phone"
								value={phone}
								onChange={(e) => {
									setPhone(formatPhoneNumber(e.target.value));

									if (errors.phone) {
										setErrors((prev) => ({ ...prev, phone: '' }));
									}
								}}
								className={getFieldClassName(
									errors.phone,
									'focus-visible:border-brand-500 focus-visible:ring-brand-500/20',
								)}
								placeholder="010-0000-0000"
							/>
						</FormField>

						<FormField
							name="hireDate"
							label="입사일"
							required
							error={errors.hireDate}
						>
							<div
								ref={pickerRef}
								className="relative"
							>
								<Button
									id="hireDate"
									name="hireDate"
									type="button"
									variant="outline"
									onClick={() => setPickerOpen((v) => !v)}
									className={getFieldClassName(
										errors.hireDate,
										'w-full justify-start text-left focus-visible:border-brand-500 focus-visible:ring-brand-500/20',
									)}
								>
									{hireDate || '날짜 선택'}
								</Button>

								{pickerOpen && (
									<Calendar
										mode="single"
										selected={hireDate ? new Date(hireDate) : undefined}
										onSelect={(date) => {
											if (date) {
												const year = date.getFullYear();
												const month = String(date.getMonth() + 1).padStart(2, '0');
												const day = String(date.getDate()).padStart(2, '0');
												const formattedDate = `${year}-${month}-${day}`;

												setHireDate(formattedDate);

												if (errors.hireDate) {
													setErrors((prev) => ({ ...prev, hireDate: '' }));
												}
											}

											setPickerOpen(false);
										}}
										className="absolute top-full left-0 z-10 mt-2 bg-popover text-popover-foreground border border-border rounded-md shadow-lg"
									/>
								)}
							</div>
						</FormField>

						<FormField
							name="department"
							label="부서"
							required
							error={errors.department}
						>
							<Select
								value={department}
								onValueChange={(value) => {
									setDepartment(value);

									if (errors.department) {
										setErrors((prev) => ({ ...prev, department: '' }));
									}
								}}
							>
								<SelectTrigger
									id="department"
									name="department"
									size="lg"
									className={getFieldClassName(
										errors.department,
										'w-full focus-visible:border-brand-500 focus-visible:ring-brand-500/20',
									)}
								>
									<SelectValue placeholder="부서 선택" />
								</SelectTrigger>

								<SelectContent
									position="popper"
									sideOffset={4}
									className="z-[9999]"
								>
									{departments?.data?.map((dept) => (
										<SelectItem
											key={dept.id}
											value={dept.name}
										>
											{dept.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</FormField>

						<FormField
							name="position"
							label="직급"
							required
							error={errors.position}
						>
							<Select
								value={position}
								onValueChange={(value) => {
									setPosition(value);

									if (errors.position) {
										setErrors((prev) => ({ ...prev, position: '' }));
									}
								}}
							>
								<SelectTrigger
									id="position"
									name="position"
									size="lg"
									className={getFieldClassName(
										errors.position,
										'w-full focus-visible:border-brand-500 focus-visible:ring-brand-500/20',
									)}
								>
									<SelectValue placeholder="직급 선택" />
								</SelectTrigger>

								<SelectContent
									position="popper"
									sideOffset={4}
									className="z-[9999]"
								>
									{grades.map((g) => (
										<SelectItem
											key={g}
											value={g}
										>
											{g}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</FormField>
					</div>
				</div>

				{/* 재직 상태 섹션 */}
				<div className="bg-card rounded-xl border p-5 mb-4">
					<h2 className="font-semibold text-foreground mb-4 text-sm flex items-center gap-2">
						<span className="w-5 h-5 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center">
							2
						</span>
						재직 상태
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-foreground mb-1">재직 상태 *</label>
							<Select
								value={employmentStatus}
								onValueChange={(value) => {
									setEmploymentStatus(value);

									if (value === 'resigned' && !resignDate) {
										const today = new Date().toISOString().slice(0, 10);
										setResignDate(today);
									}
								}}
							>
								<SelectTrigger
									size="lg"
									className="w-full bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm"
								>
									<SelectValue placeholder="상태 선택" />
								</SelectTrigger>
								<SelectContent>
									{statuses.map((s) => (
										<SelectItem
											key={s.value}
											value={s.value}
										>
											{s.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						{/* 퇴사 상태일 때만 퇴사일 노출 */}
						{isResigned && (
							<div>
								<label className="block text-sm font-medium text-foreground mb-1">퇴사일 *</label>
								<Input
									type="date"
									value={resignDate}
									onChange={(e) => setResignDate(e.target.value)}
									min={hireDate || undefined}
									className="h-9 bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm focus-visible:border-brand-500 focus-visible:ring-brand-500/20"
									readOnly={!isResigned}
								/>
							</div>
						)}
					</div>
				</div>

				{/* 기술스택 섹션 */}
				<div className="bg-card rounded-xl border p-5 mb-4">
					<h2 className="font-semibold text-foreground mb-4 text-sm flex items-center gap-2">
						<span className="w-5 h-5 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center">
							3
						</span>
						기술스택
					</h2>

					{/* 선택된 스킬 태그 */}
					<div className="flex flex-wrap gap-2 mb-3 min-h-10 p-2 border border-dashed rounded-lg bg-muted/20">
						{skills.map((skill) => (
							<span
								key={skill}
								className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-sm font-medium"
							>
								{skill}
								<Button
									variant="ghost"
									size="icon-xs"
									className="rounded-full hover:bg-brand-200/50 dark:hover:bg-brand-800/50 hover:text-brand-900 dark:hover:text-brand-100"
									onClick={() => handleRemoveSkill(skill)}
								>
									<X />
								</Button>
							</span>
						))}
					</div>

					{/* 스킬 추가 입력 */}
					<div className="flex gap-2 mb-3">
						<Input
							value={newSkillInput}
							onChange={(e) => setNewSkillInput(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									e.preventDefault();
									handleAddSkill();
								}
							}}
							className="flex-1 h-9 bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm focus-visible:border-brand-500 focus-visible:ring-brand-500/20"
							placeholder="기술스택 직접 입력..."
						/>
						<Button
							size="sm"
							variant="outline"
							onClick={handleAddSkill}
						>
							<Plus className="w-4 h-4" />
						</Button>
					</div>

					{/* 추천 스킬 */}
					<div>
						<p className="text-xs text-muted-foreground mb-2">자주 사용되는 기술스택:</p>
						<div className="flex flex-wrap gap-1.5">
							{skillSuggestions.map((skill) => (
								<button
									key={skill}
									className="px-2.5 py-1 text-xs border rounded-full hover:border-brand-400 hover:text-brand-600 dark:hover:border-brand-500 dark:hover:text-brand-400 transition-colors text-muted-foreground border-slate-300 dark:border-slate-600"
									onClick={() => handleAddSuggestedSkill(skill)}
								>
									+ {skill}
								</button>
							))}
						</div>
					</div>
				</div>

				{/* 액션 버튼 */}
				<div className="flex justify-end gap-3">
					<Button
						variant="outline"
						onClick={() => {
	const queryString = getCurrentQueryString();

	$router.push(`/employee/employee-detail/${id}${queryString}`);
}}
					>
						취소
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={isSubmitting}
					>
						{isSubmitting ? '저장 중...' : '저장'}
					</Button>
				</div>
			</div>
		</div>
	);
}
