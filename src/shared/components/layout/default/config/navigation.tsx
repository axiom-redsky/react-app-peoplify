import {
	LayoutDashboard,
	Users,
	FolderKanban,
	CalendarClock,
	BarChart3,
	UserPlus,
	List,
	Activity,
	CalendarDays,
	ClipboardList,
	LayoutTemplate,
	LogIn,
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
		icon: <LayoutDashboard />,
		name: '대시보드',
		path: '/',
	},
	{
		icon: <Users />,
		name: '직원관리',
		subItems: [
			{ name: '직원 목록', icon: <List />, path: '/employee/employee-list' },
			{ name: '직원 등록', icon: <UserPlus />, path: '/employee/employee-form' },
		],
	},
	{
		icon: <FolderKanban />,
		name: '프로젝트',
		subItems: [
			{ name: '프로젝트 목록', icon: <List />, path: '/projects' },
			{ name: '투입 현황', icon: <Activity />, path: '/projects/status' },
		],
	},
	{
		icon: <CalendarClock />,
		name: '근태관리',
		subItems: [
			{ name: '월별 근무 보고', icon: <ClipboardList />, path: '/attendance' },
			{ name: '휴가 관리', icon: <CalendarDays />, path: '/attendance/leave' },
		],
	},
	{
		icon: <BarChart3 />,
		name: '리포트',
		path: '/reports',
	},
];

export const othersItems: NavItem[] = [
	{
		icon: <LayoutTemplate />,
		name: '대시보드',
		path: '/publishing/dashboard',
	},
	{
		icon: <Users />,
		name: '직원관리',
		subItems: [
			{ name: '직원 목록', icon: <List />, path: '/publishing/employees' },
			{ name: '직원 등록', icon: <UserPlus />, path: '/publishing/employees/new' },
		],
	},
	{
		icon: <FolderKanban />,
		name: '프로젝트',
		subItems: [
			{ name: '프로젝트 목록', icon: <List />, path: '/publishing/projects' },
			{ name: '투입 현황', icon: <Activity />, path: '/publishing/projects/status' },
		],
	},
	{
		icon: <CalendarClock />,
		name: '근태관리',
		subItems: [
			{ name: '월별 근무 보고', icon: <ClipboardList />, path: '/publishing/attendance' },
			{ name: '휴가 관리', icon: <CalendarDays />, path: '/publishing/attendance/leave' },
		],
	},
	{
		icon: <BarChart3 />,
		name: '리포트',
		path: '/publishing/reports',
	},
	{
		icon: <LogIn />,
		name: '로그인',
		path: '/publishing/login',
	},
];
