import type { TAppRoute } from '@/types/router';
import loadable from '@loadable/component';

const EmployeeListPage = loadable(() => import('@/domains/employee/pages/EmployeeListPage'));
const EmployeeFormPage = loadable(() => import('@/domains/employee/pages/EmployeeFormPage'));
const EmployeeDetailPage = loadable(() => import('@/domains/employee/pages/EmployeeDetailPage'));
const EmployeeEditPage = loadable(() => import('@/domains/employee/pages/EmployeeEditPage'));

const routes: TAppRoute[] = [
	{
		path: 'employee-list',
		element: <EmployeeListPage />,
		name: '직원 목록',
	},
	{
		path: 'employee-form',
		element: <EmployeeFormPage />,
		name: '직원 등록',
	},
	{
		path: 'employee-detail/:id',
		element: <EmployeeDetailPage />,
		name: '직원 상세',
	},
	{
		path: 'employee-edit/:id',
		element: <EmployeeEditPage />,
		name: '직원 수정',
	},
];

export default routes;
