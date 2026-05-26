// default template ===============================
import RootLayoutContent from './RootLayoutContent';
import LayoutDefaultSidebarProvider from '@/core/providers/layout/default/LayoutDefaultSidebarProvider';
// default template ===============================

interface IRootLayoutProps {
	//
}

export default function RootLayout({}: IRootLayoutProps): React.ReactNode {
	return (
		<LayoutDefaultSidebarProvider>
			<RootLayoutContent />
		</LayoutDefaultSidebarProvider>
	);
}
