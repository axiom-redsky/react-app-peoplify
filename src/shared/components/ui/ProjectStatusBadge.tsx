import { cn } from '@/shared/utils/cn';

export type ProjectStatusType =
	| 'planned'
	| 'active'
	| 'complete'
	| 'hold';

interface ProjectStatusBadgeProps {
	status: ProjectStatusType;
	className?: string;
}

const projectStatusConfig: Record<ProjectStatusType, { label: string; className: string }> = {
	planned: {
		label: '예정',
		className:
			'bg-sky-500/15 text-sky-600 ring-sky-500/20 dark:text-sky-400',
	},
	active: {
		label: '진행중',
		className:
			'bg-emerald-500/15 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400',
	},
	complete: {
		label: '완료',
		className:
			'bg-slate-500/15 text-slate-600 ring-slate-500/20 dark:text-slate-400',
	},
	hold: {
		label: '보류',
		className:
			'bg-zinc-500/15 text-zinc-600 ring-zinc-500/20 dark:text-zinc-400',
	},
};

export default function ProjectStatusBadge({
	status,
	className,
}: ProjectStatusBadgeProps): React.ReactNode {
	const config = projectStatusConfig[status];

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