import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { Save, X, Plus } from 'lucide-react';

import { useApi } from '@axiom/hooks';
import {
	Button,
	Calendar,
	FormField,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@axiom/components/ui';

import PageHeader from '@/shared/components/ui/PageHeader';
import ProjectStatus from '@/shared/components/ui/ProjectStatusBadge';
import { useAppAlert } from '@/shared/components/layout/default/AppAlertProvider';
import { getFieldClassName, validateRequired } from '@/shared/lib/shadcn/js/common';

/** 프로젝트 수정 폼에서 관리하는 입력값 타입 */
type TProjectForm = {
	name: string;
	client: string;
	start_date: string;
	end_date: string;
	status: ProjectStatusType;
	progress_pct: number;
	description: string;
	tech_stack: string[];
};

/** 프로젝트 상세 조회 API에서 내려오는 프로젝트 원본 데이터 타입 */
type TProjectDetail = {
	id: number;
	name: string;
	client: string;
	start_date: string;
	end_date: string | null;
	status: string;
	progress_pct: number;
	description: string | null;
	tech_stack: string[];
	created_at?: string;
	updated_at?: string;
};

/** 프로젝트 상세 조회 API 응답 타입 */
type TProjectDetailResponse = {
	success: boolean;
	data: TProjectDetail;
	message?: string;
};

/** 프로젝트 수정 API 응답 타입 */
type TProjectUpdateResponse = {
	success: boolean;
	data: TProjectDetail;
	message?: string;
};

/** 폼 필드별 검증 오류 메시지를 저장하는 타입 */
type TProjectFormErrors = Partial<Record<keyof TProjectForm, string>>;

/** 현재 열려 있는 날짜 선택 영역 구분값 */
type TOpenDatePicker = 'start_date' | 'end_date' | false;

/** 프로젝트 상태값 타입 */
type ProjectStatusType = 'planned' | 'active' | 'complete' | 'hold';

/** 상태 select 박스에 표시할 옵션 목록 */
const statusOptions = [
	{ label: '예정', value: 'planned' },
	{ label: '진행중', value: 'active' },
	{ label: '완료', value: 'complete' },
	{ label: '보류', value: 'hold' },
];

/** 기술스택 빠른 선택 버튼으로 제공할 기본 추천 목록 */
const techStackSuggestions = [
	'Java',
	'Spring Boot',
	'React',
	'Vue',
	'Python',
	'Oracle',
	'MySQL',
	'AWS',
	'Docker',
	'Git',
];

/** 입력 필드 focus 스타일 공통 클래스 */
const fieldFocusClassName = 'focus-visible:border-brand-500 focus-visible:ring-brand-500/20';

/** Date 객체를 YYYY-MM-DD 문자열로 변환 */
const getFormattedDate = (date: Date): string => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');

	return `${year}-${month}-${day}`;
};

/** API 날짜값을 화면 입력용 YYYY-MM-DD 형식으로 정규화 */
const formatDateValue = (value?: string | null): string => {
	if (!value) return '';

	if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		return value;
	}

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return value.slice(0, 10);
	}

	return getFormattedDate(date);
};

/** YYYY-MM-DD 문자열을 Calendar 컴포넌트에서 사용할 Date 객체로 변환 */
const toCalendarDate = (value?: string | null): Date | undefined => {
	if (!value) return undefined;

	return new Date(`${value.slice(0, 10)}T00:00:00`);
};

/** API/한글/이전 상태값을 화면에서 사용하는 표준 상태값으로 변환 */
const normalizeProjectStatus = (status?: string | null): ProjectStatusType => {
	if (status === 'planned') return 'planned';
	if (status === 'active') return 'active';
	if (status === 'complete') return 'complete';
	if (status === 'hold') return 'hold';

	if (status === 'in_progress') return 'active';
	if (status === 'completed') return 'complete';

	if (status === '예정') return 'planned';
	if (status === '진행중') return 'active';
	if (status === '완료') return 'complete';
	if (status === '보류') return 'hold';

	return 'planned';
};

/** 프로젝트 수정 화면 컴포넌트 */
export default function ProjectEditPage(): React.ReactNode {
	// URL 파라미터에서 수정할 프로젝트 ID 조회
	const { id } = useParams<{ id: string }>();

	// 프로젝트 상세 조회/수정에 공통으로 사용하는 API 엔드포인트
	const PROJECT_DETAIL_ENDPOINT = `/api/projects/${id}` as const;

	// 공통 알림 모달 호출 함수
	const { openAlert } = useAppAlert();

	// 프로젝트 상세 정보를 조회하는 API 훅
	const { data, isPending: isLoading, error } = useApi<TProjectDetailResponse>(PROJECT_DETAIL_ENDPOINT);

	// 프로젝트 수정 요청을 처리하는 mutation API 훅
	const {
		mutate: updateProject,
		isPending: isSubmitting,
		invalidateQueries,
	} = useApi<TProjectForm, TProjectUpdateResponse>(PROJECT_DETAIL_ENDPOINT, {
		method: 'PUT',
		type: 'mutation',
	});

	// 화면 입력값을 한 번에 관리하는 폼 상태
	const [form, setForm] = useState<TProjectForm>({
		name: '',
		client: '',
		start_date: '',
		end_date: '',
		status: 'planned',
		progress_pct: 0,
		description: '',
		tech_stack: [],
	});

	// 필드별 검증 오류 메시지 상태
	const [errors, setErrors] = useState<TProjectFormErrors>({});
	// 시작일/종료일 날짜 선택 팝업 열림 상태
	const [openDatePicker, setOpenDatePicker] = useState<TOpenDatePicker>(false);
	// 직접 입력 중인 기술스택 값
	const [newTechStackInput, setNewTechStackInput] = useState('');

	// 시작일 날짜 선택 영역 DOM 참조
	const startPickerRef = useRef<HTMLDivElement>(null);
	// 종료일 날짜 선택 영역 DOM 참조
	const endPickerRef = useRef<HTMLDivElement>(null);

	// 상세 조회가 완료되면 API 데이터를 수정 폼 상태로 세팅
	useEffect(() => {
		if (!data?.data) return;
		const project = data.data;

		setForm({
			name: project.name ?? '',
			client: project.client ?? '',
			start_date: formatDateValue(project.start_date),
			end_date: formatDateValue(project.end_date),
			status: normalizeProjectStatus(project.status),
			progress_pct: Number(project.progress_pct ?? 0),
			description: project.description ?? '',
			tech_stack: Array.isArray(project.tech_stack) ? project.tech_stack : [],
		});
	}, [data]);

	// 날짜 선택 팝업 외부 클릭 시 팝업 닫기
	useEffect(() => {
		const handleClickOutside = (event: PointerEvent): void => {
			const target = event.target as Node;

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

	// 단일 폼 필드 값을 변경하고 해당 필드 오류를 초기화
	const setField = <K extends keyof TProjectForm>(key: K, value: TProjectForm[K]): void => {
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

	// 검증 실패 시 첫 번째 오류 필드로 포커스 이동
	const focusFirstError = (nextErrors: TProjectFormErrors): void => {
		const firstErrorKey = Object.keys(nextErrors)[0];

		if (!firstErrorKey) return;

		const target = document.querySelector(`[name="${firstErrorKey}"]`) as
			| HTMLInputElement
			| HTMLTextAreaElement
			| HTMLSelectElement
			| HTMLButtonElement
			| null;

		target?.focus();
	};

	// 필수값, 날짜 순서, 진척도 범위를 검증
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

		const nextErrors: TProjectFormErrors = {
			...(requiredResult.errors as TProjectFormErrors),
		};

		if (form.start_date && form.end_date && form.start_date > form.end_date) {
			nextErrors.end_date = '종료일은 시작일보다 빠를 수 없습니다.';
		}

		if (Number.isNaN(form.progress_pct) || form.progress_pct < 0 || form.progress_pct > 100) {
			nextErrors.progress_pct = '진척도는 0부터 100 사이로 입력해주세요.';
		}

		setErrors(nextErrors);
		focusFirstError(nextErrors);

		return Object.keys(nextErrors).length === 0;
	};

	// 진척도 input 변경 시 숫자만 허용하고 0~100 범위로 보정
	const handleProgressChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
		const value = event.target.value;

		if (value === '') {
			setField('progress_pct', 0);
			return;
		}

		const onlyNumber = value.replace(/[^0-9]/g, '');
		const progress = Math.min(100, Math.max(0, Number(onlyNumber)));

		setField('progress_pct', progress);
	};

	// 진척도 바 클릭 위치를 기준으로 진척도 값 계산
	const handleProgressBarClick = (event: React.MouseEvent<HTMLDivElement>): void => {
		const rect = event.currentTarget.getBoundingClientRect();
		const clickX = event.clientX - rect.left;
		const progress = Math.round((clickX / rect.width) * 100);

		setField('progress_pct', Math.min(100, Math.max(0, progress)));
	};

	// 직접 입력한 기술스택을 중복 없이 추가
	const handleAddTechStack = (): void => {
		const tech = newTechStackInput.trim();

		if (!tech) return;

		if (form.tech_stack.includes(tech)) {
			setNewTechStackInput('');
			return;
		}

		setField('tech_stack', [...form.tech_stack, tech]);
		setNewTechStackInput('');
	};

	// 추천 기술스택 버튼 클릭 시 중복 없이 추가
	const handleAddSuggestedTechStack = (tech: string): void => {
		if (form.tech_stack.includes(tech)) return;

		setField('tech_stack', [...form.tech_stack, tech]);
	};

	// 선택된 기술스택 제거
	const handleRemoveTechStack = (tech: string): void => {
		setField(
			'tech_stack',
			form.tech_stack.filter((item) => item !== tech),
		);
	};

	// 폼 검증 후 프로젝트 수정 API 호출
	const handleSubmit = (event?: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>): void => {
		event?.preventDefault();

		if (!validateForm()) return;

		updateProject(
			{
				name: form.name.trim(),
				client: form.client.trim(),
				start_date: form.start_date,
				end_date: form.end_date,
				status: form.status,
				progress_pct: Number(form.progress_pct),
				description: form.description.trim(),
				tech_stack: form.tech_stack,
			},
			{
				onSuccess: async () => {
					await invalidateQueries('/api/projects');
					await invalidateQueries(PROJECT_DETAIL_ENDPOINT);

					openAlert({
						title: '수정 완료',
						message: '프로젝트 정보가 수정되었습니다.',
						confirmText: '확인',
						onConfirm: () => {
							$router.push(`/project/${id}`);
						},
					});
				},
				onError: (error: any) => {
					const message = error?.response?.data?.message || error?.message || '프로젝트 수정 중 오류가 발생했습니다.';

					openAlert({
						title: '수정 실패',
						message,
						confirmText: '확인',
					});
				},
			},
		);
	};

	// 수정 취소 시 프로젝트 상세 화면으로 이동
	const handleCancel = (): void => {
		$router.push(`/project/${id}`);
	};

	// 상세 조회 중일 때 로딩 화면 표시
	if (isLoading) {
		return (
			<div className="p-5">
				<PageHeader
					title="프로젝트 수정"
					breadcrumb={[{ label: '프로젝트', path: '/project/project-list' }, { label: '프로젝트 수정' }]}
				/>

				<div className="bg-card rounded-xl border p-5">
					<p className="text-sm text-muted-foreground">프로젝트 정보를 불러오는 중입니다.</p>
				</div>
			</div>
		);
	}

	// 상세 조회 실패 시 오류 화면 표시
	if (error) {
		return (
			<div className="p-5">
				<PageHeader
					title="프로젝트 수정"
					breadcrumb={[{ label: '프로젝트', path: '/project/project-list' }, { label: '프로젝트 수정' }]}
				/>

				<div className="bg-card rounded-xl border p-5">
					<p className="text-sm text-red-600">프로젝트 정보를 불러오지 못했습니다.</p>
				</div>
			</div>
		);
	}

	// 프로젝트 수정 폼 화면 렌더링
	return (
		<div className="p-5">
			<PageHeader
				title="프로젝트 수정"
				breadcrumb={[
					{ label: '프로젝트', path: '/project/project-list' },
					{ label: data?.data?.name ?? '프로젝트 상세', path: `/project/${id}` },
					{ label: '프로젝트 수정' },
				]}
				actions={
					<div className="flex gap-2">
						<Button
							type="button"
							variant="outline"
							size="lg"
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
							{isSubmitting ? '수정 중...' : '수정'}
						</Button>
					</div>
				}
			/>

			<form onSubmit={handleSubmit}>
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
								onChange={(event) => setField('name', event.target.value)}
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
								onChange={(event) => setField('client', event.target.value)}
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
									{form.start_date || '날짜 선택'}
								</Button>

								{openDatePicker === 'start_date' && (
									<div className="absolute top-full left-0 z-50 mt-2">
										<Calendar
											mode="single"
											selected={toCalendarDate(form.start_date)}
											onSelect={(date) => {
												if (!date) return;

												const formattedDate = getFormattedDate(date);

												setField('start_date', formattedDate);
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
									{form.end_date || '날짜 선택'}
								</Button>

								{openDatePicker === 'end_date' && (
									<div className="absolute top-full left-0 z-50 mt-2">
										<Calendar
											mode="single"
											selected={toCalendarDate(form.end_date)}
											onSelect={(date) => {
												if (!date) return;

												const formattedDate = getFormattedDate(date);

												setField('end_date', formattedDate);
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
								onValueChange={(value) => {
									setField('status', value as ProjectStatusType);
								}}
							>
								<SelectTrigger
									className={getFieldClassName(
										errors.status,
										'h-10 w-full justify-between rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-colors focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500/20',
									)}
								>
									<SelectValue placeholder="상태 선택" />
								</SelectTrigger>

								<SelectContent>
									{statusOptions.map((option) => (
										<SelectItem
											key={option.value}
											value={option.value}
										>
											{option.label}
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
									onChange={(event) => setField('description', event.target.value)}
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
				</div>

				<div className="bg-card rounded-xl border p-5 mb-4">
					<h2 className="font-semibold text-foreground mb-4 text-sm flex items-center gap-2">
						<span className="w-5 h-5 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center">
							2
						</span>
						기술스택
						<span className="text-xs font-normal text-brand-600">★ 수정</span>
					</h2>

					<div className="flex flex-wrap gap-2 mb-3 min-h-10 p-2 border border-dashed rounded-lg bg-muted/20">
						{form.tech_stack.length > 0 ? (
							form.tech_stack.map((tech) => (
								<span
									key={tech}
									className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-sm font-medium"
								>
									{tech}

									<Button
										type="button"
										variant="ghost"
										size="icon-xs"
										className="rounded-full hover:bg-brand-200/50 dark:hover:bg-brand-800/50 hover:text-brand-900 dark:hover:text-brand-100"
										onClick={() => handleRemoveTechStack(tech)}
									>
										<X className="w-3 h-3" />
									</Button>
								</span>
							))
						) : (
							<span className="text-sm text-muted-foreground px-1 py-1">선택된 기술스택이 없습니다.</span>
						)}
					</div>

					<div className="flex gap-2 mb-3">
						<Input
							name="tech_stack"
							value={newTechStackInput}
							onChange={(event) => setNewTechStackInput(event.target.value)}
							onKeyDown={(event) => {
								if (event.key === 'Enter') {
									event.preventDefault();
									handleAddTechStack();
								}
							}}
							className="flex-1 h-9 bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm focus-visible:border-brand-500 focus-visible:ring-brand-500/20"
							placeholder="기술스택 직접 입력..."
						/>

						<Button
							type="button"
							size="sm"
							variant="outline"
							onClick={handleAddTechStack}
						>
							<Plus className="w-4 h-4" />
						</Button>
					</div>

					<div>
						<p className="text-xs text-muted-foreground mb-2">자주 사용되는 기술스택:</p>

						<div className="flex flex-wrap gap-1.5">
							{techStackSuggestions.map((tech) => (
								<button
									key={tech}
									type="button"
									className="px-2.5 py-1 text-xs border rounded-full hover:border-brand-400 hover:text-brand-600 dark:hover:border-brand-500 dark:hover:text-brand-400 transition-colors text-muted-foreground border-slate-300 dark:border-slate-600"
									onClick={() => handleAddSuggestedTechStack(tech)}
								>
									+ {tech}
								</button>
							))}
						</div>
					</div>
				</div>

				<div className="bg-card rounded-xl border p-4 mb-4">
					<h3 className="font-semibold text-foreground text-sm mb-3">수정 정보 미리보기</h3>

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
							<ProjectStatus status={normalizeProjectStatus(form.status)} />
						</div>

						<div>
							<p className="text-xs text-muted-foreground mb-0.5">진척도</p>
							<p className="font-semibold text-foreground">{form.progress_pct}%</p>
						</div>

						<div className="sm:col-span-2 lg:col-span-3">
							<p className="text-xs text-muted-foreground mb-0.5">프로젝트 설명</p>
							<p className="text-sm text-foreground">{form.description || '-'}</p>
						</div>

						<div className="sm:col-span-2 lg:col-span-4">
							<p className="text-xs text-muted-foreground mb-1">기술스택</p>

							{form.tech_stack.length > 0 ? (
								<div className="flex flex-wrap gap-1.5">
									{form.tech_stack.map((tech) => (
										<span
											key={tech}
											className="inline-flex items-center px-2.5 py-1 rounded-full bg-muted text-xs text-foreground border"
										>
											{tech}
										</span>
									))}
								</div>
							) : (
								<p className="text-sm text-foreground">-</p>
							)}
						</div>
					</div>
				</div>
			</form>
		</div>
	);
}
