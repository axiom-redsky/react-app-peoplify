import { cn } from '@/shared/utils/cn';

export type ProjectStatusType =
	| 'planned'
	| 'active'
	| 'complete'
	| 'hold';

interface ProjectStatusBadgeProps {
	status?: string | null;
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

const normalizeProjectStatus = (status?: string | null): ProjectStatusType | null => {
	if (!status) return null;

	if (status === 'planned') return 'planned';
	if (status === 'active') return 'active';
	if (status === 'complete') return 'complete';
	if (status === 'hold') return 'hold';

	// 혹시 기존 DB/API 값이 다른 명칭으로 들어오는 경우 방어
	if (status === 'in_progress') return 'active';
	if (status === 'completed') return 'complete';

	if (status === '예정') return 'planned';
	if (status === '진행중') return 'active';
	if (status === '완료') return 'complete';
	if (status === '보류') return 'hold';

	return null;
};

export default function ProjectStatusBadge({
	status,
	className,
}: ProjectStatusBadgeProps): React.ReactNode {
	const normalizedStatus = normalizeProjectStatus(status);
	const config = normalizedStatus
		? projectStatusConfig[normalizedStatus]
		: {
				label: status || '상태없음',
				className:
					'bg-zinc-500/15 text-zinc-600 ring-zinc-500/20 dark:text-zinc-400',
			};

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