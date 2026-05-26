import { Badge } from '@axiom/components/ui';
import { CodeBlock } from '@axiom/components/ui';

const COLOR_BADGES = [
	{ label: 'Blue', className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/40' },
	{ label: 'Green', className: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700/40' },
	{ label: 'Sky', className: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-700/40' },
	{ label: 'Purple', className: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700/40' },
	{ label: 'Red', className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700/40' },
	{ label: 'Amber', className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/40' },
];

export default function BadgeCustomColors(): React.ReactNode {
	return (
		<div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
			<div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
				<span className="text-xs font-medium text-gray-600 dark:text-gray-400">커스텀 색상 뱃지</span>
			</div>
			<div className="p-5 flex flex-wrap items-center gap-3">
				{COLOR_BADGES.map(({ label, className }) => (
					<Badge
						key={label}
						variant="outline"
						className={className}
					>
						{label}
					</Badge>
				))}
			</div>
			<div className="border-t border-gray-100 dark:border-gray-800">
				<CodeBlock
					code={`<Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300">
  Blue
</Badge>
<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300">
  Green
</Badge>
<Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300">
  Purple
</Badge>`}
					lang="tsx"
					theme="github-dark"
				/>
			</div>
		</div>
	);
}
