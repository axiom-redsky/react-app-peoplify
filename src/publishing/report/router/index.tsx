import type { TAppRoute } from '@/types/router';
import loadable from '@loadable/component';

const ReportPage = loadable(() => import('@/publishing/report/pages/ReportPage'));

const routes: TAppRoute[] = [
	{ path: 'reports', element: <ReportPage />, name: '통계/리포트' },
];

export default routes;
