import type { TAppRoute } from '@/types/router';
import loadable from '@loadable/component';

const AccountIndex = loadable(() => import('@/domains/example/pages/AccountIndex'));
const ExUseApi = loadable(() => import('@/domains/example/pages/use-api/ExUseApi'));
const ButtonComponent = loadable(() => import('@/domains/example/pages/ui-components/ButtonComponent'));
const AccordionComponent = loadable(() => import('@/domains/example/pages/ui-components/AccordionComponent'));
const BadgeComponent = loadable(() => import('@/domains/example/pages/ui-components/BadgeComponent'));
const CarouselComponent = loadable(() => import('@/domains/example/pages/ui-components/CarouselComponent'));
const CheckboxComponent = loadable(() => import('@/domains/example/pages/ui-components/CheckboxComponent'));
const ComboboxComponent = loadable(() => import('@/domains/example/pages/ui-components/ComboboxComponent'));
const DataTableComponent = loadable(() => import('@/domains/example/pages/ui-components/DataTableComponent'));
const CalendarComponent = loadable(() => import('@/domains/example/pages/ui-components/CalendarComponent'));

const routes: TAppRoute[] = [
	{
		path: 'account-page',
		element: <AccountIndex />,
		name: '계좌 메인',
	},
	{
		path: 'use-api',
		element: <ExUseApi />,
		name: 'ExUseApi',
	},
	{
		path: 'ui-components/button',
		element: <ButtonComponent />,
		name: '버튼 컴포넌트',
	},
	{
		path: 'ui-components/badge',
		element: <BadgeComponent />,
		name: '뱃지 컴포넌트',
	},
	{
		path: 'ui-components/accordion',
		element: <AccordionComponent />,
		name: '아코디언 컴포넌트',
	},
	{
		path: 'ui-components/carousel',
		element: <CarouselComponent />,
		name: '캐러셀 컴포넌트',
	},
	{
		path: 'ui-components/checkbox',
		element: <CheckboxComponent />,
		name: '체크박스 컴포넌트',
	},
	{
		path: 'ui-components/combobox',
		element: <ComboboxComponent />,
		name: '콤보박스 컴포넌트',
	},
	{
		path: 'ui-components/data-table',
		element: <DataTableComponent />,
		name: 'Data Table 컴포넌트',
	},
	{
		path: 'ui-components/calendar',
		element: <CalendarComponent />,
		name: '캘린더 컴포넌트',
	},
];

export default routes;
