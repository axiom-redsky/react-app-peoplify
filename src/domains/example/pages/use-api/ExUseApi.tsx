import { useApi } from '@axiom/hooks';
import { Cable, FileJson, Globe, KeyRound, RefreshCw, Send } from 'lucide-react';

type TJsonPlaceholderPost = {
	userId: number;
	id: number;
	title: string;
	body: string;
};

type TJsonPlaceholderCreate = {
	title: string;
	body: string;
	userId: number;
};

export default function ExUseApi(): React.ReactNode {
	/** 상수 선언 */
	const CODE_CHIP_CLASS =
		'text-xs font-mono font-semibold px-2 py-0.5 rounded-md border border-amber-400/45 bg-amber-200/75 text-amber-950 shadow-sm dark:border-amber-500/40 dark:bg-amber-950/70 dark:text-amber-100';
	const apiBase = import.meta.env.VITE_EXTERNAL_API_BASE_URL2 as string | undefined;
	const POSTS_ENDPOINT = '/posts' as const;

	/** useApi 훅 호출 */
	const { data: posts, isPending, error, refetch, isFetching } = useApi<TJsonPlaceholderPost[]>(POSTS_ENDPOINT);
	const {
		mutate,
		isPending: isPosting,
		data: postResult,
		error: postError,
		reset: resetMutation,
		invalidateQueries,
	} = useApi<TJsonPlaceholderCreate & { id?: number }, TJsonPlaceholderCreate>(POSTS_ENDPOINT, {
		method: 'POST',
		type: 'mutation',
	});

	/** 미리보기 게시글 목록 8개 추출 */
	const previewPosts = posts?.slice(0, 8) ?? [];

	/** POST 요청 핸들러 */
	const handlePostDemo = (): void => {
		/** POST 요청 실행 */
		mutate(
			{
				title: 'useApi 예제 POST',
				body: 'JSONPlaceholder mock 응답입니다.',
				userId: 1,
			},
			{
				onSuccess: async () => {
					await invalidateQueries(POSTS_ENDPOINT);
				},
			},
		);
	};

	return (
		<div className="p-6 space-y-8 max-w-3xl">
			<div className="flex flex-col gap-2">
				<div className="flex items-center gap-3">
					<div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/20">
						<Globe className="w-5 h-5 text-brand-600 dark:text-brand-400" />
					</div>
					<div>
						<h1 className="text-2xl font-bold text-gray-900 dark:text-white">useApi — HTTP 조회·변경</h1>
						<p className="text-sm text-gray-500 dark:text-gray-400">
							<code className={CODE_CHIP_CLASS}>@axiom/mfe-lib-shared</code>의{' '}
							<code className={CODE_CHIP_CLASS}>useApi</code> 예제입니다. 내부적으로 TanStack Query의{' '}
							<code className={CODE_CHIP_CLASS}>useQuery</code> / <code className={CODE_CHIP_CLASS}>useMutation</code>을
							사용합니다.
						</p>
					</div>
				</div>
			</div>

			<div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
				<div className="flex items-start gap-3">
					<div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0">
						<KeyRound className="w-4 h-4 text-gray-600 dark:text-gray-400" />
					</div>
					<div className="min-w-0 space-y-2">
						<p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
							실제 요청 URL (baseURL + 엔드포인트)
						</p>
						<code className="block break-all rounded-lg bg-gray-50 dark:bg-gray-950 px-3 py-2 text-xs text-gray-800 dark:text-gray-200 font-mono border border-gray-100 dark:border-gray-800">
							{(apiBase ?? '(baseURL 미설정)').replace(/\/$/, '')}
							{POSTS_ENDPOINT}
						</code>
					</div>
				</div>
			</div>

			<div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-5 shadow-sm">
				<div className="flex items-start gap-3">
					<div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0">
						<Cable className="w-4 h-4 text-gray-600 dark:text-gray-400" />
					</div>
					<div className="min-w-0 flex-1 space-y-3">
						<div>
							<p className="text-sm font-medium text-gray-900 dark:text-white">GET — 게시글 목록</p>
							<p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
								<code className="rounded bg-gray-100 px-1 py-0.5 text-[11px] dark:bg-gray-800">
									useApi&lt;Post[]&gt;(&apos;
									{POSTS_ENDPOINT}&apos;)
								</code>
							</p>
						</div>
						<div className="flex flex-wrap gap-2">
							<button
								type="button"
								onClick={() => refetch()}
								disabled={isFetching}
								className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50"
							>
								<RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
								{isFetching ? '다시 가져오는 중…' : '다시 가져오기'}
							</button>
						</div>
						{isPending ? (
							<p className="text-sm text-gray-500 dark:text-gray-400">로딩 중…</p>
						) : error ? (
							<p className="text-sm text-red-600 dark:text-red-400">에러: {error.message}</p>
						) : (
							<div className="space-y-3">
								<p className="text-xs text-gray-500 dark:text-gray-400">
									총 {posts?.length ?? 0}건 — 아래는 앞쪽 {previewPosts.length}건만 요약합니다.
								</p>
								<ul className="space-y-2">
									{previewPosts.map((p) => (
										<li
											key={p.id}
											className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-950/40 px-3 py-2"
										>
											<p className="text-xs font-mono text-gray-500 dark:text-gray-400 mb-0.5">#{p.id}</p>
											<p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-snug">{p.title}</p>
										</li>
									))}
								</ul>
							</div>
						)}
					</div>
				</div>
			</div>

			<div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-5 shadow-sm">
				<div className="flex items-start gap-3">
					<div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0">
						<Send className="w-4 h-4 text-gray-600 dark:text-gray-400" />
					</div>
					<div className="min-w-0 flex-1 space-y-3">
						<div>
							<p className="text-sm font-medium text-gray-900 dark:text-white">POST — mock 생성 + 목록 캐시 무효화</p>
							<p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
								성공 시{' '}
								<code className="rounded bg-gray-100 px-1 py-0.5 text-[11px] dark:bg-gray-800">
									invalidateQueries(&apos;
									{POSTS_ENDPOINT}&apos;)
								</code>
								로 위 GET 캐시를 갱신합니다.
							</p>
						</div>
						<div className="flex flex-wrap gap-2">
							<button
								type="button"
								onClick={handlePostDemo}
								disabled={isPosting}
								className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50"
							>
								<Send className="w-4 h-4" />
								{isPosting ? '요청 중…' : 'POST 실행'}
							</button>
							<button
								type="button"
								onClick={() => resetMutation()}
								className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
							>
								응답 초기화
							</button>
						</div>
						{postError ? (
							<p className="text-sm text-red-600 dark:text-red-400">에러: {postError.message}</p>
						) : postResult ? (
							<pre className="text-xs text-gray-800 dark:text-gray-200 overflow-x-auto whitespace-pre-wrap wrap-break-word font-mono leading-relaxed">
								{JSON.stringify(postResult, null, 2)}
							</pre>
						) : (
							<p className="text-sm text-gray-500 dark:text-gray-400">아직 POST 응답이 없습니다.</p>
						)}
					</div>
				</div>
			</div>

			<div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/50 p-4">
				<div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2 mb-3">
					<FileJson className="w-4 h-4 text-gray-500 shrink-0" />
					<span className="text-xs font-medium text-gray-600 dark:text-gray-400">GET 원본 배열 일부 (디버그용)</span>
				</div>
				{posts && posts.length > 0 ? (
					<pre className="text-xs text-gray-800 dark:text-gray-200 overflow-x-auto whitespace-pre-wrap wrap-break-word font-mono max-h-64 overflow-y-auto">
						{JSON.stringify(posts.slice(0, 3), null, 2)}
					</pre>
				) : (
					<p className="text-sm text-gray-600 dark:text-gray-400">데이터가 없거나 아직 로드되지 않았습니다.</p>
				)}
			</div>
		</div>
	);
}
