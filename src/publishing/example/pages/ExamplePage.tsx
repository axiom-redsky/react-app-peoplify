import { ExampleCard } from '@/publishing/example/components/ExampleCard';

const cards = [
	{
		title: '브랜드 컬러 토큰',
		description: 'bg-brand-500, text-brand-600, border-brand-200 등 brand 팔레트 활용',
		badge: 'Tokens',
		variant: 'default' as const,
	},
	{
		title: '성공 상태 토큰',
		description: 'success-* 토큰으로 긍정적 피드백 UI를 구성합니다',
		badge: 'Success',
		variant: 'success' as const,
	},
	{
		title: '오류 상태 토큰',
		description: 'error-* 토큰으로 오류 메시지 UI를 구성합니다',
		badge: 'Error',
		variant: 'error' as const,
	},
	{
		title: '경고 상태 토큰',
		description: 'warning-* 토큰으로 주의 사항 UI를 구성합니다',
		badge: 'Warning',
		variant: 'warning' as const,
	},
];

export default function ExamplePage(): React.ReactNode {
	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
			<div className="max-w-3xl mx-auto">
				<header className="mb-8">
					<h1 className="text-title-sm font-semibold text-gray-900 dark:text-white">디자인 토큰 예시 페이지</h1>
					<p className="mt-2 text-theme-sm text-gray-500 dark:text-gray-400">
						primitive 토큰(brand, gray, success, error, warning)과 shadow-theme-* 클래스 활용 예시입니다.
					</p>
				</header>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{cards.map((card) => (
						<ExampleCard
							key={card.title}
							{...card}
						/>
					))}
				</div>

				<section className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-700 dark:bg-gray-800">
					<h2 className="text-theme-xl font-semibold text-gray-900 dark:text-white">Shadow 토큰</h2>
					<div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
						{(
							['shadow-theme-xs', 'shadow-theme-sm', 'shadow-theme-md', 'shadow-theme-lg', 'shadow-theme-xl'] as const
						).map((shadow) => (
							<div
								key={shadow}
								className={`flex h-16 items-center justify-center rounded-lg bg-white dark:bg-gray-700 ${shadow}`}
							>
								<span className="text-xs text-gray-500 dark:text-gray-400">{shadow}</span>
							</div>
						))}
					</div>
				</section>
			</div>
		</div>
	);
}
