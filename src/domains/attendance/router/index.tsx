import type { TAppRoute } from '@/types/router';
import loadable from '@loadable/component';

const MonthlyReportPage = loadable(() => import('@/domains/attendance/pages/MonthlyReportPage'));
const LeaveManagePage = loadable(() => import('@/domains/attendance/pages/LeaveManagePage'));

const routes: TAppRoute[] = [
	{
		path: 'monthly-report',
		element: <MonthlyReportPage />,
		name: '월간 보고서',
	},
	{
		path: 'leave-manage',
		element: <LeaveManagePage />,
		name: '휴가 관리',
	},
];

export default routes;
