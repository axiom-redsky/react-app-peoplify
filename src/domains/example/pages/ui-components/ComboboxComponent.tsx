import { useState } from 'react';
import { CodeBlock } from '@axiom/components/ui';
import {
	Combobox,
	ComboboxChip,
	ComboboxChips,
	ComboboxChipsInput,
	ComboboxCollection,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxGroup,
	ComboboxInput,
	ComboboxItem,
	ComboboxLabel,
	ComboboxList,
	ComboboxSeparator,
	ComboboxValue,
} from '@/shared/lib/shadcn/ui/combobox';
import SectionHeader from '@/domains/example/components/ui-components/SectionHeader';
import ExCard from '@/domains/example/components/ui-components/ExCard';
import { ChevronsUpDown } from 'lucide-react';

/* ── 공통 데이터 ──────────────────────────────────────── */
const frameworks = ['Next.js', 'SvelteKit', 'Nuxt.js', 'Remix', 'Astro'];

type Framework = { label: string; value: string };
const frameworkObjects: Framework[] = [
	{ label: 'Next.js', value: 'next' },
	{ label: 'SvelteKit', value: 'sveltekit' },
	{ label: 'Nuxt.js', value: 'nuxt' },
	{ label: 'Remix', value: 'remix' },
	{ label: 'Astro', value: 'astro' },
];

type Country = { label: string; value: string; flag: string };
const countries: Country[] = [
	{ label: '대한민국', value: 'kr', flag: '🇰🇷' },
	{ label: '미국', value: 'us', flag: '🇺🇸' },
	{ label: '일본', value: 'jp', flag: '🇯🇵' },
	{ label: '독일', value: 'de', flag: '🇩🇪' },
	{ label: '프랑스', value: 'fr', flag: '🇫🇷' },
];

const groupedItems = {
	프론트엔드: ['React', 'Vue', 'Svelte', 'Angular'],
	백엔드: ['Node.js', 'Django', 'Spring', 'Rails'],
};

export default function ComboboxComponent(): React.ReactNode {
	const [selected, setSelected] = useState<string>('');
	const [selectedMultiple, setSelectedMultiple] = useState<string[]>([]);

	return (
		<div className="p-6 space-y-8 max-w-3xl">
			{/* ── 페이지 헤더 ─────────────────────────────────────── */}
			<div className="flex items-center gap-3">
				<div className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/20">
					<ChevronsUpDown className="w-5 h-5 text-violet-600 dark:text-violet-400" />
				</div>
				<div>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Combobox 컴포넌트</h1>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						<code className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded border border-violet-300/50 bg-violet-100/60 text-violet-800 dark:border-violet-600/40 dark:bg-violet-900/30 dark:text-violet-300">
							@/shared/lib/shadcn/ui/combobox
						</code>
						에서 제공하는 Combobox 컴포넌트 사용 예제입니다.
					</p>
				</div>
			</div>

			{/* ── 1. Basic ─────────────────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="1. Basic (기본 콤보박스)"
					description="문자열 배열을 items로 전달하는 가장 기본적인 사용법입니다."
				/>
				<ExCard
					label="단순 문자열 목록"
					code={`const frameworks = ['Next.js', 'SvelteKit', 'Nuxt.js', 'Remix', 'Astro'];

<Combobox items={frameworks}>
  <ComboboxInput placeholder="프레임워크 선택..." />
  <ComboboxContent>
    <ComboboxEmpty>검색 결과가 없습니다.</ComboboxEmpty>
    <ComboboxList>
      {(item) => (
        <ComboboxItem key={item} value={item}>
          {item}
        </ComboboxItem>
      )}
    </ComboboxList>
  </ComboboxContent>
</Combobox>`}
				>
					<Combobox items={frameworks}>
						<ComboboxInput placeholder="프레임워크 선택..." />
						<ComboboxContent>
							<ComboboxEmpty>검색 결과가 없습니다.</ComboboxEmpty>
							<ComboboxList>
								{(item) => (
									<ComboboxItem
										key={item}
										value={item}
									>
										{item}
									</ComboboxItem>
								)}
							</ComboboxList>
						</ComboboxContent>
					</Combobox>
				</ExCard>
			</section>

			{/* ── 2. Custom Items ──────────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="2. Custom Items (객체 아이템)"
					description="아이템이 객체일 때 itemToStringValue로 검색 문자열을 지정합니다."
				/>
				<ExCard
					label="{ label, value } 객체 배열"
					code={`type Framework = { label: string; value: string };
const frameworkObjects: Framework[] = [
  { label: 'Next.js', value: 'next' },
  { label: 'SvelteKit', value: 'sveltekit' },
  ...
];

<Combobox
  items={frameworkObjects}
  itemToStringValue={(f) => f.label}
>
  <ComboboxInput placeholder="프레임워크 선택..." />
  <ComboboxContent>
    <ComboboxEmpty>검색 결과가 없습니다.</ComboboxEmpty>
    <ComboboxList>
      {(framework) => (
        <ComboboxItem key={framework.value} value={framework}>
          {framework.label}
        </ComboboxItem>
      )}
    </ComboboxList>
  </ComboboxContent>
</Combobox>`}
				>
					<Combobox
						items={frameworkObjects}
						itemToStringValue={(item) => (item as Framework).label}
					>
						<ComboboxInput placeholder="프레임워크 선택..." />
						<ComboboxContent>
							<ComboboxEmpty>검색 결과가 없습니다.</ComboboxEmpty>
							<ComboboxList>
								{(item) => {
									const f = item as Framework;
									return (
										<ComboboxItem
											key={f.value}
											value={f}
										>
											{f.label}
										</ComboboxItem>
									);
								}}
							</ComboboxList>
						</ComboboxContent>
					</Combobox>
				</ExCard>

				{/* 이모지 + 텍스트 */}
				<ExCard
					label="커스텀 렌더링 (국기 + 국가명)"
					code={`type Country = { label: string; value: string; flag: string };
const countries: Country[] = [
  { label: '대한민국', value: 'kr', flag: '🇰🇷' },
  ...
];

<Combobox
  items={countries}
  itemToStringValue={(c) => c.label}
>
  <ComboboxInput placeholder="국가 선택..." />
  <ComboboxContent>
    <ComboboxEmpty>검색 결과가 없습니다.</ComboboxEmpty>
    <ComboboxList>
      {(country) => (
        <ComboboxItem key={country.value} value={country}>
          <span>{country.flag}</span>
          {country.label}
        </ComboboxItem>
      )}
    </ComboboxList>
  </ComboboxContent>
</Combobox>`}
				>
					<Combobox
						items={countries}
						itemToStringValue={(item) => (item as Country).label}
					>
						<ComboboxInput placeholder="국가 선택..." />
						<ComboboxContent>
							<ComboboxEmpty>검색 결과가 없습니다.</ComboboxEmpty>
							<ComboboxList>
								{(item) => {
									const c = item as Country;
									return (
										<ComboboxItem
											key={c.value}
											value={c}
										>
											<span>{c.flag}</span>
											{c.label}
										</ComboboxItem>
									);
								}}
							</ComboboxList>
						</ComboboxContent>
					</Combobox>
				</ExCard>
			</section>

			{/* ── 3. Multiple Selection ────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="3. Multiple Selection (다중 선택)"
					description="multiple prop과 ComboboxChips를 사용해 복수 선택을 구현합니다."
				/>
				<ExCard
					label="chips 기반 다중 선택"
					code={`const [value, setValue] = useState<string[]>([]);

<Combobox
  items={frameworks}
  multiple
  value={value}
  onValueChange={setValue}
>
  <ComboboxChips>
    <ComboboxValue>
      {value.map((item) => (
        <ComboboxChip key={item}>{item}</ComboboxChip>
      ))}
    </ComboboxValue>
    <ComboboxChipsInput placeholder="프레임워크 추가..." />
  </ComboboxChips>
  <ComboboxContent>
    <ComboboxEmpty>검색 결과가 없습니다.</ComboboxEmpty>
    <ComboboxList>
      {(item) => (
        <ComboboxItem key={item} value={item}>
          {item}
        </ComboboxItem>
      )}
    </ComboboxList>
  </ComboboxContent>
</Combobox>`}
				>
					<Combobox
						items={frameworks}
						multiple
						value={selectedMultiple}
						onValueChange={setSelectedMultiple}
					>
						<ComboboxChips>
							<ComboboxValue>
								{selectedMultiple.map((item) => (
									<ComboboxChip key={item}>{item}</ComboboxChip>
								))}
							</ComboboxValue>
							<ComboboxChipsInput placeholder="프레임워크 추가..." />
						</ComboboxChips>
						<ComboboxContent>
							<ComboboxEmpty>검색 결과가 없습니다.</ComboboxEmpty>
							<ComboboxList>
								{(item) => (
									<ComboboxItem
										key={item}
										value={item}
									>
										{item}
									</ComboboxItem>
								)}
							</ComboboxList>
						</ComboboxContent>
					</Combobox>
				</ExCard>
			</section>

			{/* ── 4. Groups ────────────────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="4. Groups (그룹 구분)"
					description="ComboboxGroup과 ComboboxSeparator로 아이템을 그룹화합니다."
				/>
				<ExCard
					label="ComboboxGroup + ComboboxCollection + ComboboxSeparator"
					code={`const groupedItems = {
  프론트엔드: ['React', 'Vue', 'Svelte', 'Angular'],
  백엔드: ['Node.js', 'Django', 'Spring', 'Rails'],
};
const allItems = Object.values(groupedItems).flat();

<Combobox items={allItems}>
  <ComboboxInput placeholder="기술 스택 선택..." />
  <ComboboxContent>
    <ComboboxEmpty>검색 결과가 없습니다.</ComboboxEmpty>
    <ComboboxList>
      <ComboboxGroup>
        <ComboboxLabel>프론트엔드</ComboboxLabel>
        <ComboboxCollection>
          {(item: string) =>
            groupedItems.프론트엔드.includes(item) ? (
              <ComboboxItem key={item} value={item}>{item}</ComboboxItem>
            ) : null
          }
        </ComboboxCollection>
      </ComboboxGroup>
      <ComboboxSeparator />
      <ComboboxGroup>
        <ComboboxLabel>백엔드</ComboboxLabel>
        <ComboboxCollection>
          {(item: string) =>
            groupedItems.백엔드.includes(item) ? (
              <ComboboxItem key={item} value={item}>{item}</ComboboxItem>
            ) : null
          }
        </ComboboxCollection>
      </ComboboxGroup>
    </ComboboxList>
  </ComboboxContent>
</Combobox>`}
				>
					<Combobox items={Object.values(groupedItems).flat()}>
						<ComboboxInput placeholder="기술 스택 선택..." />
						<ComboboxContent>
							<ComboboxEmpty>검색 결과가 없습니다.</ComboboxEmpty>
							<ComboboxList>
								<ComboboxGroup>
									<ComboboxLabel>프론트엔드</ComboboxLabel>
									<ComboboxCollection>
										{(item: string) =>
											groupedItems.프론트엔드.includes(item) ? (
												<ComboboxItem
													key={item}
													value={item}
												>
													{item}
												</ComboboxItem>
											) : null
										}
									</ComboboxCollection>
								</ComboboxGroup>
								<ComboboxSeparator />
								<ComboboxGroup>
									<ComboboxLabel>백엔드</ComboboxLabel>
									<ComboboxCollection>
										{(item: string) =>
											groupedItems.백엔드.includes(item) ? (
												<ComboboxItem
													key={item}
													value={item}
												>
													{item}
												</ComboboxItem>
											) : null
										}
									</ComboboxCollection>
								</ComboboxGroup>
							</ComboboxList>
						</ComboboxContent>
					</Combobox>
				</ExCard>
			</section>

			{/* ── 5. showClear ─────────────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="5. showClear (지우기 버튼)"
					description="showClear prop을 사용하면 선택값을 빠르게 초기화할 수 있습니다."
				/>
				<ExCard
					label="showClear"
					code={`<Combobox items={frameworks}>
  <ComboboxInput placeholder="프레임워크 선택..." showClear />
  <ComboboxContent>
    <ComboboxEmpty>검색 결과가 없습니다.</ComboboxEmpty>
    <ComboboxList>
      {(item) => (
        <ComboboxItem key={item} value={item}>
          {item}
        </ComboboxItem>
      )}
    </ComboboxList>
  </ComboboxContent>
</Combobox>`}
				>
					<Combobox items={frameworks}>
						<ComboboxInput
							placeholder="프레임워크 선택..."
							showClear
						/>
						<ComboboxContent>
							<ComboboxEmpty>검색 결과가 없습니다.</ComboboxEmpty>
							<ComboboxList>
								{(item) => (
									<ComboboxItem
										key={item}
										value={item}
									>
										{item}
									</ComboboxItem>
								)}
							</ComboboxList>
						</ComboboxContent>
					</Combobox>
				</ExCard>
			</section>

			{/* ── 6. autoHighlight ─────────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="6. autoHighlight (자동 하이라이트)"
					description="필터링 시 첫 번째 아이템을 자동으로 강조 표시합니다."
				/>
				<ExCard
					label="autoHighlight"
					code={`<Combobox items={frameworks} autoHighlight>
  <ComboboxInput placeholder="입력하면 자동 선택..." />
  <ComboboxContent>
    <ComboboxEmpty>검색 결과가 없습니다.</ComboboxEmpty>
    <ComboboxList>
      {(item) => (
        <ComboboxItem key={item} value={item}>
          {item}
        </ComboboxItem>
      )}
    </ComboboxList>
  </ComboboxContent>
</Combobox>`}
				>
					<Combobox
						items={frameworks}
						autoHighlight
					>
						<ComboboxInput placeholder="입력하면 자동 선택..." />
						<ComboboxContent>
							<ComboboxEmpty>검색 결과가 없습니다.</ComboboxEmpty>
							<ComboboxList>
								{(item) => (
									<ComboboxItem
										key={item}
										value={item}
									>
										{item}
									</ComboboxItem>
								)}
							</ComboboxList>
						</ComboboxContent>
					</Combobox>
				</ExCard>
			</section>

			{/* ── 7. Disabled ──────────────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="7. Disabled (비활성화)"
					description="disabled prop으로 전체 입력을 비활성화합니다."
				/>
				<ExCard
					label="disabled"
					code={`<Combobox items={frameworks}>
  <ComboboxInput placeholder="비활성화됨" disabled />
  <ComboboxContent>
    <ComboboxEmpty>검색 결과가 없습니다.</ComboboxEmpty>
    <ComboboxList>
      {(item) => (
        <ComboboxItem key={item} value={item}>
          {item}
        </ComboboxItem>
      )}
    </ComboboxList>
  </ComboboxContent>
</Combobox>`}
				>
					<Combobox items={frameworks}>
						<ComboboxInput
							placeholder="비활성화됨"
							disabled
						/>
						<ComboboxContent>
							<ComboboxEmpty>검색 결과가 없습니다.</ComboboxEmpty>
							<ComboboxList>
								{(item) => (
									<ComboboxItem
										key={item}
										value={item}
									>
										{item}
									</ComboboxItem>
								)}
							</ComboboxList>
						</ComboboxContent>
					</Combobox>
				</ExCard>
			</section>

			{/* ── 8. aria-invalid ──────────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="8. aria-invalid (오류 상태)"
					description="aria-invalid 속성으로 유효성 오류 상태를 시각적으로 표현합니다."
				/>
				<ExCard
					label="aria-invalid"
					code={`<Combobox items={frameworks}>
  <ComboboxInput placeholder="오류 상태" aria-invalid="true" />
  <ComboboxContent>
    <ComboboxEmpty>검색 결과가 없습니다.</ComboboxEmpty>
    <ComboboxList>
      {(item) => (
        <ComboboxItem key={item} value={item}>
          {item}
        </ComboboxItem>
      )}
    </ComboboxList>
  </ComboboxContent>
</Combobox>`}
				>
					<Combobox items={frameworks}>
						<ComboboxInput
							placeholder="오류 상태"
							aria-invalid="true"
						/>
						<ComboboxContent>
							<ComboboxEmpty>검색 결과가 없습니다.</ComboboxEmpty>
							<ComboboxList>
								{(item) => (
									<ComboboxItem
										key={item}
										value={item}
									>
										{item}
									</ComboboxItem>
								)}
							</ComboboxList>
						</ComboboxContent>
					</Combobox>
				</ExCard>
			</section>

			{/* ── 9. 인터랙티브 예제 ───────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="9. 인터랙티브 예제"
					description="실제로 선택해서 동작을 확인해 보세요."
				/>

				{/* 단일 선택 */}
				<div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
					<div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
						<span className="text-xs font-medium text-gray-600 dark:text-gray-400">단일 선택 상태 추적</span>
					</div>
					<div className="p-5 flex flex-wrap items-center gap-4">
						<Combobox
							items={frameworks}
							value={selected}
							onValueChange={(value) => setSelected(value ?? '')}
						>
							<ComboboxInput
								placeholder="프레임워크 선택..."
								showClear
							/>
							<ComboboxContent>
								<ComboboxEmpty>검색 결과가 없습니다.</ComboboxEmpty>
								<ComboboxList>
									{(item) => (
										<ComboboxItem
											key={item}
											value={item}
										>
											{item}
										</ComboboxItem>
									)}
								</ComboboxList>
							</ComboboxContent>
						</Combobox>
						<span className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-1.5 text-sm font-mono font-medium text-gray-700 dark:text-gray-300">
							선택값: {selected || '없음'}
						</span>
					</div>
					<div className="border-t border-gray-100 dark:border-gray-800">
						<CodeBlock
							code={`const [selected, setSelected] = useState('');

<Combobox
  items={frameworks}
  value={selected}
  onValueChange={setSelected}
>
  <ComboboxInput placeholder="프레임워크 선택..." showClear />
  <ComboboxContent>
    <ComboboxEmpty>검색 결과가 없습니다.</ComboboxEmpty>
    <ComboboxList>
      {(item) => (
        <ComboboxItem key={item} value={item}>{item}</ComboboxItem>
      )}
    </ComboboxList>
  </ComboboxContent>
</Combobox>

<span>선택값: {selected || '없음'}</span>`}
						/>
					</div>
				</div>

				{/* 다중 선택 */}
				<div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
					<div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
						<span className="text-xs font-medium text-gray-600 dark:text-gray-400">다중 선택 상태 추적</span>
					</div>
					<div className="p-5 flex flex-wrap items-start gap-4">
						<Combobox
							items={frameworks}
							multiple
							value={selectedMultiple}
							onValueChange={setSelectedMultiple}
						>
							<ComboboxChips>
								<ComboboxValue>
									{selectedMultiple.map((item) => (
										<ComboboxChip key={item}>{item}</ComboboxChip>
									))}
								</ComboboxValue>
								<ComboboxChipsInput placeholder="프레임워크 추가..." />
							</ComboboxChips>
							<ComboboxContent>
								<ComboboxEmpty>검색 결과가 없습니다.</ComboboxEmpty>
								<ComboboxList>
									{(item) => (
										<ComboboxItem
											key={item}
											value={item}
										>
											{item}
										</ComboboxItem>
									)}
								</ComboboxList>
							</ComboboxContent>
						</Combobox>
						<span className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-1.5 text-sm font-mono font-medium text-gray-700 dark:text-gray-300">
							선택 ({selectedMultiple.length}): {selectedMultiple.join(', ') || '없음'}
						</span>
					</div>
					<div className="border-t border-gray-100 dark:border-gray-800">
						<CodeBlock
							code={`const [selected, setSelected] = useState<string[]>([]);

<Combobox
  items={frameworks}
  multiple
  value={selected}
  onValueChange={setSelected}
>
  <ComboboxChips>
    <ComboboxValue>
      {selected.map((item) => (
        <ComboboxChip key={item}>{item}</ComboboxChip>
      ))}
    </ComboboxValue>
    <ComboboxChipsInput placeholder="프레임워크 추가..." />
  </ComboboxChips>
  <ComboboxContent>
    <ComboboxEmpty>검색 결과가 없습니다.</ComboboxEmpty>
    <ComboboxList>
      {(item) => (
        <ComboboxItem key={item} value={item}>{item}</ComboboxItem>
      )}
    </ComboboxList>
  </ComboboxContent>
</Combobox>`}
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
								{ prop: 'items', type: 'T[]', def: '—', desc: '드롭다운 아이템 배열 (문자열 또는 객체)' },
								{
									prop: 'itemToStringValue',
									type: '(item: T) => string',
									def: '—',
									desc: '객체 아이템의 검색용 문자열 변환 함수',
								},
								{ prop: 'value', type: 'string | string[]', def: '—', desc: '선택된 값 (controlled)' },
								{ prop: 'onValueChange', type: '(value) => void', def: '—', desc: '값 변경 콜백' },
								{ prop: 'multiple', type: 'boolean', def: 'false', desc: '다중 선택 활성화' },
								{ prop: 'autoHighlight', type: 'boolean', def: 'false', desc: '필터링 시 첫 번째 아이템 자동 강조' },
								{ prop: 'disabled', type: 'boolean', def: 'false', desc: '입력 비활성화 (ComboboxInput에 적용)' },
								{ prop: 'showClear', type: 'boolean', def: 'false', desc: '지우기 버튼 표시 (ComboboxInput에 적용)' },
								{
									prop: 'showTrigger',
									type: 'boolean',
									def: 'true',
									desc: '토글 트리거 버튼 표시 (ComboboxInput에 적용)',
								},
								{ prop: 'placeholder', type: 'string', def: '—', desc: '입력 필드 placeholder (ComboboxInput에 적용)' },
								{
									prop: 'aria-invalid',
									type: '"true" | "false"',
									def: '—',
									desc: '오류 상태 표시 (ComboboxInput에 적용)',
								},
							].map((row) => (
								<tr
									key={row.prop}
									className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
								>
									<td className="px-4 py-2.5">
										<code className="text-xs font-mono text-violet-700 dark:text-violet-400">{row.prop}</code>
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
