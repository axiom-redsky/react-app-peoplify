import type { TAppRoute } from '@/types/router';
import loadable from '@loadable/component';

// 프로젝트 관련 페이지 컴포넌트 로드
const ProjectListPage = loadable(() => import('@/domains/project/pages/ProjectListPage'));
const ProjectAssignPage = loadable(() => import('@/domains/project/pages/ProjectAssignPage'));
const ProjectDetailPage = loadable(() => import('@/domains/project/pages/ProjectDetailPage'));
const ProjectStatusPage = loadable(() => import('@/domains/project/pages/ProjectStatusPage'));
const ProjectRegisterPage = loadable(() => import('@/domains/project/pages/ProjectRegisterPage'));

const routes: TAppRoute[] = [
	{
		path: 'project-list',
		element: <ProjectListPage />,
		name: '프로젝트 목록',
	},
	{
		path: 'new',
		element: <ProjectRegisterPage />,
		name: '프로젝트 등록',
	},
	{
		path: ':id',
		element: <ProjectDetailPage />,
		name: '프로젝트 상세',
	},
	{
		path: 'project-status',
		element: <ProjectStatusPage />,
		name: '프로젝트 투입 현황',
	},
	{
		path: ':id/assign',
		element: <ProjectAssignPage />,
		name: '프로젝트 인력배정',
	},
];

export default routes;
