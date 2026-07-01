import { Button } from '@axiom/components/ui';
import PageHeader from '@/shared/components/ui/PageHeader';
import StatusBadge, { type StatusType } from '@/shared/components/ui/StatusBadge';
import { Edit, UserPlus } from 'lucide-react';
import { useParams } from 'react-router';
import { useApi } from '@axiom/hooks';
import { Trash2 } from 'lucide-react';
import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import { useAppAlert } from '@/shared/components/layout/default/AppAlertProvider';
import ProjectOverviewTab from './tabs/ProjectOverviewTab';
import ProjectAssignInfoPageTab from './tabs/ProjectAssignInfoPageTab';
import ProjectScheduleTab from './tabs/ProjectScheduleTab';
import ProjectContractTab from './tabs/ProjectContractTab';

type TProjectAssignment = {
	id: number; // assignments.id
	role: string;
	rate_pct: number;
	start_date: string;
	end_date: string | null;
	employee_id: number;
	employee_name: string;
	department: string;
	position: string;
};

// API 응답 데이터 타입 정의
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
	tech_stack: any[];
	updated_at: string;
};

// API 응답 wrapper 타입
type TProjectDetailResponse = {
	success: boolean;
	data: TProjectDetail;
};

type TMember = {
	assignmentId: number; // 삭제 API에 넘길 assignments.id
	employeeId: number;
	name: string;
	role: string;
	rate: string;
	start: string;
	end: string | null;
};

//const tabs = ['개요', '투입 인력', '일정', '계약'];
const tabs = [
	{ key: 'basic', label: '기본정보' },
	{ key: 'assignment', label: '투입 이력' },
	{ key: 'schedule', label: '일정' },
	{ key: 'contracts', label: '계약정보' },
] as const;

export default function ProjectDetailPage(): React.ReactNode {
	const { id } = useParams<{ id: string }>();
	const [refreshKey, setRefreshKey] = useState(0);
	const PROJECTS_ENDPOINT = `/api/projects/${id}` as const;
	const PROJECT_DETAIL_ENDPOINT = `${PROJECTS_ENDPOINT}?refreshKey=${refreshKey}` as const;

	const { data, isPending, error } = useApi<TProjectDetailResponse>(PROJECT_DETAIL_ENDPOINT);
	const { openAlert } = useAppAlert();

	// 삭제 대상 assignment id
	const [deleteAssignmentId, setDeleteAssignmentId] = useState<number>();

	// 상태 관리
	const [project, setProject] = useState<TProjectDetailData | undefined>(undefined);
	const [assignments, setAssignments] = useState<TProjectAssignment[]>([]);
	const [client, setClient] = useState<string>('');
	const [members, setMembers] = useState<TMember[]>([]);

	type TabKey = (typeof tabs)[number]['key'];

	/** 현재 활성화된 탭 상태 관리 */
	const [activeTab, setActiveTab] = useState<TabKey>('basic');

	// 프로젝트 상세 데이터 세팅
	useEffect(() => {
		if (data?.data) {
			setProject(data.data);
			setAssignments(data.data.assignments ?? []);
			setClient(data.data.client);
		}
	}, [data]);

	// members 변환
	useEffect(() => {
		const transformedMembers = Array.isArray(assignments)
			? assignments.map((a) => ({
					assignmentId: a.id,
					employeeId: a.employee_id,
					name: a.employee_name,
					role: a.position,
					rate: `${a.rate_pct}%`,
					start: a.start_date,
					end: a.end_date,
				}))
			: [];

		setMembers(transformedMembers);
	}, [assignments]);

	// 기술스택
	const techStack = project?.tech_stack ?? [];

	// 날짜 포맷팅
	const formatDate = (dateStr?: string | null) => {
		if (!dateStr) return '-';

		return dayjs(dateStr).format('YYYY.MM.DD');
	};

	// 인력 배정 버튼 클릭
	const handleAssignEmployeeProj = () => {
		$router.push(`/project/${id}/assign`);
	};

	// 프로젝트 삭제 API
	const { mutate: removeProject } = useApi<Record<string, never>>(`/api/projects/${id}`, {
		method: 'DELETE',
		type: 'mutation',
	});

	// 프로젝트 삭제 버튼 클릭
	const handleDeleteEmployeeProj = () => {
		
		const assignmentCount = assignments?.length ?? 0;

		  // 1. 투입 인원이 있으면 삭제 불가
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
						onSuccess: async () => {
							openAlert({
								title: '삭제',
								message: '삭제가 완료되었습니다.',
								confirmText: '확인',
								onConfirm: () => {
									$router.push(`/project/project-list`);
								},
							});
						},
						onError: (error: any) => {
							const message = error?.response?.data?.message || error?.message || '철수 처리 중 오류가 발생했습니다.';

							openAlert({
								title: '삭제 처리 실패',
								message,
								confirmText: '확인',
							});
							setDeleteAssignmentId(undefined);
						},
					},
				);
			}
		});
	};
	// 프로젝트 인력 철수 API
	const {
		mutate: removeAssignment,
		isPending: isRemoving,
		invalidateQueries,
	} = useApi<Record<string, never>>(`/api/assignments/${deleteAssignmentId}`, {
		method: 'DELETE',
		type: 'mutation',
	});

	// deleteAssignmentId가 세팅되면 기존 useApi 구조로 DELETE 호출
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
	}, [deleteAssignmentId]);

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
							onClick={() => $router.push(`/project/project-list`)}
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

			{/* 개요 카드 */}
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
								<p className="text-sm text-foreground">{project.description}</p>
							</div>
						</div>

						{/* 진척도 바 */}
						<div>
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
					</>
				) : (
					<p className="text-sm text-gray-500">데이터를 불러올 수 없습니다</p>
				)}
				{/* 기술스택 */}
				<div className="mt-4 bg-card rounded-xl border p-4">
					<h3 className="font-semibold text-foreground text-sm mb-3">기술 스택</h3>
					<div className="flex flex-wrap gap-2">
						{techStack.length > 0 ? (
							techStack.map((t) => (
								<span
									key={t}
									className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium"
								>
									{t}
								</span>
							))
						) : (
							<tr>
								<td
									colSpan={6}
									className="py-8 text-center text-muted-foreground"
								>
									기술 정보가 없습니다.
								</td>
							</tr>
						)}
					</div>
				</div>
			</div>
			{/* 탭 */}
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
			{/* 탭 내용 */}

			{activeTab === 'basic' && <ProjectOverviewTab assignments={assignments} />}

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
					assignments={assignments ?? []}
				/>
			)}

			{/*activeTab === 'contracts' && <ProjectContractTab contracts={employee.contracts ?? []} />*/}

			{/* 탭 내용 */}
			{/* 투입 인력 탭 */}
		</div>
	);
}
