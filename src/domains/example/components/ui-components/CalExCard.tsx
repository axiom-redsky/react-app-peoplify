import { CodeBlock } from '@axiom/components/ui';

export interface ICalExCardProps {
	children: React.ReactNode;
	code: string;
	label?: string;
	/** 미리보기 영역 정렬 - 기본값: center */
	align?: 'start' | 'center';
}

/** Calendar 예제 전용 카드 - 미리보기를 가운데 정렬로 표시 */
export default function CalExCard({ children, code, label, align = 'center' }: ICalExCardProps): React.ReactNode {
	return (
		<div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
			{label && (
				<div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
					<span className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</span>
				</div>
			)}
			<div className={`p-5 flex flex-wrap gap-4 ${align === 'center' ? 'justify-center' : 'justify-start'}`}>
				{children}
			</div>
			<div className="border-t border-gray-100 dark:border-gray-800">
				<CodeBlock
					code={code}
					lang="tsx"
					theme="github-dark"
				/>
			</div>
		</div>
	);
}
