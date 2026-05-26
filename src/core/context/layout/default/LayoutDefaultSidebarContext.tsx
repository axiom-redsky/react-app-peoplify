import { createContext } from 'react';

type LayoutDefaultSidebarContextType = {
	isExpanded: boolean;
	isMobileOpen: boolean;
	isHovered: boolean;
	activeItem: string | null;
	openSubmenu: string | null;
	toggleSidebar: () => void;
	toggleMobileSidebar: () => void;
	setIsHovered: (isHovered: boolean) => void;
	setActiveItem: (item: string | null) => void;
	toggleSubmenu: (item: string) => void;
};

export const LayoutDefaultSidebarContext = createContext<LayoutDefaultSidebarContextType | undefined>(undefined);
