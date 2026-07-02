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

type TProjectAssignment = {
	id: number;
	role: string | null;
	rate_pct: number;
	start_date: string;
	end_date: string | null;

	employee_id: number;
	employee_name: string;
	department: string | null;
	position: string | null;

	job_role_code?: string | null;
	job_role_name?: string | null;
	job_role_category_code?: string | null;
	job_role_category_name?: string | null;
};

type CommonCode = {
	code: string;
	code_name?: string;
	name?: string;
	parent_code?: string | null;
	sort_order?: number;
};

type TCommonCodeResponse = {
	success: boolean;
	data: CommonCode[];
};

type TProjectDetailData = {
	id: number;
	name: string;
	client: string;
	start_date: string;
	end_date: string;
	description?: string | null;
	progress_pct: number;
	status: string;
	tech_stack?: string[];
	assignments?: TProjectAssignment[];

	created_at?: string;
	updated_at?: string;
};

type TProjectDetailResponse = {
	success: boolean;
	data: TProjectDetailData;
};

type TMember = {
	assignmentId: number;
	employeeId: number;
	name: string;
	jobRole: string;
	rate: string;
	start: string;
	end: string | null;
};

const tabs = [
	{ key: 'basic', label: '기본정보' },
	{ key: 'assignment', label: '투입 이력' },
	{ key: 'schedule', label: '일정' },
	{ key: 'contracts', label: '계약정보' },
] as const;

type TabKey = (typeof tabs)[number]['key'];

export default function ProjectDetailPage(): ReactNode {
	const { id } = useParams<{ id: string }>();
	const { openAlert } = useAppAlert();

	const [refreshKey, setRefreshKey] = useState(0);
	const [deleteAssignmentId, setDeleteAssignmentId] = useState<number>();
	const [project, setProject] = useState<TProjectDetailData>();
	const [assignments, setAssignments] = useState<TProjectAssignment[]>([]);
	const [client, setClient] = useState('');
	const [members, setMembers] = useState<TMember[]>([]);
	const [activeTab, setActiveTab] = useState<TabKey>('basic');

	const projectDetailEndpoint = `/api/projects/${id}?refreshKey=${refreshKey}` as const;

	const {
		data,
		isPending,
		error,
	} = useApi<TProjectDetailResponse>(projectDetailEndpoint);

	const { data: jobRoleData } =
		useApi<TCommonCodeResponse>('/api/common-codes/JOB_ROLE');

	const { data: jobRoleCategoryData } =
		useApi<TCommonCodeResponse>('/api/common-codes/JOB_ROLE_CATEGORY');

	const jobRoleOptions = jobRoleData?.data ?? [];
	const jobRoleCategoryOptions = jobRoleCategoryData?.data ?? [];

	const { mutate: removeProject } = useApi<Record<string, never>>(
		`/api/projects/${id}`,
		{
			method: 'DELETE',
			type: 'mutation',
		},
	);

	const { mutate: removeAssignment, isPending: isRemoving } =
		useApi<Record<string, never>>(
			`/api/assignments/${deleteAssignmentId ?? ''}`,
			{
				method: 'DELETE',
				type: 'mutation',
			},
		);

	useEffect(() => {
		if (!data?.data) return;

		setProject(data.data);
		setAssignments(data.data.assignments ?? []);
		setClient(data.data.client);
	}, [data]);

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
					const message =
						error?.response?.data?.message ||
						error?.message ||
						'철수 처리 중 오류가 발생했습니다.';

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

	const techStack = project?.tech_stack ?? [];

	const formatDate = (dateStr?: string | null) => {
		if (!dateStr) return '-';

		return dayjs(dateStr).format('YYYY.MM.DD');
	};

	const handleAssignEmployeeProj = () => {
		$router.push(`/project/${id}/assign`);
	};

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
							const message =
								error?.response?.data?.message ||
								error?.message ||
								'삭제 처리 중 오류가 발생했습니다.';

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

	const handleRemoveMember = (assignmentId: number) => {
		if (isRemoving) return;

		setDeleteAssignmentId(assignmentId);
	};

	return (
		<div className="p-5">
			<PageHeader
				title={project?.name ?? '프로젝트 상세'}
				breadcrumb={[
					{ label: '프로젝트', path: '/projects' },
					{ label: project?.name ?? '로딩 중...' },
				]}
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
								<p className="text-xs text-muted-foreground mb-0.5">
									프로젝트명
								</p>
								<p className="font-semibold text-foreground">
									{project.name}
								</p>
							</div>

							<div>
								<p className="text-xs text-muted-foreground mb-0.5">
									고객사
								</p>
								<p className="font-semibold text-foreground">
									{client}
								</p>
							</div>

							<div>
								<p className="text-xs text-muted-foreground mb-0.5">
									프로젝트 기간
								</p>
								<p className="font-semibold text-foreground">
									{formatDate(project.start_date)} ~ {formatDate(project.end_date)}
								</p>
							</div>

							<div>
								<p className="text-xs text-muted-foreground mb-0.5">
									상태
								</p>
								<StatusBadge status={project.status as StatusType} />
							</div>

							<div>
								<p className="text-xs text-muted-foreground mb-0.5">
									진척도
								</p>
								<p className="font-semibold text-foreground">
									{project.progress_pct}%
								</p>
							</div>

							<div className="col-span-2">
								<p className="text-xs text-muted-foreground mb-0.5">
									프로젝트 설명
								</p>
								<p className="text-sm text-foreground">
									{project.description || '-'}
								</p>
							</div>
						</div>

						<div className="mb-4">
							<div className="flex justify-between text-sm mb-1">
								<span className="text-muted-foreground">현재 진척도</span>
								<span className="font-semibold text-brand-600">
									{project.progress_pct}%
								</span>
							</div>

							<div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
								<div
									className="h-full bg-brand-500 rounded-full transition-all duration-300"
									style={{ width: `${project.progress_pct}%` }}
								/>
							</div>
						</div>

						<div className="rounded-xl border p-4">
							<h3 className="font-semibold text-foreground text-sm mb-3">
								기술 스택
							</h3>

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
									<p className="text-sm text-muted-foreground">
										기술 정보가 없습니다.
									</p>
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
							{activeTab === tab.key && (
								<span className="ml-1 text-xs text-brand-500">★</span>
							)}
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
				/>
			)}

			{activeTab === 'contracts' && (
				<div className="rounded-xl border bg-card p-5">
					<p className="text-sm text-muted-foreground">
						계약정보 탭은 준비 중입니다.
					</p>
				</div>
			)}
		</div>
	);
}