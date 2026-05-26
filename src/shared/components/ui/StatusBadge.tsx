import { cn } from '@/shared/utils/cn';

export type StatusType = 'active' | 'bench' | 'warning' | 'complete' | 'planned';

interface StatusBadgeProps {
	status: StatusType;
	className?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
	active:   { label: '투입중', className: 'bg-emerald-100 text-emerald-700 ring-emerald-200' },
	bench:    { label: '벤치',   className: 'bg-amber-100 text-amber-700 ring-amber-200' },
	warning:  { label: '철수임박', className: 'bg-orange-100 text-orange-700 ring-orange-200' },
	complete: { label: '완료',   className: 'bg-slate-100 text-slate-600 ring-slate-200' },
	planned:  { label: '예정',   className: 'bg-sky-100 text-sky-700 ring-sky-200' },
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
