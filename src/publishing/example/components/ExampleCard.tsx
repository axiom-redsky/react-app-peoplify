import { cn } from '@/shared/utils/cn';

interface ExampleCardProps {
	title: string;
	description?: string;
	badge?: string;
	variant?: 'default' | 'success' | 'error' | 'warning';
	className?: string;
}

const variantStyles = {
	default: 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800',
	success: 'border-success-200 bg-success-50 dark:border-success-700 dark:bg-success-950',
	error: 'border-error-200 bg-error-50 dark:border-error-700 dark:bg-error-950',
	warning: 'border-warning-200 bg-warning-50 dark:border-warning-700 dark:bg-warning-950',
};

const badgeStyles = {
	default: 'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400',
	success: 'bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-400',
	error: 'bg-error-100 text-error-700 dark:bg-error-900 dark:text-error-400',
	warning: 'bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-400',
};

export function ExampleCard({
	title,
	description,
	badge,
	variant = 'default',
	className,
}: ExampleCardProps) {
	return (
		<div
			className={cn(
				'rounded-xl border p-5 shadow-theme-sm',
				variantStyles[variant],
				className,
			)}
		>
			<div className="flex items-start justify-between gap-3">
				<h3 className="text-theme-sm font-semibold text-gray-900 dark:text-white">
					{title}
				</h3>
				{badge && (
					<span
						className={cn(
							'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium',
							badgeStyles[variant],
						)}
					>
						{badge}
					</span>
				)}
			</div>
			{description && (
				<p className="mt-2 text-theme-sm text-gray-500 dark:text-gray-400">
					{description}
				</p>
			)}
		</div>
	);
}
