import {
	Layers,
	SquareDashedBottomCode,
	Square,
	FishingHook,
	Badge,
	ListChevronsDownUp,
	GalleryHorizontal,
	CheckSquare2,
	ChevronsUpDown,
	Table2,
	CalendarDays,
} from 'lucide-react';

/** leaf: `path`만 사용. 하위 그룹: `subItems`가 있으면 `path`는 무시됩니다.
 * 2뎁스 leaf에 `icon`이 있으면 사이드바에서 해당 아이콘을 쓰고, 없으면 기본(FileCode) 처리.
 * @example { name: '그룹', subItems: [{ name: '페이지', path: '/path' }] } */
export type NavSubItem = {
	name: string;
	icon?: React.ReactNode;
	path?: string;
	subItems?: NavSubItem[];
	pro?: boolean;
	new?: boolean;
};

export type NavItem = {
	name: string;
	icon: React.ReactNode;
	path?: string;
	subItems?: NavSubItem[];
};

export const navItems: NavItem[] = [
	{
		icon: <Layers />,
		name: 'Dev Examples',
		subItems: [
			{ name: '메인 페이지', path: '/' },
			{ name: '계좌 메인 페이지', path: '/example/account-page' },
		],
	},
	{
		icon: <SquareDashedBottomCode />,
		name: 'UI Components',
		subItems: [
			{ name: 'Accordion', icon: <ListChevronsDownUp />, path: '/example/ui-components/accordion' },
			{ name: 'Badge', icon: <Badge />, path: '/example/ui-components/badge' },
			{ name: 'Button', icon: <Square />, path: '/example/ui-components/button' },
			{ name: 'Carousel', icon: <GalleryHorizontal />, path: '/example/ui-components/carousel' },
			{ name: 'Checkbox', icon: <CheckSquare2 />, path: '/example/ui-components/checkbox' },
			{ name: 'Combobox', icon: <ChevronsUpDown />, path: '/example/ui-components/combobox' },
			{ name: 'Calendar', icon: <CalendarDays />, path: '/example/ui-components/calendar' },
			{ name: 'Data Table', icon: <Table2 />, path: '/example/ui-components/data-table' },
		],
	},
	{
		icon: <SquareDashedBottomCode />,
		name: 'API Examples',
		subItems: [
			{ name: 'useApi', icon: <FishingHook />, path: '/example/use-api' },
			{
				name: 'useClientState예제',
				subItems: [
					{ name: 'useClientState1', path: '/example/use-client-state-1' },
					{ name: 'useClientState2', path: '/example/use-client-state-2' },
				],
			},
		],
	},
];

export const othersItems: NavItem[] = [];
