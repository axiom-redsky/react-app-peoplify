import type { TAppRoute } from '@/types/router';
import loadable from '@loadable/component';

// 프로젝트 관련 페이지 컴포넌트 로드
const ProjectListPage = loadable(() => import('@/domains/project/pages/ProjectListPage'));
const ProjectAssignPage = loadable(() => import('@/domains/project/pages/ProjectAssignPage'));

const routes: TAppRoute[] = [
	{
		path: 'project-list',
		element: <ProjectListPage />,
		name: '프로젝트 목록',
	},
	{
		path: 'project-assign',
		element: <ProjectAssignPage />,
		name: '프로젝트 담당자 할당',
	},
];

export default routes;