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

// 프로젝트 등록 API에 전달할 요청 데이터 타입
type TProjectRegisterRequest = {
	name: string; // 프로젝트명
	client: string; // 고객사명
	start_date: string; // 프로젝트 시작일(YYYY-MM-DD)
	end_date: string | null; // 프로젝트 종료일(미입력 시 null)
	status: string; // 프로젝트 상태 코드(planned, active, complete, hold)
	progress_pct: number; // 프로젝트 진척도(0~100)
	description: string; // 프로젝트 설명
	tech_stack: string[]; // 프로젝트 기술스택 목록
};

// 프로젝트 등록 API 응답 타입
type TProjectRegisterResponse = {
	success: boolean; // API 처리 성공 여부
	data?: {
		id: number; // 등록된 프로젝트 ID
		name: string; // 프로젝트명
		client: string; // 고객사명
		start_date: string; // 프로젝트 시작일
		end_date: string | null; // 프로젝트 종료일
		status: string; // 프로젝트 상태 코드
		progress_pct: number; // 프로젝트 진척도
		description: string; // 프로젝트 설명
		tech_stack: string[]; // 기술스택 목록
		created_at: string; // 생성 일시
		updated_at: string; // 수정 일시
	};
	message?: string; // 실패 또는 안내 메시지
};

// 프로젝트 등록 폼의 필드별 검증 오류 메시지 타입
type TProjectRegisterErrors = Partial<Record<keyof TProjectRegisterRequest, string>>;

// 프로젝트 상태 배지에서 허용하는 상태 코드 타입
type ProjectStatusType = 'planned' | 'active' | 'complete' | 'hold';

// 프로젝트 상태 Select 박스에 표시할 상태 옵션 목록
const statusOptions = [
	{ label: '예정', value: 'planned' },
	{ label: '진행중', value: 'active' },
	{ label: '완료', value: 'complete' },
	{ label: '보류', value: 'hold' },
];

// 기술스택 입력 영역에서 추천 버튼으로 제공할 기본 기술 목록
const skillSuggestions = ['Java', 'Spring Boot', 'React', 'Vue', 'Python', 'Oracle', 'MySQL', 'AWS', 'Docker', 'Git'];

// 입력 필드 포커스 시 공통으로 적용할 브랜드 컬러 클래스
const fieldFocusClassName = 'focus-visible:border-brand-500 focus-visible:ring-brand-500/20';

// 프로젝트 신규 등록 화면 컴포넌트
export default function ProjectRegisterPage(): React.ReactNode {
	// 프로젝트 등록 POST API 호출 훅
	const {
		mutate,
		isPending: isSubmitting,
		invalidateQueries,
	} = useApi<TProjectRegisterRequest, TProjectRegisterResponse>('/api/projects', {
		method: 'POST',
		type: 'mutation',
	});

	// 프로젝트 등록 폼 전체 입력값 상태
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

	// 시작일 버튼에 표시할 날짜 문자열 상태
	const [start_date, setStart_date] = useState('');

	// 종료일 버튼에 표시할 날짜 문자열 상태
	const [end_date, setEnd_date] = useState('');

	// 현재 선택된 기술스택 목록 상태
	const [skills, setSkills] = useState<string[]>(['Java', 'Spring Boot', 'React']);

	// 직접 입력 중인 신규 기술스택 문자열 상태
	const [newSkillInput, setNewSkillInput] = useState('');

	// 현재 열려 있는 날짜 선택기 구분 타입
	type TOpenDatePicker = 'start_date' | 'end_date' | false;

	// 시작일/종료일 캘린더 중 현재 열려 있는 항목 상태
	const [openDatePicker, setOpenDatePicker] = useState<TOpenDatePicker>(false);

	// 시작일 캘린더 외부 클릭 감지를 위한 DOM 참조
	const startPickerRef = useRef<HTMLDivElement>(null);

	// 종료일 캘린더 외부 클릭 감지를 위한 DOM 참조
	const endPickerRef = useRef<HTMLDivElement>(null);

	// 공통 알림 팝업 호출 함수
	const { openAlert } = useAppAlert();

	// 날짜 선택기 영역 바깥을 클릭하면 열린 캘린더를 닫는다.
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

	// 콤마 구분 문자열 방식의 기술스택 입력값 상태
	const [techStackText, setTechStackText] = useState<string>('');

	// 필드별 검증 오류 메시지 상태
	const [errors, setErrors] = useState<TProjectRegisterErrors>({});

	// 단일 폼 필드 값을 변경하고 해당 필드의 오류 메시지를 초기화한다.
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

	// 진척도 입력값을 숫자만 허용하고 0~100 범위로 보정한다.
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

	// 진척도 바 클릭 위치를 기준으로 진척도 값을 계산한다.
	const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>): void => {
		const rect = e.currentTarget.getBoundingClientRect();
		const clickX = e.clientX - rect.left;
		const ratio = clickX / rect.width;
		const progress = Math.round(ratio * 100);
		const normalizedProgress = Math.min(100, Math.max(0, progress));

		setField('progress_pct', normalizedProgress);
	};

	// 콤마로 입력된 기술스택 문자열을 배열로 변환해 폼 상태에 반영한다.
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

	// 검증 실패 시 첫 번째 오류 필드로 포커스를 이동한다.
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

	// 프로젝트 등록 전 필수값, 진척도 범위, 시작일/종료일 순서를 검증한다.
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

	// 등록 버튼 클릭 시 폼 검증 후 프로젝트 등록 API를 호출한다.
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

	// 선택된 기술스택 목록에서 특정 스킬을 제거한다.
	const handleRemoveSkill = (skill: string): void => {
		setSkills(skills.filter((s) => s !== skill));
	};

	// 추천 기술스택을 중복 없이 선택 목록에 추가한다.
	const handleAddSuggestedSkill = (skill: string): void => {
		if (!skills.includes(skill)) {
			setSkills([...skills, skill]);
		}
	};

	// 직접 입력한 기술스택을 중복 없이 선택 목록에 추가한다.
	const handleAddSkill = (): void => {
		const trimmed = newSkillInput.trim();
		if (trimmed && !skills.includes(trimmed)) {
			setSkills([...skills, trimmed]);
			setNewSkillInput('');
		}
	};

	// 취소 버튼 클릭 시 이전 화면으로 이동한다.
	const handleCancel = (): void => {
		$router.back();
	};

	return (
		// 프로젝트 등록 페이지 전체 레이아웃
		<div className="p-5">
			<PageHeader
				title="프로젝트 등록"
				breadcrumb={[{ label: '프로젝트', path: '/projects' }, { label: '프로젝트 등록' }]}
				actions={
					<div className="flex gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={handleCancel}
							disabled={isSubmitting}
						>
							<X className="w-4 h-4 mr-1.5" />
							취소
						</Button>

						<Button
							type="button"
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
				{/* 프로젝트 기본 정보 입력 영역 */}
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
										type="button"
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
								type="button"
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
										type="button"
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

				{/* 입력한 프로젝트 정보를 저장 전 미리 확인하는 영역 */}
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
