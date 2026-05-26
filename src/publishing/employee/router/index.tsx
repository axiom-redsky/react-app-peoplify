import type { TAppRoute } from '@/types/router';
import loadable from '@loadable/component';

const EmployeeListPage = loadable(() => import('@/publishing/employee/pages/EmployeeListPage'));
const EmployeeDetailPage = loadable(() => import('@/publishing/employee/pages/EmployeeDetailPage'));
const EmployeeFormPage = loadable(() => import('@/publishing/employee/pages/EmployeeFormPage'));

const routes: TAppRoute[] = [
	{ path: 'employees', element: <EmployeeListPage />, name: '직원 목록' },
	{ path: 'employees/new', element: <EmployeeFormPage />, name: '직원 등록' },
	{ path: 'employees/:id', element: <EmployeeDetailPage />, name: '직원 상세' },
];

export default routes;
