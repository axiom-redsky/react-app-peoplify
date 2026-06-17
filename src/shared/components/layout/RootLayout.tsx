// default template ===============================
import RootLayoutContent from './RootLayoutContent';
import LayoutDefaultSidebarProvider from '@/core/providers/layout/default/LayoutDefaultSidebarProvider';
import { AppAlertProvider } from './default/AppAlertProvider';
// default template ===============================

interface IRootLayoutProps {
	//
}

export default function RootLayout({}: IRootLayoutProps): React.ReactNode {
	return (
		<AppAlertProvider>
			<LayoutDefaultSidebarProvider>
				<RootLayoutContent />
			</LayoutDefaultSidebarProvider>
		</AppAlertProvider>
	);
}
