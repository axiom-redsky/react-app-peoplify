import type { TAppRoute } from '@/types/router';
import loadable from '@loadable/component';

const ProjectListPage = loadable(() => import('@/publishing/project/pages/ProjectListPage'));
const ProjectDetailPage = loadable(() => import('@/publishing/project/pages/ProjectDetailPage'));
const ProjectAssignPage = loadable(() => import('@/publishing/project/pages/ProjectAssignPage'));
const ProjectStatusPage = loadable(() => import('@/publishing/project/pages/ProjectStatusPage'));

const routes: TAppRoute[] = [
	{ path: 'projects', element: <ProjectListPage />, name: '프로젝트 목록' },
	{ path: 'projects/status', element: <ProjectStatusPage />, name: '투입 현황' },
	{ path: 'projects/:id', element: <ProjectDetailPage />, name: '프로젝트 상세' },
	{ path: 'projects/:id/assign', element: <ProjectAssignPage />, name: '인력 배정' },
];

export default routes;
