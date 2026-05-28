import type { TAppRoute } from '@/types/router';
import loadable from '@loadable/component';

const ReportPage = loadable(() => import('@/domains/report/pages/ReportPage'));

const routes: TAppRoute[] = [
	{
		path: 'report',
		element: <ReportPage />,
		name: 'ReportPage',
	},
];

export default routes;
