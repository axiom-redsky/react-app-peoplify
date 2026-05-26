import type { Meta, StoryObj } from '@storybook/react-vite';
import { useApi } from '@axiom/hooks';

/**
 * useApi — GET 조회 (type: 'query') 데모
 *
 * 실제 API 호출을 시뮬레이션합니다.
 * 실서버 없이 테스트하려면 MSW(Mock Service Worker) 연동을 권장합니다.
 */
function UseApiQueryDemo() {
	const { data, isLoading, isError, error } = useApi<{ userId: number; id: number; title: string }>(
		'https://jsonplaceholder.typicode.com/todos/1',
	);

	if (isLoading) {
		return (
			<div className="flex items-center gap-2 p-4 text-muted-foreground">
				<span className="animate-spin">⏳</span>
				<span>데이터 로딩 중...</span>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive">
				에러: {error?.message}
			</div>
		);
	}

	return (
		<div className="rounded-lg border border-border bg-card p-4">
			<p className="mb-2 text-sm font-semibold text-muted-foreground">응답 데이터</p>
			<pre className="text-sm text-foreground">{JSON.stringify(data, null, 2)}</pre>
		</div>
	);
}

/**
 * useApi — Mutation (type: 'mutation') 데모
 */
function UseApiMutationDemo() {
	const { mutate, isPending, data, isSuccess } = useApi<
		{ id: number; title: string; body: string; userId: number },
		{ title: string; body: string; userId: number }
	>('https://jsonplaceholder.typicode.com/posts', {
		type: 'mutation',
		method: 'POST',
	});

	return (
		<div className="flex flex-col gap-4 p-4">
			<button
				className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
				onClick={() => mutate({ title: '테스트 제목', body: '테스트 내용', userId: 1 })}
				disabled={isPending}
			>
				{isPending ? '전송 중...' : 'POST 요청 실행'}
			</button>

			{isSuccess && (
				<div className="rounded-lg border border-border bg-card p-4">
					<p className="mb-2 text-sm font-semibold text-muted-foreground">생성된 데이터</p>
					<pre className="text-sm text-foreground">{JSON.stringify(data, null, 2)}</pre>
				</div>
			)}
		</div>
	);
}

const meta = {
	title: 'Functions/Hooks/useApi',
	tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Query: Story = {
	name: 'useApi — GET 조회 (query)',
	render: () => <UseApiQueryDemo />,
};

export const Mutation: Story = {
	name: 'useApi — POST 생성 (mutation)',
	render: () => <UseApiMutationDemo />,
};
