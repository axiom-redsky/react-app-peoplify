import type { TAppRoute } from '@/types/router';
import loadable from '@loadable/component';

const DashboardPage = loadable(() => import('@/publishing/dashboard/pages/DashboardPage'));

const routes: TAppRoute[] = [
	{
		path: 'dashboard',
		element: <DashboardPage />,
		name: '대시보드',
	},
];

export default routes;
