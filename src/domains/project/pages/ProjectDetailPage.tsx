import { Button } from '@axiom/components/ui';
import PageHeader from '@/shared/components/ui/PageHeader';
import StatusBadge, { type StatusType } from '@/shared/components/ui/StatusBadge';
import { Edit, Trash2, UserPlus } from 'lucide-react';
import { useParams } from 'react-router';
import { useApi } from '@axiom/hooks';
import dayjs from 'dayjs';
import { useEffect, useState, type ReactNode } from 'react';
import { useAppAlert } from '@/shared/components/layout/default/AppAlertProvider';
import ProjectOverviewTab from './tabs/ProjectOverviewTab';
import ProjectAssignInfoPageTab from './tabs/ProjectAssignInfoPageTab';
import ProjectScheduleTab from './tabs/ProjectScheduleTab';

/**
 * 프로젝트 상세 API에서 내려오는 투입 인력 원본 데이터 타입입니다.
 * assignments 테이블 정보와 employees, departments, 공통코드 조인 결과를 함께 받습니다.
 */
type TProjectAssignment = {
	/** assignments.id - 투입 제외 DELETE API 호출 시 사용하는 고유 ID입니다. */
	id: number;
	/** 기존 역할명 또는 직무 코드 대체값입니다. job_role_code가 없을 때 fallback으로 사용합니다. */
	role: string | null;
	/** 투입률(%)입니다. 예: 100, 50 */
	rate_pct: number;
	/** 투입 시작일입니다. */
	start_date: string;
	/** 투입 종료일입니다. null이면 종료일 미정입니다. */
	end_date: string | null;

	/** 직원 ID입니다. */
	employee_id: number;
	/** 직원명입니다. */
	employee_name: string;
	/** 부서명입니다. */
	department: string | null;
	/** 직급 코드 또는 직급명입니다. */
	position: string | null;

	/** employees.job_role_code 값입니다. */
	job_role_code?: string | null;
	/** JOB_ROLE 공통코드의 code_name 값입니다. */
	job_role_name?: string | null;
	/** JOB_ROLE의 parent_code 또는 직접 조인된 직무구분 코드입니다. */
	job_role_category_code?: string | null;
	/** JOB_ROLE_CATEGORY 공통코드의 code_name 값입니다. */
	job_role_category_name?: string | null;
};

/**
 * 공통코드 항목 타입입니다.
 * JOB_ROLE, JOB_ROLE_CATEGORY 등 코드성 데이터를 화면 옵션으로 사용할 때 공통으로 사용합니다.
 */
type CommonCode = {
	/** 공통코드 실제 값입니다. */
	code: string;
	/** 공통코드 표시명입니다. 현재 백엔드 기준 code_name으로 내려옵니다. */
	code_name?: string;
	/** 일부 화면/과거 API에서 사용하는 표시명 fallback입니다. */
	name?: string;
	/** 2뎁스 공통코드에서 상위 코드입니다. JOB_ROLE의 경우 직무구분 코드가 들어갑니다. */
	parent_code?: string | null;
	/** 화면 정렬 순서입니다. */
	sort_order?: number;
};

/** 공통코드 목록 API 응답 타입입니다. */
type TCommonCodeResponse = {
	/** API 성공 여부입니다. */
	success: boolean;
	/** 공통코드 목록입니다. */
	data: CommonCode[];
};

/** 프로젝트 상세 API에서 내려오는 프로젝트 기본 정보 타입입니다. */
type TProjectDetailData = {
	/** 프로젝트 ID입니다. */
	id: number;
	/** 프로젝트명입니다. */
	name: string;
	/** 고객사명입니다. */
	client: string;
	/** 프로젝트 시작일입니다. */
	start_date: string;
	/** 프로젝트 종료일입니다. */
	end_date: string;
	/** 프로젝트 설명입니다. */
	description?: string | null;
	/** 프로젝트 진척도(%)입니다. */
	progress_pct: number;
	/** 프로젝트 상태 코드입니다. */
	status: string;
	/** 프로젝트 기술 스택 목록입니다. */
	tech_stack?: string[];
	/** 프로젝트에 배정된 인력 목록입니다. */
	assignments?: TProjectAssignment[];

	/** 생성일입니다. */
	created_at?: string;
	/** 수정일입니다. */
	updated_at?: string;
};

/** 프로젝트 상세 API 응답 타입입니다. */
type TProjectDetailResponse = {
	/** API 성공 여부입니다. */
	success: boolean;
	/** 프로젝트 상세 데이터입니다. */
	data: TProjectDetailData;
};

/**
 * 투입 이력 탭 테이블에서 사용하는 화면 전용 멤버 타입입니다.
 * API 원본 assignments 데이터를 화면 표시용으로 변환한 형태입니다.
 */
type TMember = {
	/** assignments.id - 투입 제외 API에 넘기는 값입니다. */
	assignmentId: number;
	/** 직원 ID입니다. */
	employeeId: number;
	/** 직원명입니다. */
	name: string;
	/** 화면에 표시할 직무명입니다. */
	jobRole: string;
	/** 화면에 표시할 투입률 문자열입니다. 예: 100% */
	rate: string;
	/** 투입 시작일입니다. */
	start: string;
	/** 투입 종료일입니다. */
	end: string | null;
};

/** 프로젝트 상세 화면 탭 목록입니다. */
const tabs = [
	{ key: 'basic', label: '기본정보' },
	{ key: 'assignment', label: '투입 이력' },
	{ key: 'schedule', label: '일정' },
	{ key: 'contracts', label: '계약정보' },
] as const;

/** tabs 배열의 key 값만 허용하는 탭 타입입니다. */
type TabKey = (typeof tabs)[number]['key'];

/**
 * 프로젝트 상세 페이지 컴포넌트입니다.
 * 프로젝트 기본 정보, 투입 이력, 역할별 일정, 계약정보 탭을 관리합니다.
 */
export default function ProjectDetailPage(): ReactNode {
	/** URL 파라미터에서 프로젝트 ID를 가져옵니다. */
	const { id } = useParams<{ id: string }>();
	/** 공통 알림/확인 모달을 열기 위한 함수입니다. */
	const { openAlert } = useAppAlert();

	/** 상세 API를 강제로 다시 호출하기 위한 갱신 키입니다. */
	const [refreshKey, setRefreshKey] = useState(0);
	/** 현재 삭제/철수 처리할 assignments.id입니다. */
	const [deleteAssignmentId, setDeleteAssignmentId] = useState<number>();
	/** 프로젝트 상세 기본 정보 상태입니다. */
	const [project, setProject] = useState<TProjectDetailData>();
	/** 프로젝트에 배정된 원본 투입 인력 목록 상태입니다. */
	const [assignments, setAssignments] = useState<TProjectAssignment[]>([]);
	/** 고객사명 표시용 상태입니다. */
	const [client, setClient] = useState('');
	/** 투입 이력 탭에 넘길 화면 표시용 멤버 목록입니다. */
	const [members, setMembers] = useState<TMember[]>([]);
	/** 현재 선택된 탭 상태입니다. */
	const [activeTab, setActiveTab] = useState<TabKey>('basic');

	/** refreshKey가 변경될 때마다 프로젝트 상세 API를 다시 호출하기 위한 endpoint입니다. */
	const projectDetailEndpoint = `/api/projects/${id}?refreshKey=${refreshKey}` as const;

	/** 프로젝트 상세 정보를 조회합니다. */
	const { data, isPending, error } = useApi<TProjectDetailResponse>(projectDetailEndpoint);

	/** 직무 공통코드 목록을 조회합니다. */
	const { data: jobRoleData } = useApi<TCommonCodeResponse>('/api/common-codes/JOB_ROLE');

	/** 직무구분 공통코드 목록을 조회합니다. */
	const { data: jobRoleCategoryData } = useApi<TCommonCodeResponse>('/api/common-codes/JOB_ROLE_CATEGORY');

	/** 직무 옵션 목록입니다. API 응답이 없으면 빈 배열을 사용합니다. */
	const jobRoleOptions = jobRoleData?.data ?? [];
	/** 직무구분 옵션 목록입니다. API 응답이 없으면 빈 배열을 사용합니다. */
	const jobRoleCategoryOptions = jobRoleCategoryData?.data ?? [];

	/** 프로젝트 삭제 mutation입니다. */
	const { mutate: removeProject } = useApi<Record<string, never>>(`/api/projects/${id}`, {
		method: 'DELETE',
		type: 'mutation',
	});

	/** 투입 인력 제외 mutation입니다. deleteAssignmentId가 설정된 뒤 실행됩니다. */
	const { mutate: removeAssignment, isPending: isRemoving } = useApi<Record<string, never>>(
		`/api/assignments/${deleteAssignmentId ?? ''}`,
		{
			method: 'DELETE',
			type: 'mutation',
		},
	);

	/** 프로젝트 상세 조회 결과를 화면 상태로 반영합니다. */
	useEffect(() => {
		if (!data?.data) return;

		setProject(data.data);
		setAssignments(data.data.assignments ?? []);
		setClient(data.data.client);
	}, [data]);

	/** assignments 원본 데이터를 투입 이력 탭에서 쓰는 members 형태로 변환합니다. */
	useEffect(() => {
		const transformedMembers = assignments.map((assignment) => ({
			assignmentId: assignment.id,
			employeeId: assignment.employee_id,
			name: assignment.employee_name,
			jobRole: assignment.job_role_name || assignment.role || '직무 미지정',
			rate: `${assignment.rate_pct}%`,
			start: assignment.start_date,
			end: assignment.end_date,
		}));

		setMembers(transformedMembers);
	}, [assignments]);

	/** deleteAssignmentId가 설정되면 해당 배정 건을 삭제/철수 처리합니다. */
	useEffect(() => {
		if (deleteAssignmentId === undefined) return;

		removeAssignment(
			{},
			{
				onSuccess: () => {
					openAlert({
						title: '성공',
						message: '철수 처리가 완료되었습니다.',
						confirmText: '확인',
						onConfirm: () => {
							setRefreshKey((prev) => prev + 1);
							setDeleteAssignmentId(undefined);
						},
					});
				},
				onError: (error: any) => {
					const message = error?.response?.data?.message || error?.message || '철수 처리 중 오류가 발생했습니다.';

					openAlert({
						title: '철수 처리 실패',
						message,
						confirmText: '확인',
					});

					setDeleteAssignmentId(undefined);
				},
			},
		);
	}, [deleteAssignmentId, removeAssignment, openAlert]);

	/** 프로젝트 기술 스택 목록입니다. 값이 없으면 빈 배열로 처리합니다. */
	const techStack = project?.tech_stack ?? [];

	/** 날짜 문자열을 화면 표시 형식(YYYY.MM.DD)으로 변환합니다. */
	const formatDate = (dateStr?: string | null) => {
		if (!dateStr) return '-';

		return dayjs(dateStr).format('YYYY.MM.DD');
	};

	/** 인력 배정 화면으로 이동합니다. */
	const handleAssignEmployeeProj = () => {
		$router.push(`/project/${id}/assign`);
	};

	/**
	 * 프로젝트 삭제 버튼 클릭 처리입니다.
	 * 배정 인력이 남아 있으면 프로젝트 삭제를 막고, 먼저 투입 인력 제외를 안내합니다.
	 */
	const handleDeleteEmployeeProj = () => {
		const assignmentCount = assignments.length;

		if (assignmentCount > 0) {
			openAlert({
				title: '삭제 불가',
				message: `현재 프로젝트에 투입된 인원이 ${assignmentCount}명 있습니다. 투입 인원을 먼저 제외한 뒤 삭제해주세요.`,
				confirmText: '확인',
			});
			return;
		}

		openAlert({
			title: '프로젝트 삭제',
			message: '정말 이 프로젝트를 삭제하시겠습니까? 삭제된 프로젝트는 복구할 수 없습니다.',
			confirmText: '삭제',
			onConfirm: () => {
				removeProject(
					{},
					{
						onSuccess: () => {
							openAlert({
								title: '삭제',
								message: '삭제가 완료되었습니다.',
								confirmText: '확인',
								onConfirm: () => {
									$router.push('/project/project-list');
								},
							});
						},
						onError: (error: any) => {
							const message = error?.response?.data?.message || error?.message || '삭제 처리 중 오류가 발생했습니다.';

							openAlert({
								title: '삭제 처리 실패',
								message,
								confirmText: '확인',
							});
						},
					},
				);
			},
		});
	};

	/** 투입 이력 탭에서 특정 인력 삭제 버튼을 눌렀을 때 삭제 대상 ID를 설정합니다. */
	const handleRemoveMember = (assignmentId: number) => {
		if (isRemoving) return;

		setDeleteAssignmentId(assignmentId);
	};

	return (
		<div className="p-5">
			<PageHeader
				title={project?.name ?? '프로젝트 상세'}
				breadcrumb={[{ label: '프로젝트', path: '/projects' }, { label: project?.name ?? '로딩 중...' }]}
				actions={
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="lg"
							onClick={() => $router.push('/project/project-list')}
						>
							목록으로
						</Button>

						<Button
							variant="outline"
							size="lg"
							onClick={() => $router.push(`/project/${id}/project-edit`)}
						>
							<Edit className="w-4 h-4 mr-1.5" />
							수정
						</Button>

						<Button
							size="lg"
							onClick={handleAssignEmployeeProj}
						>
							<UserPlus className="w-4 h-4 mr-1.5" />
							인력 배정
						</Button>

						<Button
							variant="outline"
							size="lg"
							className="text-destructive hover:text-destructive"
							onClick={handleDeleteEmployeeProj}
						>
							<Trash2 className="w-4 h-4 mr-1.5" />
							삭제
						</Button>
					</div>
				}
			/>

			<div className="bg-card rounded-xl border p-5 mb-4">
				{isPending ? (
					<p className="text-sm text-gray-500">로딩 중…</p>
				) : error ? (
					<p className="text-sm text-red-600">에러: {error.message}</p>
				) : project ? (
					<>
						<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
							<div>
								<p className="text-xs text-muted-foreground mb-0.5">프로젝트명</p>
								<p className="font-semibold text-foreground">{project.name}</p>
							</div>

							<div>
								<p className="text-xs text-muted-foreground mb-0.5">고객사</p>
								<p className="font-semibold text-foreground">{client}</p>
							</div>

							<div>
								<p className="text-xs text-muted-foreground mb-0.5">프로젝트 기간</p>
								<p className="font-semibold text-foreground">
									{formatDate(project.start_date)} ~ {formatDate(project.end_date)}
								</p>
							</div>

							<div>
								<p className="text-xs text-muted-foreground mb-0.5">상태</p>
								<StatusBadge status={project.status as StatusType} />
							</div>

							<div>
								<p className="text-xs text-muted-foreground mb-0.5">진척도</p>
								<p className="font-semibold text-foreground">{project.progress_pct}%</p>
							</div>

							<div className="col-span-2">
								<p className="text-xs text-muted-foreground mb-0.5">프로젝트 설명</p>
								<p className="text-sm text-foreground">{project.description || '-'}</p>
							</div>
						</div>

						<div className="mb-4">
							<div className="flex justify-between text-sm mb-1">
								<span className="text-muted-foreground">현재 진척도</span>
								<span className="font-semibold text-brand-600">{project.progress_pct}%</span>
							</div>

							<div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
								<div
									className="h-full bg-brand-500 rounded-full transition-all duration-300"
									style={{ width: `${project.progress_pct}%` }}
								/>
							</div>
						</div>

						<div className="rounded-xl border p-4">
							<h3 className="font-semibold text-foreground text-sm mb-3">기술 스택</h3>

							<div className="flex flex-wrap gap-2">
								{techStack.length > 0 ? (
									techStack.map((tech) => (
										<span
											key={tech}
											className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium"
										>
											{tech}
										</span>
									))
								) : (
									<p className="text-sm text-muted-foreground">기술 정보가 없습니다.</p>
								)}
							</div>
						</div>
					</>
				) : (
					<p className="text-sm text-gray-500">데이터를 불러올 수 없습니다</p>
				)}
			</div>

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

			{activeTab === 'basic' && (
				<ProjectOverviewTab
					assignments={assignments}
					jobRoleOptions={jobRoleOptions}
					jobRoleCategoryOptions={jobRoleCategoryOptions}
				/>
			)}

			{activeTab === 'assignment' && (
				<ProjectAssignInfoPageTab
					members={members}
					isRemoving={isRemoving}
					deleteAssignmentId={deleteAssignmentId}
					onRemoveMember={handleRemoveMember}
				/>
			)}

			{activeTab === 'schedule' && (
				<ProjectScheduleTab
					project={project}
					assignments={assignments}
					jobRoleOptions={jobRoleOptions}
					jobRoleCategoryOptions={jobRoleCategoryOptions}
				/>
			)}

			{activeTab === 'contracts' && (
				<div className="rounded-xl border bg-card p-5">
					<p className="text-sm text-muted-foreground">계약정보 탭은 준비 중입니다.</p>
				</div>
			)}
		</div>
	);
}
