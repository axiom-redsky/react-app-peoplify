import { CodeBlock } from '@axiom/components/ui';

export interface ICarouselDemoCardProps {
	label?: string;
	code: string;
	children: React.ReactNode;
	/** 기본값: "p-5 px-16". 세로 캐러셀처럼 상하 여백이 필요할 때 재정의합니다. */
	contentClassName?: string;
}

export default function CarouselDemoCard({
	label,
	code,
	children,
	contentClassName = 'p-5 px-16',
}: ICarouselDemoCardProps): React.ReactNode {
	return (
		<div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
			{label && (
				<div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
					<span className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</span>
				</div>
			)}
			<div className={contentClassName}>{children}</div>
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
