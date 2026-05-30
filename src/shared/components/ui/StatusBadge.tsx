import { cn } from '@/shared/utils/cn';

export type StatusType = 'active' | 'bench' | 'warning' | 'complete' | 'planned';

interface StatusBadgeProps {
	status: StatusType;
	className?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
	active:   { label: '투입중', className: 'bg-emerald-500/15 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400' },
	bench:    { label: '벤치',   className: 'bg-amber-500/15 text-amber-600 ring-amber-500/20 dark:text-amber-400' },
	warning:  { label: '철수임박', className: 'bg-orange-500/15 text-orange-600 ring-orange-500/20 dark:text-orange-400' },
	complete: { label: '완료',   className: 'bg-slate-500/15 text-slate-600 ring-slate-500/20 dark:text-slate-300' },
	planned:  { label: '예정',   className: 'bg-sky-500/15 text-sky-600 ring-sky-500/20 dark:text-sky-400' },
};

export default function StatusBadge({ status, className }: StatusBadgeProps): React.ReactNode {
	const config = statusConfig[status];
	return (
		<span
			className={cn(
				'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
				config.className,
				className,
			)}
		>
			{config.label}
		</span>
	);
}
