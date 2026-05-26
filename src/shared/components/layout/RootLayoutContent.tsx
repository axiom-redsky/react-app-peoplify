import { Outlet } from 'react-router';
// default template ===============================
import { useSidebar } from '@/core/hooks/layout/default/useSidebar';
import AppSidebar from './default/AppSidebar';
import Backdrop from './default/Backdrop';
import AppHeader from './default/AppHeader';
// default template ===============================

export default function RootLayoutContent(): React.ReactNode {
	const { isExpanded, isHovered, isMobileOpen } = useSidebar();

	// Layout 구조는 프로젝트 상황에 따라 변경하여 사용합니다.
	return (
		<div className="min-h-screen xl:flex bg-gray-50 dark:bg-gray-950">
			<div>
				<AppSidebar />
				<Backdrop />
			</div>
			<div
				className={`flex-1 transition-all duration-300 ease-in-out ${
					isExpanded || isHovered ? 'lg:ml-[290px]' : 'lg:ml-[90px]'
				} ${isMobileOpen ? 'ml-0' : ''}`}
			>
				<AppHeader />
				<div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
					<Outlet />
				</div>
			</div>
		</div>
	);
}
