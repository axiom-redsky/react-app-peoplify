import { useState, useEffect } from 'react';
import { LayoutDefaultSidebarContext } from '@/core/context/layout/default/LayoutDefaultSidebarContext';

export interface ISidebarProviderProps {
	children: React.ReactNode;
}

export default function LayoutDefaultSidebarProvider({ children }: ISidebarProviderProps): React.ReactNode {
	const [isExpanded, setIsExpanded] = useState(true);
	const [isMobileOpen, setIsMobileOpen] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const [isHovered, setIsHovered] = useState(false);
	const [activeItem, setActiveItem] = useState<string | null>(null);
	const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

	useEffect(() => {
		const handleResize = () => {
			const mobile = window.innerWidth < 768;
			setIsMobile(mobile);
			if (!mobile) {
				setIsMobileOpen(false);
			}
		};

		handleResize();
		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, []);

	const toggleSidebar = () => {
		setIsExpanded((prev) => !prev);
	};

	const toggleMobileSidebar = () => {
		setIsMobileOpen((prev) => !prev);
	};

	const toggleSubmenu = (item: string) => {
		setOpenSubmenu((prev) => (prev === item ? null : item));
	};

	return (
		<LayoutDefaultSidebarContext.Provider
			value={{
				isExpanded: isMobile ? false : isExpanded,
				isMobileOpen,
				isHovered,
				activeItem,
				openSubmenu,
				toggleSidebar,
				toggleMobileSidebar,
				setIsHovered,
				setActiveItem,
				toggleSubmenu,
			}}
		>
			{children}
		</LayoutDefaultSidebarContext.Provider>
	);
}
