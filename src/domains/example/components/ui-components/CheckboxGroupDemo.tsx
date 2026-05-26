import { useState } from 'react';
import { CodeBlock } from '@axiom/components/ui';
import { Checkbox } from '@/shared/lib/shadcn/ui/checkbox';

const DESKTOP_ITEMS = [
	{ id: 'hard-disks', label: '하드 디스크' },
	{ id: 'external-disks', label: '외장 디스크' },
	{ id: 'cds-dvds', label: 'CD, DVD, iPod' },
	{ id: 'connected-servers', label: '연결된 서버' },
] as const;

type ItemId = (typeof DESKTOP_ITEMS)[number]['id'];

export default function CheckboxGroupDemo(): React.ReactNode {
	const [selected, setSelected] = useState<Set<ItemId>>(
		new Set(['hard-disks', 'external-disks']),
	);

	const toggle = (id: ItemId) => {
		setSelected((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	const allChecked = selected.size === DESKTOP_ITEMS.length;
	const indeterminate = selected.size > 0 && !allChecked;

	const toggleAll = () => {
		if (allChecked) setSelected(new Set());
		else setSelected(new Set(DESKTOP_ITEMS.map((i) => i.id)));
	};

	return (
		<div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
			<div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
				<span className="text-xs font-medium text-gray-600 dark:text-gray-400">
					체크박스 그룹 (전체 선택 + 개별 선택)
				</span>
			</div>
			<div className="p-5 space-y-3">
				<p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
					바탕화면에 표시할 항목을 선택하세요.
				</p>

				{/* 전체 선택 */}
				<label className="flex items-center gap-2.5 cursor-pointer select-none">
					<Checkbox
						checked={allChecked ? true : indeterminate ? 'indeterminate' : false}
						onCheckedChange={toggleAll}
					/>
					<span className="text-sm font-medium text-gray-800 dark:text-gray-200">전체 선택</span>
				</label>

				<div className="ml-1 pl-4 border-l-2 border-gray-100 dark:border-gray-700 space-y-2.5">
					{DESKTOP_ITEMS.map((item) => (
						<label
							key={item.id}
							className="flex items-center gap-2.5 cursor-pointer select-none"
						>
							<Checkbox
								checked={selected.has(item.id)}
								onCheckedChange={() => toggle(item.id)}
							/>
							<span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
						</label>
					))}
				</div>

				<p className="text-xs text-gray-500 dark:text-gray-400 pt-1">
					선택됨:{' '}
					<span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
						{selected.size} / {DESKTOP_ITEMS.length}
					</span>
				</p>
			</div>
			<div className="border-t border-gray-100 dark:border-gray-800">
				<CodeBlock
					code={`const [selected, setSelected] = useState(new Set(['hard-disks']));

// 전체 선택: indeterminate 상태 지원
<Checkbox
  checked={allChecked ? true : indeterminate ? 'indeterminate' : false}
  onCheckedChange={toggleAll}
/>

// 개별 항목
{ITEMS.map((item) => (
  <Checkbox
    key={item.id}
    checked={selected.has(item.id)}
    onCheckedChange={() => toggle(item.id)}
  />
))}`}
				/>
			</div>
		</div>
	);
}
