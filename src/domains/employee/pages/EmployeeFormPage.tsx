import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import {
	Button,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Calendar,
} from '@axiom/components/ui';
import PageHeader from '@/shared/components/ui/PageHeader';
import { Plus, X } from 'lucide-react';
import { useApi } from '@axiom/hooks';

const grades = ['사원', '대리', '과장', '차장', '부장', '이사'];
const skillSuggestions = ['Java', 'Spring Boot', 'React', 'Vue', 'Python', 'Oracle', 'MySQL', 'AWS', 'Docker', 'Git'];

// 부서 목록 API 호출

type TCreateEmployee = {
	name: string;
	email: string;
	phone: string;
	department: string;
	position: string;
	hire_date: string;
	employment_status?: string;
	skills?: string[];
};

type TDepartmentResponse = {
	data: { id: number; name: string }[];
	success: boolean;
};

export default function EmployeeFormPage(): React.ReactNode {
	const { data: departments } = useApi<TDepartmentResponse>('/api/departments');
	// 입력 필드 상태 관리
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [phone, setPhone] = useState('');
	const [hireDate, setHireDate] = useState('');
	const [department, setDepartment] = useState('');
	const [position, setPosition] = useState('');
	const [skills, setSkills] = useState<string[]>(['Java', 'Spring Boot', 'React']);
	const [newSkillInput, setNewSkillInput] = useState('');

	// POST API 호출
	const {
		mutate,
		isPending: isSubmitting,
		//data: createResult,
		error: createError,
		//reset: resetMutation,
		invalidateQueries,
	} = useApi<TCreateEmployee, TCreateEmployee>('/api/employees', {
		method: 'POST',
		type: 'mutation',
	});
	const [pickerOpen, setPickerOpen] = useState(false);
	const pickerRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const h = (e: MouseEvent): void => {
			if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setPickerOpen(false);
		};
		document.addEventListener('mousedown', h);
		return () => document.removeEventListener('mousedown', h);
	}, []);

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

	// 폼 제출 핸들러
	const handleSubmit = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();

		// 필수 필드 검증
		if (!name || !email || !phone || !hireDate || !department || !position) {
			alert('모든 필수 항목을 입력해주세요.');
			return;
		}

		// API 호출
		mutate(
			{
				name,
				email,
				phone,
				department,
				position,
				hire_date: hireDate,
				employment_status: 'active',
				skills,
			},
			{
				onSuccess: async () => {
					// 목록 캐시 무효화
					await invalidateQueries('/api/employees');
					// 성공 후 직원 목록 페이지로 이동
					$router.push('/employee/employee-list');
				},
				onError: (error) => {
					console.error('직원 등록 실패:', error.message);
				},
			},
		);
	};

	return (
		<div className="p-5">
			<PageHeader
				title="직원 등록"
				breadcrumb={[{ label: '직원관리', path: '/employees' }, { label: '직원 등록' }]}
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
						<div>
							<label className="block text-sm font-medium text-foreground mb-1">이름 *</label>
							<Input
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="h-9 bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm focus-visible:border-brand-500 focus-visible:ring-brand-500/20"
								placeholder="홍길동"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-foreground mb-1">이메일 *</label>
							<Input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="h-9 bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm focus-visible:border-brand-500 focus-visible:ring-brand-500/20"
								placeholder="name@niccompany.co.kr"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-foreground mb-1">연락처 *</label>
							<Input
								value={phone}
								onChange={(e) => setPhone(e.target.value)}
								className="h-9 bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm focus-visible:border-brand-500 focus-visible:ring-brand-500/20"
								placeholder="010-0000-0000"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-foreground mb-1">입사일 *</label>
							<div
								ref={pickerRef}
								className="relative"
							>
								<Button
									variant="outline"
									onClick={() => setPickerOpen((v) => !v)}
									className="h-9 bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm focus-visible:border-brand-500 focus-visible:ring-brand-500/20 w-full justify-start text-left"
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
											}
											setPickerOpen(false);
										}}
										className="absolute top-full left-0 z-10 mt-2 bg-popover text-popover-foreground border border-border rounded-md shadow-lg"
									/>
								)}
							</div>
						</div>
						<div>
							<label className="block text-sm font-medium text-foreground mb-1">부서 *</label>
							<Select
								value={department}
								onValueChange={setDepartment}
							>
								<SelectTrigger
									size="lg"
									className="w-full bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm"
								>
									<SelectValue placeholder="부서 선택" />
								</SelectTrigger>
								<SelectContent>
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
						</div>
						<div>
							<label className="block text-sm font-medium text-foreground mb-1">직급 *</label>
							<Select
								value={position}
								onValueChange={setPosition}
							>
								<SelectTrigger
									size="lg"
									className="w-full bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm"
								>
									<SelectValue placeholder="직급 선택" />
								</SelectTrigger>
								<SelectContent>
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
						</div>
					</div>
				</div>

				{/* 기술스택 섹션 */}
				<div className="bg-card rounded-xl border p-5 mb-4">
					<h2 className="font-semibold text-foreground mb-4 text-sm flex items-center gap-2">
						<span className="w-5 h-5 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center">
							2
						</span>
						기술스택
						<span className="text-xs font-normal text-brand-600">★ 신규</span>
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

				{/* 에러 메시지 */}
				{createError && (
					<div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
						<p className="text-sm text-red-600 dark:text-red-400">{createError.message}</p>
					</div>
				)}

				{/* 액션 버튼 */}
				<div className="flex justify-end gap-3">
					<Button
						variant="outline"
						onClick={() => $router.back()}
					>
						취소
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={isSubmitting}
					>
						{isSubmitting ? '등록 중...' : '직원 등록'}
					</Button>
				</div>
			</div>
		</div>
	);
}
