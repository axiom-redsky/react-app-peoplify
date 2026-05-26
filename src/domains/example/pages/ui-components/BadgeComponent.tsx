import { useState } from 'react';
import { Badge, CodeBlock } from '@axiom/components/ui';
import SectionHeader from '@/domains/example/components/ui-components/SectionHeader';
import ExCard from '@/domains/example/components/ui-components/ExCard';
import BadgeCustomColors from '@/domains/example/components/ui-components/BadgeCustomColors';

import {
	BadgeCheck,
	Bookmark,
	Loader2,
	Tag,
	X,
} from 'lucide-react';

export default function BadgeComponent(): React.ReactNode {
	const [tags, setTags] = useState<string[]>(['React', 'TypeScript', 'Tailwind', 'Vite']);
	const [inputValue, setInputValue] = useState('');

	const handleAddTag = () => {
		const trimmed = inputValue.trim();
		if (trimmed && !tags.includes(trimmed)) {
			setTags((prev) => [...prev, trimmed]);
		}
		setInputValue('');
	};

	const handleRemoveTag = (tag: string) => {
		setTags((prev) => prev.filter((t) => t !== tag));
	};

	return (
		<div className="p-6 space-y-8 max-w-3xl">
			{/* ── 페이지 헤더 ─────────────────────────────────────── */}
			<div className="flex items-center gap-3">
				<div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
					<Tag className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
				</div>
				<div>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Badge 컴포넌트</h1>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						<code className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded border border-emerald-300/50 bg-emerald-100/60 text-emerald-800 dark:border-emerald-600/40 dark:bg-emerald-900/30 dark:text-emerald-300">
							@axiom/components/ui
						</code>
						에서 제공하는 Badge 컴포넌트 사용 예제입니다.
					</p>
				</div>
			</div>

			{/* ── 1. Variants ─────────────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="1. Variant (스타일 변형)"
					description="variant prop으로 뱃지의 시각적 스타일을 지정합니다."
				/>
				<ExCard
					label="default · secondary · destructive · outline · ghost · link"
					code={`<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="ghost">Ghost</Badge>
<Badge variant="link">Link</Badge>`}
				>
					<Badge variant="default">Default</Badge>
					<Badge variant="secondary">Secondary</Badge>
					<Badge variant="destructive">Destructive</Badge>
					<Badge variant="outline">Outline</Badge>
					<Badge variant="ghost">Ghost</Badge>
					<Badge variant="link">Link</Badge>
				</ExCard>
			</section>

			{/* ── 2. With Icon ────────────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="2. With Icon (아이콘 포함)"
					description='data-icon="inline-start" 또는 "inline-end" 속성을 아이콘에 지정해 위치를 조절합니다.'
				/>
				<ExCard
					label="inline-start · inline-end"
					code={`<Badge variant="default">
  <BadgeCheck data-icon="inline-start" />
  Verified
</Badge>
<Badge variant="secondary">
  <Bookmark data-icon="inline-start" />
  Bookmark
</Badge>
<Badge variant="outline">
  New
  <BadgeCheck data-icon="inline-end" />
</Badge>`}
				>
					<Badge variant="default">
						<BadgeCheck data-icon="inline-start" />
						Verified
					</Badge>
					<Badge variant="secondary">
						<Bookmark data-icon="inline-start" />
						Bookmark
					</Badge>
					<Badge variant="outline">
						New
						<BadgeCheck data-icon="inline-end" />
					</Badge>
				</ExCard>
			</section>

			{/* ── 3. With Spinner ─────────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="3. With Spinner (로딩 상태)"
					description="뱃지 안에 스피너를 넣어 처리 중 상태를 표현합니다."
				/>
				<ExCard
					label="스피너 + 뱃지"
					code={`<Badge variant="secondary">
  <Loader2 className="animate-spin" data-icon="inline-start" />
  Deleting
</Badge>
<Badge variant="outline">
  <Loader2 className="animate-spin" data-icon="inline-start" />
  Generating
</Badge>`}
				>
					<Badge variant="secondary">
						<Loader2
							className="animate-spin"
							data-icon="inline-start"
						/>
						Deleting
					</Badge>
					<Badge variant="outline">
						<Loader2
							className="animate-spin"
							data-icon="inline-start"
						/>
						Generating
					</Badge>
				</ExCard>
			</section>

			{/* ── 4. Link (asChild) ───────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="4. Link (asChild)"
					description="asChild prop을 사용하면 뱃지 스타일을 유지하면서 <a> 태그로 렌더링할 수 있습니다."
				/>
				<ExCard
					label="asChild — <a> 태그로 렌더링"
					code={`<Badge asChild variant="default">
  <a href="https://example.com" target="_blank" rel="noreferrer">
    Open Link ↗
  </a>
</Badge>
<Badge asChild variant="outline">
  <a href="https://example.com" target="_blank" rel="noreferrer">
    Outline Link
  </a>
</Badge>`}
				>
					<Badge
						asChild
						variant="default"
					>
						<a
							href="https://example.com"
							target="_blank"
							rel="noreferrer"
						>
							Open Link ↗
						</a>
					</Badge>
					<Badge
						asChild
						variant="outline"
					>
						<a
							href="https://example.com"
							target="_blank"
							rel="noreferrer"
						>
							Outline Link
						</a>
					</Badge>
				</ExCard>
			</section>

			{/* ── 5. Custom Colors ────────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="5. Custom Colors (커스텀 색상)"
					description="className으로 배경/텍스트 색상을 자유롭게 커스터마이징합니다."
				/>
				<BadgeCustomColors />
			</section>

			{/* ── 6. 인터랙티브 예제 ─────────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="6. 인터랙티브 예제 — 태그 입력기"
					description="뱃지를 태그 형태로 추가/삭제하는 실용적인 예제입니다."
				/>

				<div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
					<div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
						<span className="text-xs font-medium text-gray-600 dark:text-gray-400">태그 추가 / 삭제</span>
					</div>
					<div className="p-5 space-y-4">
						{/* 태그 목록 */}
						<div className="flex flex-wrap gap-2 min-h-8">
							{tags.length === 0 && (
								<span className="text-xs text-gray-400 dark:text-gray-500 self-center">태그가 없습니다.</span>
							)}
							{tags.map((tag) => (
								<Badge
									key={tag}
									variant="secondary"
									className="cursor-pointer gap-1 pr-1"
								>
									{tag}
									<button
										type="button"
										aria-label={`${tag} 삭제`}
										onClick={() => handleRemoveTag(tag)}
										className="rounded-full hover:bg-gray-300/60 dark:hover:bg-gray-600/60 p-0.5 transition-colors"
									>
										<X className="size-2.5" />
									</button>
								</Badge>
							))}
						</div>
						{/* 입력 */}
						<div className="flex items-center gap-2">
							<input
								type="text"
								value={inputValue}
								onChange={(e) => setInputValue(e.target.value)}
								onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
								placeholder="태그 입력 후 Enter 또는 추가 클릭"
								className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
							/>
							<button
								type="button"
								onClick={handleAddTag}
								className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-3 py-1.5 transition-colors"
							>
								추가
							</button>
						</div>
					</div>
					<div className="border-t border-gray-100 dark:border-gray-800">
						<CodeBlock
							code={`const [tags, setTags] = useState(['React', 'TypeScript', 'Tailwind']);

{tags.map((tag) => (
  <Badge key={tag} variant="secondary" className="gap-1 pr-1">
    {tag}
    <button onClick={() => setTags(prev => prev.filter(t => t !== tag))}>
      <X className="size-2.5" />
    </button>
  </Badge>
))}`}
						/>
					</div>
				</div>
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
									type: '"default" | "secondary" | "destructive" | "outline" | "ghost" | "link"',
									def: '"default"',
									desc: '뱃지의 시각적 스타일',
								},
								{
									prop: 'asChild',
									type: 'boolean',
									def: 'false',
									desc: 'Slot으로 자식 요소에 렌더링 위임',
								},
								{
									prop: 'className',
									type: 'string',
									def: '—',
									desc: '추가 Tailwind 클래스',
								},
								{
									prop: 'data-icon',
									type: '"inline-start" | "inline-end"',
									def: '—',
									desc: '아이콘 위치 지정 (SVG 자식에 부여)',
								},
								{
									prop: '...props',
									type: 'HTMLAttributes<span>',
									def: '—',
									desc: '기타 HTML span 속성',
								},
							].map((row) => (
								<tr
									key={row.prop}
									className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
								>
									<td className="px-4 py-2.5">
										<code className="text-xs font-mono text-emerald-700 dark:text-emerald-400">{row.prop}</code>
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
