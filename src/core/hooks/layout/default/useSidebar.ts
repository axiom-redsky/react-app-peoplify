import { useContext } from 'react';
import { LayoutDefaultSidebarContext } from '@/core/context/layout/default/LayoutDefaultSidebarContext';

export const useSidebar = () => {
	const context = useContext(LayoutDefaultSidebarContext);
	if (!context) {
		throw new Error('useLayoutDefaultSidebar must be used within a LayoutDefaultSidebarProvider');
	}
	return context;
};
