import type { TAppRoute } from '@/types/router';
import loadable from '@loadable/component';

const EmployeeListPage = loadable(() => import('@/domains/employee/pages/EmployeeListPage'));
const EmployeeFormPage = loadable(() => import('@/domains/employee/pages/EmployeeFormPage'));

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
];

export default routes;
