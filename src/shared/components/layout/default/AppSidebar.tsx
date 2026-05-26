import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { ChevronDownIcon, FileCode, Folder, FolderOpen } from 'lucide-react';
import { useSidebar } from '@/core/hooks/layout/default/useSidebar';
import { navItems, othersItems, type NavItem, type NavSubItem } from './config/navigation';

import logoSvg from '@/assets/images/logo/logo.png';

const isSubGroup = (item: NavSubItem): boolean => Boolean(item.subItems?.length);

const findActiveTrailInSubItems = (items: NavSubItem[], pathname: string): number[] | null => {
	for (let i = 0; i < items.length; i++) {
		const item = items[i];
		if (isSubGroup(item) && item.subItems) {
			const down = findActiveTrailInSubItems(item.subItems, pathname);
			if (down) return [i, ...down];
		} else if (item.path && pathname === item.path) {
			return [i];
		}
	}
	return null;
};

const subTreeHasActivePath = (items: NavSubItem[], pathname: string): boolean =>
	findActiveTrailInSubItems(items, pathname) !== null;

const nestedGroupKey = (menuType: 'main' | 'others', navIndex: number, trail: number[]) =>
	`${menuType}-${navIndex}-n-${trail.join('-')}`;

const trailToNestedOpenKeys = (menuType: 'main' | 'others', navIndex: number, trail: number[]): string[] => {
	const keys: string[] = [];
	for (let d = 1; d < trail.length; d++) {
		keys.push(nestedGroupKey(menuType, navIndex, trail.slice(0, d)));
	}
	return keys;
};

const findMatchedNav = (pathname: string): { type: 'main' | 'others'; index: number; trail: number[] } | null => {
	for (const menuType of ['main', 'others'] as const) {
		const items = menuType === 'main' ? navItems : othersItems;
		for (let index = 0; index < items.length; index++) {
			const nav = items[index];
			if (!nav.subItems) continue;
			const trail = findActiveTrailInSubItems(nav.subItems, pathname);
			if (trail) return { type: menuType, index, trail };
		}
	}
	return null;
};

const AppSidebar: React.FC = () => {
	const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
	const location = useLocation();

	const [openSubmenu, setOpenSubmenu] = useState<{
		type: 'main' | 'others';
		index: number;
	} | null>(null);
	const [openNestedKeys, setOpenNestedKeys] = useState<Set<string>>(() => new Set());
	const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
	const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

	const isActive = useCallback((path: string) => location.pathname === path, [location.pathname]);

	useEffect(() => {
		const matched = findMatchedNav(location.pathname);
		if (!matched) {
			setOpenSubmenu(null);
			setOpenNestedKeys(new Set());
		} else {
			setOpenSubmenu({ type: matched.type, index: matched.index });
			setOpenNestedKeys(new Set(trailToNestedOpenKeys(matched.type, matched.index, matched.trail)));
		}
	}, [location.pathname]);

	useEffect(() => {
		if (openSubmenu === null) return;
		const key = `${openSubmenu.type}-${openSubmenu.index}`;
		const measure = () => {
			if (subMenuRefs.current[key]) {
				setSubMenuHeight((prevHeights) => ({
					...prevHeights,
					[key]: subMenuRefs.current[key]?.scrollHeight || 0,
				}));
			}
		};
		measure();
		const id = requestAnimationFrame(measure);
		return () => cancelAnimationFrame(id);
	}, [openSubmenu, openNestedKeys, location.pathname]);

	const handleSubmenuToggle = (index: number, menuType: 'main' | 'others') => {
		setOpenSubmenu((prevOpenSubmenu) => {
			if (prevOpenSubmenu && prevOpenSubmenu.type === menuType && prevOpenSubmenu.index === index) {
				return null;
			}
			return { type: menuType, index };
		});
	};

	const toggleNestedKey = (key: string) => {
		setOpenNestedKeys((prev) => {
			const next = new Set(prev);
			if (next.has(key)) next.delete(key);
			else next.add(key);
			return next;
		});
	};

	const renderSubNavItems = (
		subItems: NavSubItem[],
		menuType: 'main' | 'others',
		navIndex: number,
		trailPrefix: number[],
	) => (
		<ul
			className={
				trailPrefix.length === 0
					? 'mt-2 space-y-1 ml-9'
					: 'mt-1 space-y-1 border-l border-gray-200 dark:border-gray-700 ml-3 pl-1'
			}
		>
			{subItems.map((subItem, i) => {
				const trail = [...trailPrefix, i];
				if (isSubGroup(subItem) && subItem.subItems) {
					const nk = nestedGroupKey(menuType, navIndex, trail);
					const isOpen = openNestedKeys.has(nk);
					const groupActive = subTreeHasActivePath(subItem.subItems, location.pathname);
					return (
						<li key={nk}>
							<button
								type="button"
								onClick={() => toggleNestedKey(nk)}
								className={`menu-dropdown-item w-full cursor-pointer ${
									groupActive ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'
								}`}
							>
								<span className="menu-item-text text-left flex min-w-0 items-center gap-2">
									{isOpen ? (
										<FolderOpen
											className="h-4 w-4 shrink-0 text-brand-500"
											aria-hidden
										/>
									) : (
										<Folder
											className="h-4 w-4 shrink-0 text-gray-500 dark:text-gray-400"
											aria-hidden
										/>
									)}
									<span className="truncate">{subItem.name}</span>
								</span>
								<ChevronDownIcon
									className={`ml-auto w-4 h-4 shrink-0 transition-transform duration-200 ${
										isOpen ? 'rotate-180 text-brand-500' : ''
									}`}
								/>
							</button>
							{isOpen && renderSubNavItems(subItem.subItems, menuType, navIndex, trail)}
						</li>
					);
				}
				if (!subItem.path) return null;
				const isSecondDepthLeaf = trailPrefix.length === 0;
				const showLeafIcon = Boolean(subItem.icon) || isSecondDepthLeaf;
				const leafIconClass = isActive(subItem.path) ? 'text-brand-500' : 'text-gray-500 dark:text-gray-400';
				return (
					<li key={`${subItem.path}-${trail.join('-')}`}>
						<Link
							to={subItem.path}
							className={`menu-dropdown-item ${
								isActive(subItem.path) ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'
							}`}
						>
							<span className="menu-item-text flex min-w-0 items-center gap-2">
								{showLeafIcon &&
									(subItem.icon ? (
										<span
											className={`inline-flex shrink-0 items-center justify-center [&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0 ${leafIconClass}`}
											aria-hidden
										>
											{subItem.icon}
										</span>
									) : (
										<FileCode
											className={`h-4 w-4 shrink-0 ${leafIconClass}`}
											aria-hidden
										/>
									))}
								<span className="truncate">{subItem.name}</span>
							</span>
							<span className="flex items-center gap-1 ml-auto">
								{subItem.new && (
									<span
										className={`ml-auto ${
											isActive(subItem.path) ? 'menu-dropdown-badge-active' : 'menu-dropdown-badge-inactive'
										} menu-dropdown-badge`}
									>
										new
									</span>
								)}
								{subItem.pro && (
									<span
										className={`ml-auto ${
											isActive(subItem.path) ? 'menu-dropdown-badge-active' : 'menu-dropdown-badge-inactive'
										} menu-dropdown-badge`}
									>
										pro
									</span>
								)}
							</span>
						</Link>
					</li>
				);
			})}
		</ul>
	);

	const renderMenuItems = (items: NavItem[], menuType: 'main' | 'others') => (
		<ul className="flex flex-col gap-4">
			{items.map((nav, index) => (
				<li key={nav.name}>
					{nav.subItems ? (
						<button
							onClick={() => handleSubmenuToggle(index, menuType)}
							className={`menu-item group ${
								openSubmenu?.type === menuType && openSubmenu?.index === index
									? 'menu-item-active'
									: 'menu-item-inactive'
							} cursor-pointer ${!isExpanded && !isHovered ? 'lg:justify-center' : 'lg:justify-start'}`}
						>
							<span
								className={`menu-item-icon-size ${
									openSubmenu?.type === menuType && openSubmenu?.index === index
										? 'menu-item-icon-active'
										: 'menu-item-icon-inactive'
								}`}
							>
								{nav.icon}
							</span>
							{(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">{nav.name}</span>}
							{(isExpanded || isHovered || isMobileOpen) && (
								<ChevronDownIcon
									className={`ml-auto w-5 h-5 transition-transform duration-200 ${
										openSubmenu?.type === menuType && openSubmenu?.index === index ? 'rotate-180 text-brand-500' : ''
									}`}
								/>
							)}
						</button>
					) : (
						nav.path && (
							<Link
								to={nav.path}
								className={`menu-item group ${isActive(nav.path) ? 'menu-item-active' : 'menu-item-inactive'}`}
							>
								<span
									className={`menu-item-icon-size ${
										isActive(nav.path) ? 'menu-item-icon-active' : 'menu-item-icon-inactive'
									}`}
								>
									{nav.icon}
								</span>
								{(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">{nav.name}</span>}
							</Link>
						)
					)}
					{nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
						<div
							ref={(el) => {
								subMenuRefs.current[`${menuType}-${index}`] = el;
							}}
							className="overflow-hidden transition-all duration-300"
							style={{
								height:
									openSubmenu?.type === menuType && openSubmenu?.index === index
										? `${subMenuHeight[`${menuType}-${index}`]}px`
										: '0px',
							}}
						>
							{renderSubNavItems(nav.subItems, menuType, index, [])}
						</div>
					)}
				</li>
			))}
		</ul>
	);

	return (
		<aside
			className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200
        ${isExpanded || isMobileOpen ? 'w-[290px]' : isHovered ? 'w-[290px]' : 'w-[90px]'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0`}
			onMouseEnter={() => !isExpanded && setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<div className={`py-6 flex ${!isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start'}`}>
				<Link to="/">
					{isExpanded || isHovered || isMobileOpen ? (
						<>
							<div className="flex items-center gap-3 dark:hidden">
								<div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-transparent">
									<img
										src={logoSvg}
										alt="mf-app-boilerplate Logo"
										className="size-10 bg-transparent"
									/>
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium text-gray-900">React App Scaffold v1</span>
									<span className="truncate text-xs text-gray-600">react-app-scaffold</span>
								</div>
							</div>
							<div className="hidden dark:flex items-center gap-3">
								<div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-transparent">
									<img
										src={logoSvg}
										alt="mf-app-boilerplate Logo"
										className="size-10 bg-transparent"
									/>
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium text-white">React App Scaffold v1</span>
									<span className="truncate text-xs text-gray-400">react-app-scaffold</span>
								</div>
							</div>
						</>
					) : (
						<img
							src={logoSvg}
							alt="mf-app-boilerplate Logo"
							width={32}
							height={32}
						/>
					)}
				</Link>
			</div>
			<div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
				<nav className="mb-6">
					<div className="flex flex-col gap-4">
						{navItems.length > 0 && (
							<div>
								<h2
									className={`mb-4 text-xs flex leading-[20px] text-gray-400 ${
										!isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start'
									}`}
								>
									{isExpanded || isHovered || isMobileOpen ? 'Examples' : <ChevronDownIcon className="size-6" />}
								</h2>
								{renderMenuItems(navItems, 'main')}
							</div>
						)}
						{othersItems.length > 0 && (
							<div>
								<h2
									className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
										!isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start'
									}`}
								>
									{isExpanded || isHovered || isMobileOpen ? 'Others' : <ChevronDownIcon className="size-6" />}
								</h2>
								{renderMenuItems(othersItems, 'others')}
							</div>
						)}
					</div>
				</nav>
			</div>
		</aside>
	);
};

export default AppSidebar;
