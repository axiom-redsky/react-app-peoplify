import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import PageHeader from '@/shared/components/ui/PageHeader';
import ProjectStatus from '@/shared/components/ui/ProjectStatusBadge';
import { useApi } from '@axiom/hooks';
import { useAppAlert } from '@/shared/components/layout/default/AppAlertProvider';
import { validateRequired, getFieldClassName } from '@/shared/lib/shadcn/js/common';
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
import { Save, Plus, X } from 'lucide-react';

type TProjectRegisterRequest = {
	name: string;
	client: string;
	start_date: string;
	end_date: string | null;
	status: string;
	progress_pct: number;
	description: string;
	tech_stack: string[];
};

type TProjectRegisterResponse = {
	success: boolean;
	data?: {
		id: number;
		name: string;
		client: string;
		start_date: string;
		end_date: string | null;
		status: string;
		progress_pct: number;
		description: string;
		tech_stack: string[];
		created_at: string;
		updated_at: string;
	};
	message?: string;
};

type TProjectRegisterErrors = Partial<Record<keyof TProjectRegisterRequest, string>>;
type ProjectStatusType = 'planned' | 'active' | 'complete' | 'hold';

const statusOptions = [
	{ label: '예정', value: 'planned' },
	{ label: '진행중', value: 'active' },
	{ label: '완료', value: 'complete' },
	{ label: '보류', value: 'hold' },
];
const skillSuggestions = ['Java', 'Spring Boot', 'React', 'Vue', 'Python', 'Oracle', 'MySQL', 'AWS', 'Docker', 'Git'];

const fieldFocusClassName = 'focus-visible:border-brand-500 focus-visible:ring-brand-500/20';

export default function ProjectRegisterPage(): React.ReactNode {
	// POST API 호출
	const {
		mutate,
		isPending: isSubmitting,
		invalidateQueries,
	} = useApi<TProjectRegisterRequest, TProjectRegisterResponse>('/api/projects', {
		method: 'POST',
		type: 'mutation',
	});

	const [form, setForm] = useState<TProjectRegisterRequest>({
		name: '',
		client: '',
		start_date: '',
		end_date: null,
		status: 'planned',
		progress_pct: 0,
		description: '',
		tech_stack: [],
	});
	const [start_date, setStart_date] = useState('');
	const [end_date, setEnd_date] = useState('');
	const [skills, setSkills] = useState<string[]>(['Java', 'Spring Boot', 'React']);
	const [newSkillInput, setNewSkillInput] = useState('');
	type TOpenDatePicker = 'start_date' | 'end_date' | false;
	const [openDatePicker, setOpenDatePicker] = useState<TOpenDatePicker>(false);
	const startPickerRef = useRef<HTMLDivElement>(null);
	const endPickerRef = useRef<HTMLDivElement>(null);

	const { openAlert } = useAppAlert();

	useEffect(() => {
		const handleClickOutside = (e: PointerEvent): void => {
			const target = e.target as Node;

			const isStartInside = startPickerRef.current?.contains(target);
			const isEndInside = endPickerRef.current?.contains(target);

			if (!isStartInside && !isEndInside) {
				setOpenDatePicker(false);
			}
		};

		document.addEventListener('pointerdown', handleClickOutside);

		return () => {
			document.removeEventListener('pointerdown', handleClickOutside);
		};
	}, []);

	const [techStackText, setTechStackText] = useState<string>('');
	const [errors, setErrors] = useState<TProjectRegisterErrors>({});

	const setField = <K extends keyof TProjectRegisterRequest>(key: K, value: TProjectRegisterRequest[K]): void => {
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

	const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const value = e.target.value;

		if (value === '') {
			setField('progress_pct', 0);
			return;
		}

		const onlyNumber = value.replace(/[^0-9]/g, '');
		const normalized = onlyNumber.replace(/^0+/, '') || '0';
		const progress = Math.min(100, Math.max(0, Number(normalized)));

		setField('progress_pct', progress);
	};

	const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>): void => {
		const rect = e.currentTarget.getBoundingClientRect();
		const clickX = e.clientX - rect.left;
		const ratio = clickX / rect.width;
		const progress = Math.round(ratio * 100);
		const normalizedProgress = Math.min(100, Math.max(0, progress));

		setField('progress_pct', normalizedProgress);
	};

	const handleTechStackChange = (value: string): void => {
		setTechStackText(value);

		setForm((prev) => ({
			...prev,
			tech_stack: value
				.split(',')
				.map((item) => item.trim())
				.filter(Boolean),
		}));

		if (errors.tech_stack) {
			setErrors((prev) => ({
				...prev,
				tech_stack: undefined,
			}));
		}
	};

	const focusFirstError = (nextErrors: TProjectRegisterErrors): void => {
		const firstErrorKey = Object.keys(nextErrors)[0];

		if (!firstErrorKey) return;

		const target = document.querySelector(`[name="${firstErrorKey}"]`) as
			| HTMLInputElement
			| HTMLTextAreaElement
			| HTMLButtonElement
			| null;

		target?.focus();
	};

	const validateForm = (): boolean => {
		const requiredResult = validateRequired(
			{
				name: form.name,
				client: form.client,
				start_date: form.start_date,
				end_date: form.end_date,
				status: form.status,
			},
			[
				{ key: 'name', message: '프로젝트명을 입력해주세요.' },
				{ key: 'client', message: '고객사를 입력해주세요.' },
				{ key: 'start_date', message: '시작일을 선택해주세요.' },
				{ key: 'end_date', message: '종료일을 선택해주세요.' },
				{ key: 'status', message: '상태를 선택해주세요.' },
			],
		);

		const nextErrors: TProjectRegisterErrors = {
			...(requiredResult.errors as TProjectRegisterErrors),
		};

		if (form.progress_pct < 0 || form.progress_pct > 100) {
			nextErrors.progress_pct = '진척도는 0부터 100 사이로 입력해주세요.';
		}

		if (form.start_date && form.end_date && form.start_date > form.end_date) {
			nextErrors.end_date = '종료일은 시작일보다 빠를 수 없습니다.';
		}

		setErrors(nextErrors);
		focusFirstError(nextErrors);

		return Object.keys(nextErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();

		if (!validateForm()) return;

		mutate(
			{
				name: form.name.trim(),
				client: form.client.trim(),
				start_date: form.start_date,
				end_date: form.end_date || null,
				status: form.status,
				progress_pct: form.progress_pct,
				description: form.description.trim(),
				tech_stack: skills,
			},
			{
				onSuccess: async () => {
					await invalidateQueries('/api/projects');

					$router.push('/project/project-list');
				},
				onError: (error: any) => {
					const message = error?.response?.data?.message || error?.message || '프로젝트 등록 중 오류가 발생했습니다.';

					openAlert({
						title: '등록 실패',
						message,
						confirmText: '확인',
					});
				},
			},
		);
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

		// 스킬 추가 핸들러
	const handleAddSkill = (): void => {
		const trimmed = newSkillInput.trim();
		if (trimmed && !skills.includes(trimmed)) {
			setSkills([...skills, trimmed]);
			setNewSkillInput('');
		}
	};

	const handleCancel = (): void => {
		$router.back();
	};

	return (
		<div className="p-5">
			<PageHeader
				title="프로젝트 등록"
				breadcrumb={[{ label: '프로젝트', path: '/projects' }, { label: '프로젝트 등록' }]}
				actions={
					<div className="flex gap-2">
						<Button
							variant="outline"
							onClick={handleCancel}
							disabled={isSubmitting}
						>
							<X className="w-4 h-4 mr-1.5" />
							취소
						</Button>

						<Button
							size="lg"
							onClick={handleSubmit}
							disabled={isSubmitting}
						>
							<Save className="w-4 h-4 mr-1.5" />
							{isSubmitting ? '등록 중...' : '등록'}
						</Button>
					</div>
				}
			/>

			<form>
				<div className="bg-card rounded-xl border p-5 mb-4">
					<h2 className="font-semibold text-foreground mb-4 text-sm flex items-center gap-2">
						<span className="w-5 h-5 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center">
							1
						</span>
						기본 정보
					</h2>

					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
						<FormField
							name="name"
							label="프로젝트명"
							required
							error={errors.name}
						>
							<Input
								id="name"
								name="name"
								value={form.name}
								onChange={(e) => setField('name', e.target.value)}
								placeholder="프로젝트명을 입력하세요"
								className={getFieldClassName(errors.name, fieldFocusClassName)}
							/>
						</FormField>

						<FormField
							name="client"
							label="고객사"
							required
							error={errors.client}
						>
							<Input
								id="client"
								name="client"
								value={form.client}
								onChange={(e) => setField('client', e.target.value)}
								placeholder="고객사를 입력하세요"
								className={getFieldClassName(errors.client, fieldFocusClassName)}
							/>
						</FormField>

						<FormField
							name="start_date"
							label="시작일"
							required
							error={errors.start_date}
						>
							<div
								className="relative"
								ref={startPickerRef}
							>
								<Button
									id="start_date"
									name="start_date"
									type="button"
									variant="outline"
									onClick={() => setOpenDatePicker((prev) => (prev === 'start_date' ? false : 'start_date'))}
									className={getFieldClassName(
										errors.start_date,
										'w-full justify-start text-left focus-visible:border-brand-500 focus-visible:ring-brand-500/20',
									)}
								>
									{start_date || '날짜 선택'}
								</Button>

								{openDatePicker === 'start_date' && (
									<div className="absolute top-full left-0 z-50 mt-2">
										<Calendar
											mode="single"
											selected={start_date ? new Date(start_date) : undefined}
											onSelect={(date) => {
												if (date) {
													const year = date.getFullYear();
													const month = String(date.getMonth() + 1).padStart(2, '0');
													const day = String(date.getDate()).padStart(2, '0');
													const formattedDate = `${year}-${month}-${day}`;

													setStart_date(formattedDate);
													setField('start_date', formattedDate);
												}

												setOpenDatePicker(false);
											}}
											className="bg-popover text-popover-foreground border border-border rounded-md shadow-lg"
										/>
									</div>
								)}
							</div>
						</FormField>

						<FormField
							name="end_date"
							label="종료일"
							required
							error={errors.end_date}
						>
							<div
								className="relative"
								ref={endPickerRef}
							>
								<Button
									id="end_date"
									name="end_date"
									type="button"
									variant="outline"
									onClick={() => setOpenDatePicker((prev) => (prev === 'end_date' ? false : 'end_date'))}
									className={getFieldClassName(
										errors.end_date,
										'w-full justify-start text-left focus-visible:border-brand-500 focus-visible:ring-brand-500/20',
									)}
								>
									{end_date || '날짜 선택'}
								</Button>

								{openDatePicker === 'end_date' && (
									<div className="absolute top-full left-0 z-50 mt-2">
										<Calendar
											mode="single"
											selected={end_date ? new Date(end_date) : undefined}
											onSelect={(date) => {
												if (date) {
													const year = date.getFullYear();
													const month = String(date.getMonth() + 1).padStart(2, '0');
													const day = String(date.getDate()).padStart(2, '0');
													const formattedDate = `${year}-${month}-${day}`;

													setEnd_date(formattedDate);
													setField('end_date', formattedDate);
												}

												setOpenDatePicker(false);
											}}
											className="bg-popover text-popover-foreground border border-border rounded-md shadow-lg"
										/>
									</div>
								)}
							</div>
						</FormField>

						<FormField
							name="status"
							label="상태"
							required
							error={errors.status}
						>
							<Select
								value={form.status}
								onValueChange={(value) => setField('status', value)}
							>
								<SelectTrigger
									id="status"
									name="status"
									size="lg"
									className={getFieldClassName(errors.status, `w-full ${fieldFocusClassName}`)}
								>
									<SelectValue placeholder="상태 선택" />
								</SelectTrigger>

								<SelectContent
									position="popper"
									sideOffset={4}
									className="z-[9999]"
								>
									{statusOptions.map((status) => (
										<SelectItem
											key={status.value}
											value={status.value}
										>
											{status.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</FormField>

						<FormField
							name="progress_pct"
							label="진척도"
							error={errors.progress_pct}
						>
							<div className="flex items-center gap-2">
								<Input
									id="progress_pct"
									name="progress_pct"
									type="number"
									min={0}
									max={100}
									value={form.progress_pct}
									onChange={handleProgressChange}
									className={getFieldClassName(errors.progress_pct, fieldFocusClassName)}
								/>

								<span className="text-sm font-semibold text-brand-600">%</span>
							</div>
						</FormField>

						<div className="sm:col-span-2 lg:col-span-4">
							<FormField
								name="description"
								label="프로젝트 설명"
								error={errors.description}
							>
								<textarea
									id="description"
									name="description"
									value={form.description}
									onChange={(e) => setField('description', e.target.value)}
									placeholder="프로젝트 설명을 입력하세요"
									rows={4}
									className={`w-full min-h-[96px] resize-none rounded-md border px-3 py-2 text-sm
															bg-card text-foreground placeholder:text-muted-foreground
															outline-none transition-colors
															focus:ring-2 focus:ring-brand-500
															${errors.description ? 'border-red-500' : 'border-border'}`}
								/>
							</FormField>
						</div>
					</div>

					<div>
						<div className="flex justify-between text-sm mb-1">
							<span className="text-muted-foreground">현재 진척도</span>
							<span className="font-semibold text-brand-600">{form.progress_pct}%</span>
						</div>

						<div
							role="button"
							tabIndex={0}
							onClick={handleProgressBarClick}
							onKeyDown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
								}
							}}
							className="w-full h-2.5 bg-muted rounded-full overflow-hidden cursor-pointer"
						>
							<div
								className="h-full bg-brand-500 rounded-full transition-all duration-300"
								style={{ width: `${form.progress_pct}%` }}
							/>
						</div>

						<div className="flex justify-between text-xs text-muted-foreground mt-2">
							<span>0%</span>
							<span className="text-brand-600">{form.progress_pct}%</span>
							<span>100%</span>
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
				</div>

				<div className="bg-card rounded-xl border p-4 mb-4">
					<h3 className="font-semibold text-foreground text-sm mb-3">등록 정보 미리보기</h3>

					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						<div>
							<p className="text-xs text-muted-foreground mb-0.5">프로젝트명</p>
							<p className="font-semibold text-foreground">{form.name || '-'}</p>
						</div>

						<div>
							<p className="text-xs text-muted-foreground mb-0.5">고객사</p>
							<p className="font-semibold text-foreground">{form.client || '-'}</p>
						</div>

						<div>
							<p className="text-xs text-muted-foreground mb-0.5">프로젝트 기간</p>
							<p className="font-semibold text-foreground">
								{form.start_date && form.end_date
									? `${form.start_date} ~ ${form.end_date}`
									: form.start_date || form.end_date || '-'}
							</p>
						</div>

						<div>
							<p className="text-xs text-muted-foreground mb-0.5">상태</p>
							<ProjectStatus status={form.status as ProjectStatusType} />
						</div>

						<div>
							<p className="text-xs text-muted-foreground mb-0.5">진척도</p>
							<p className="font-semibold text-foreground">{form.progress_pct}%</p>
						</div>

						<div className="sm:col-span-2 lg:col-span-3">
							<p className="text-xs text-muted-foreground mb-0.5">프로젝트 설명</p>
							<p className="text-sm text-foreground">{form.description || '-'}</p>
						</div>
					</div>
				</div>
			</form>
		</div>
	);
}
