import type { TAppRoute } from '@/types/router';
import loadable from '@loadable/component';

const MonthlyReportPage = loadable(() => import('@/publishing/attendance/pages/MonthlyReportPage'));
const LeaveManagePage = loadable(() => import('@/publishing/attendance/pages/LeaveManagePage'));

const routes: TAppRoute[] = [
	{ path: 'attendance', element: <MonthlyReportPage />, name: '월별 근무 보고' },
	{ path: 'attendance/leave', element: <LeaveManagePage />, name: '휴가 관리' },
];

export default routes;
