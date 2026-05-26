import { useState } from 'react';
import { Button, CodeBlock } from '@axiom/components/ui';
/** 섹션 헤더 컴포넌트 */
import SectionHeader from '@/domains/example/components/ui-components/SectionHeader';
/** 예제 카드 컴포넌트 */
import ExCard from '@/domains/example/components/ui-components/ExCard';
/** 좋아요 버튼 컴포넌트 */
import LikeButton from '@/domains/example/components/ui-components/LikeButton';

import {
	AlertTriangle,
	Bell,
	ChevronRight,
	Download,
	ExternalLink,
	Layers,
	Loader2,
	Mail,
	MousePointerClick,
	Plus,
	Send,
	Settings,
	Star,
	Trash2,
	ZapIcon,
} from 'lucide-react';

export default function ButtonComponent(): React.ReactNode {
	const [clickCount, setClickCount] = useState(0);
	const [loading, setLoading] = useState(false);

	const handleLoadingClick = () => {
		setLoading(true);
		setTimeout(() => setLoading(false), 2000);
	};

	return (
		<div className="p-6 space-y-8 max-w-3xl">
			{/* ── 페이지 헤더 ─────────────────────────────────────── */}
			<div className="flex items-center gap-3">
				<div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20">
					<Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
				</div>
				<div>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Button 컴포넌트</h1>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						<code className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded border border-blue-300/50 bg-blue-100/60 text-blue-800 dark:border-blue-600/40 dark:bg-blue-900/30 dark:text-blue-300">
							@axiom/components/ui
						</code>
						에서 제공하는 Button 컴포넌트 사용 예제입니다.
					</p>
				</div>
			</div>

			{/* ── 1. Variants ─────────────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="1. Variant (스타일 변형)"
					description="variant prop으로 버튼의 시각적 스타일을 지정합니다."
				/>
				<ExCard
					label="default · outline · secondary · ghost · destructive · link"
					code={`<Button variant="default">Default</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="link">Link</Button>`}
				>
					<Button variant="default">Default</Button>
					<Button variant="outline">Outline</Button>
					<Button variant="secondary">Secondary</Button>
					<Button variant="ghost">Ghost</Button>
					<Button variant="destructive">Destructive</Button>
					<Button variant="link">Link</Button>
				</ExCard>
			</section>

			{/* ── 2. Sizes ────────────────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="2. Size (크기)"
					description="size prop으로 버튼 크기를 조절합니다."
				/>
				<ExCard
					label="xs · sm · default · lg"
					code={`<Button size="xs">Extra Small</Button>
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>`}
				>
					<Button size="xs">Extra Small</Button>
					<Button size="sm">Small</Button>
					<Button size="default">Default</Button>
					<Button size="lg">Large</Button>
				</ExCard>
			</section>

			{/* ── 3. Icon Buttons ─────────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="3. Icon Button (아이콘 전용)"
					description="size를 icon 계열로 설정하면 정사각형 아이콘 버튼이 됩니다."
				/>
				<ExCard
					label="icon-xs · icon-sm · icon · icon-lg"
					code={`<Button size="icon-xs" variant="outline"><Plus /></Button>
<Button size="icon-sm" variant="outline"><Settings /></Button>
<Button size="icon"><Bell /></Button>
<Button size="icon-lg"><Star /></Button>`}
				>
					<Button
						size="icon-xs"
						variant="outline"
					>
						<Plus />
					</Button>
					<Button
						size="icon-sm"
						variant="outline"
					>
						<Settings />
					</Button>
					<Button size="icon">
						<Bell />
					</Button>
					<Button size="icon-lg">
						<Star />
					</Button>
				</ExCard>
			</section>

			{/* ── 4. Button with Icon ─────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="4. 아이콘 + 텍스트 조합"
					description="버튼 안에 아이콘과 텍스트를 함께 사용합니다."
				/>
				<ExCard
					label="leading / trailing icon"
					code={`<Button><Mail /> 이메일 보내기</Button>
<Button variant="outline"><Download /> 다운로드</Button>
<Button variant="secondary"><Send /> 전송<ChevronRight /></Button>
<Button variant="destructive"><Trash2 /> 삭제</Button>
<Button variant="ghost"><ExternalLink /> 열기</Button>`}
				>
					<Button>
						<Mail /> 이메일 보내기
					</Button>
					<Button variant="outline">
						<Download /> 다운로드
					</Button>
					<Button variant="secondary">
						<Send /> 전송
						<ChevronRight />
					</Button>
					<Button variant="destructive">
						<Trash2 /> 삭제
					</Button>
					<Button variant="ghost">
						<ExternalLink /> 열기
					</Button>
				</ExCard>
			</section>

			{/* ── 5. Disabled State ───────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="5. Disabled (비활성화)"
					description="disabled 속성으로 버튼을 비활성화합니다."
				/>
				<ExCard
					label="각 variant disabled 상태"
					code={`<Button disabled>Default</Button>
<Button variant="outline" disabled>Outline</Button>
<Button variant="secondary" disabled>Secondary</Button>
<Button variant="destructive" disabled>Destructive</Button>`}
				>
					<Button disabled>Default</Button>
					<Button
						variant="outline"
						disabled
					>
						Outline
					</Button>
					<Button
						variant="secondary"
						disabled
					>
						Secondary
					</Button>
					<Button
						variant="destructive"
						disabled
					>
						Destructive
					</Button>
				</ExCard>
			</section>

			{/* ── 6. aria-invalid State ───────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="6. aria-invalid (유효성 오류 상태)"
					description="aria-invalid 속성으로 오류 상태를 표현합니다."
				/>
				<ExCard
					label="aria-invalid"
					code={`<Button aria-invalid="true"><AlertTriangle /> 유효성 오류</Button>
<Button variant="outline" aria-invalid="true">오류 Outline</Button>`}
				>
					<Button aria-invalid="true">
						<AlertTriangle /> 유효성 오류
					</Button>
					<Button
						variant="outline"
						aria-invalid="true"
					>
						오류 Outline
					</Button>
				</ExCard>
			</section>

			{/* ── 7. 인터랙티브 예제 ─────────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="7. 인터랙티브 예제"
					description="실제로 클릭해서 동작을 확인해 보세요."
				/>

				{/* 클릭 카운터 */}
				<div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
					<div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
						<span className="text-xs font-medium text-gray-600 dark:text-gray-400">클릭 카운터</span>
					</div>
					<div className="p-5 flex flex-wrap items-center gap-4">
						<Button onClick={() => setClickCount((c) => c + 1)}>
							<MousePointerClick /> 클릭 횟수 증가
						</Button>
						<Button
							variant="outline"
							onClick={() => setClickCount(0)}
						>
							초기화
						</Button>
						<span className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-1.5 text-sm font-mono font-medium text-gray-700 dark:text-gray-300">
							클릭: {clickCount}회
						</span>
					</div>
					<div className="border-t border-gray-100 dark:border-gray-800">
						<CodeBlock
							code={`const [clickCount, setClickCount] = useState(0);

<Button onClick={() => setClickCount(c => c + 1)}>
  <MousePointerClick /> 클릭 횟수 증가
</Button>
<Button variant="outline" onClick={() => setClickCount(0)}>
  초기화
</Button>
<span>클릭: {clickCount}회</span>`}
						/>
					</div>
				</div>

				{/* 로딩 버튼 */}
				<div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
					<div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
						<span className="text-xs font-medium text-gray-600 dark:text-gray-400">로딩 상태 시뮬레이션 (2초)</span>
					</div>
					<div className="p-5 flex flex-wrap items-center gap-4">
						<Button
							onClick={handleLoadingClick}
							disabled={loading}
						>
							{loading ? (
								<>
									<Loader2 className="animate-spin" /> 처리 중...
								</>
							) : (
								<>
									<ZapIcon /> 실행하기
								</>
							)}
						</Button>
						{loading && (
							<span className="text-xs text-gray-500 dark:text-gray-400 animate-pulse">잠시 기다려 주세요...</span>
						)}
					</div>
					<div className="border-t border-gray-100 dark:border-gray-800">
						<CodeBlock
							code={`const [loading, setLoading] = useState(false);

const handleClick = () => {
  setLoading(true);
  setTimeout(() => setLoading(false), 2000);
};

<Button onClick={handleClick} disabled={loading}>
  {loading ? (
    <><Loader2 className="animate-spin" /> 처리 중...</>
  ) : (
    <><ZapIcon /> 실행하기</>
  )}
</Button>`}
						/>
					</div>
				</div>

				{/* 좋아요 버튼 토글 */}
				<LikeButton />
			</section>

			{/* ── 8. asChild 예제 ─────────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="8. asChild (렌더 위임)"
					description="asChild를 사용하면 버튼 스타일을 유지하면서 다른 요소로 렌더링할 수 있습니다."
				/>
				<ExCard
					label="<a> 태그로 렌더링"
					code={`<Button asChild>
  <a href="https://example.com" target="_blank" rel="noreferrer">
    <ExternalLink /> 링크 버튼 (asChild)
  </a>
</Button>`}
				>
					<Button asChild>
						<a
							href="https://example.com"
							target="_blank"
							rel="noreferrer"
						>
							<ExternalLink /> 링크 버튼 (asChild)
						</a>
					</Button>
				</ExCard>
			</section>

			{/* ── Props 요약 테이블 ────────────────────────────────── */}
			<section className="space-y-3">
				<SectionHeader title="Props 요약" />
				<div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
								<th className="text-left px-4 py-2.5 font-medium text-gray-600 dark:text-gray-400 text-xs">Prop</th>
								<th className="text-left px-4 py-2.5 font-medium text-gray-600 dark:text-gray-400 text-xs">타입</th>
								<th className="text-left px-4 py-2.5 font-medium text-gray-600 dark:text-gray-400 text-xs">기본값</th>
								<th className="text-left px-4 py-2.5 font-medium text-gray-600 dark:text-gray-400 text-xs">설명</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100 dark:divide-gray-800">
							{[
								{
									prop: 'variant',
									type: '"default" | "outline" | "secondary" | "ghost" | "destructive" | "link"',
									def: '"default"',
									desc: '버튼의 시각적 스타일',
								},
								{
									prop: 'size',
									type: '"xs" | "sm" | "default" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg"',
									def: '"default"',
									desc: '버튼 크기',
								},
								{ prop: 'asChild', type: 'boolean', def: 'false', desc: 'Slot으로 자식 요소에 렌더링 위임' },
								{ prop: 'disabled', type: 'boolean', def: 'false', desc: '버튼 비활성화' },
								{ prop: 'className', type: 'string', def: '—', desc: '추가 Tailwind 클래스' },
								{ prop: '...props', type: 'ButtonHTMLAttributes', def: '—', desc: '기타 HTML button 속성' },
							].map((row) => (
								<tr
									key={row.prop}
									className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
								>
									<td className="px-4 py-2.5">
										<code className="text-xs font-mono text-blue-700 dark:text-blue-400">{row.prop}</code>
									</td>
									<td className="px-4 py-2.5">
										<code className="text-xs font-mono text-gray-600 dark:text-gray-400">{row.type}</code>
									</td>
									<td className="px-4 py-2.5">
										<code className="text-xs font-mono text-amber-700 dark:text-amber-400">{row.def}</code>
									</td>
									<td className="px-4 py-2.5 text-xs text-gray-600 dark:text-gray-400">{row.desc}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>
		</div>
	);
}
