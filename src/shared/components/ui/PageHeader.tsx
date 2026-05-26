import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface Breadcrumb {
	label: string;
	path?: string;
}

interface PageHeaderProps {
	title: string;
	breadcrumb?: Breadcrumb[];
	actions?: React.ReactNode;
	className?: string;
}

export default function PageHeader({ title, breadcrumb, actions, className }: PageHeaderProps): React.ReactNode {
	return (
		<div className={cn('flex items-start justify-between mb-6', className)}>
			<div>
				{breadcrumb && breadcrumb.length > 0 && (
					<nav className="flex items-center gap-1 mb-1 text-sm text-muted-foreground">
						{breadcrumb.map((item, index) => (
							<span key={index} className="flex items-center gap-1">
								{index > 0 && <ChevronRight className="w-3.5 h-3.5" />}
								{item.path ? (
									<Link to={item.path} className="hover:text-foreground transition-colors">
										{item.label}
									</Link>
								) : (
									<span>{item.label}</span>
								)}
							</span>
						))}
					</nav>
				)}
				<h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
			</div>
			{actions && (
				<div className="flex items-center gap-2 mt-1">
					{actions}
				</div>
			)}
		</div>
	);
}
