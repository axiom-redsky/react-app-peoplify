import { useState, useRef, useEffect } from 'react';
import { Calendar, CodeBlock } from '@axiom/components/ui';
import type { DateRange } from 'react-day-picker';

import { CalendarDays, Layers, ChevronDown, X } from 'lucide-react';
import SectionHeader from '@/domains/example/components/ui-components/SectionHeader';
import CalExCard from '@/domains/example/components/ui-components/CalExCard';

/* ── 프리셋 버튼 컴포넌트 ──────────────────────────────────────── */
interface IPresetButtonProps {
	label: string;
	onClick: () => void;
	active: boolean;
}

function PresetButton({ label, onClick, active }: IPresetButtonProps): React.ReactNode {
	return (
		<button
			type="button"
			onClick={onClick}
			className={[
				'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
				active
					? 'bg-primary text-primary-foreground border-primary'
					: 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800',
			].join(' ')}
		>
			{label}
		</button>
	);
}

/* ── 날짜 표시 배지 ───────────────────────────────────────────── */
function DateBadge({ label, value }: { label: string; value?: Date }): React.ReactNode {
	return (
		<span className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 text-xs font-mono font-medium text-gray-700 dark:text-gray-300">
			{label}: {value ? value.toLocaleDateString('ko-KR') : '—'}
		</span>
	);
}

/* ── 메인 컴포넌트 ─────────────────────────────────────────────── */
export default function CalendarComponent(): React.ReactNode {
	/* 1. 기본 단일 선택 */
	const [basicDate, setBasicDate] = useState<Date | undefined>(new Date());

	/* 3. 드롭다운 (월·년 선택) */
	const [dropdownDate, setDropdownDate] = useState<Date | undefined>(new Date());

	/* 4. 프리셋 */
	const [presetDate, setPresetDate] = useState<Date | undefined>(new Date());
	const [activePreset, setActivePreset] = useState<string>('today');

	/* 5. 범위 선택 */
	const [range, setRange] = useState<DateRange | undefined>({
		from: new Date(),
		to: undefined,
	});

	/* 6. 복수 달 표시 */
	const [multiDate, setMultiDate] = useState<Date | undefined>(new Date());

	/* 7. 주 번호 */
	const [weekDate, setWeekDate] = useState<Date | undefined>(new Date());

	/* 8. 비활성화 날짜 (주말 비활성) */
	const [workDate, setWorkDate] = useState<Date | undefined>(undefined);
	const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

	/* 9. Date Picker (버튼 클릭 → 달력 팝업) */
	const [pickerDate, setPickerDate] = useState<Date | undefined>(undefined);
	const [pickerOpen, setPickerOpen] = useState(false);
	const pickerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
				setPickerOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	/* 프리셋 핸들러 */
	const presets: { key: string; label: string; getDate: () => Date }[] = [
		{ key: 'today', label: '오늘', getDate: () => new Date() },
		{
			key: 'tomorrow',
			label: '내일',
			getDate: () => {
				const d = new Date();
				d.setDate(d.getDate() + 1);
				return d;
			},
		},
		{
			key: '3days',
			label: '3일 후',
			getDate: () => {
				const d = new Date();
				d.setDate(d.getDate() + 3);
				return d;
			},
		},
		{
			key: '1week',
			label: '1주일 후',
			getDate: () => {
				const d = new Date();
				d.setDate(d.getDate() + 7);
				return d;
			},
		},
		{
			key: '2weeks',
			label: '2주일 후',
			getDate: () => {
				const d = new Date();
				d.setDate(d.getDate() + 14);
				return d;
			},
		},
	];

	const handlePreset = (key: string, getDate: () => Date) => {
		setActivePreset(key);
		setPresetDate(getDate());
	};

	return (
		<div className="p-6 space-y-8 max-w-3xl">
			{/* ── 페이지 헤더 ─────────────────────────────────────── */}
			<div className="flex items-center gap-3">
				<div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20">
					<CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />
				</div>
				<div>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendar 컴포넌트</h1>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						<code className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded border border-blue-300/50 bg-blue-100/60 text-blue-800 dark:border-blue-600/40 dark:bg-blue-900/30 dark:text-blue-300">
							@axiom/components/ui
						</code>
						에서 제공하는 Calendar 컴포넌트 사용 예제입니다. (react-day-picker 기반)
					</p>
				</div>
			</div>

			{/* ── 1. Basic ─────────────────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="1. Basic (기본 단일 선택)"
					description="mode='single'로 날짜를 하나 선택합니다. rounded-lg border로 외곽선을 추가할 수 있습니다."
				/>
				<CalExCard
					label="mode='single'"
					code={`const [date, setDate] = useState<Date | undefined>(new Date());

<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
  className="rounded-lg border"
/>`}
				>
					<div className="flex flex-col items-center gap-3">
						<Calendar
							mode="single"
							selected={basicDate}
							onSelect={setBasicDate}
							className="rounded-lg border"
						/>
						<DateBadge
							label="선택된 날짜"
							value={basicDate}
						/>
					</div>
				</CalExCard>
			</section>

			{/* ── 2. Range Calendar ───────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="2. Range Calendar (범위 선택)"
					description="mode='range'로 시작일과 종료일을 선택하는 기간 선택 달력입니다."
				/>
				<CalExCard
					label="mode='range'"
					code={`import type { DateRange } from 'react-day-picker';

const [range, setRange] = useState<DateRange | undefined>({
  from: new Date(),
  to: undefined,
});

<Calendar
  mode="range"
  selected={range}
  onSelect={setRange}
  numberOfMonths={2}
  className="rounded-lg border"
/>`}
				>
					<div className="flex flex-col items-center gap-3">
						<Calendar
							mode="range"
							selected={range}
							onSelect={setRange}
							numberOfMonths={2}
							className="rounded-lg border"
						/>
						<div className="flex flex-wrap justify-center gap-2">
							<DateBadge
								label="시작일"
								value={range?.from}
							/>
							<DateBadge
								label="종료일"
								value={range?.to}
							/>
						</div>
					</div>
				</CalExCard>
			</section>

			{/* ── 3. Month & Year Dropdown ────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="3. Month & Year Selector (월·년 드롭다운)"
					description="captionLayout='dropdown'으로 월과 연도를 드롭다운으로 빠르게 이동할 수 있습니다."
				/>
				<CalExCard
					label="captionLayout='dropdown'"
					code={`<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
  captionLayout="dropdown"
  className="rounded-lg border"
/>`}
				>
					<div className="flex flex-col items-center gap-3">
						<Calendar
							mode="single"
							selected={dropdownDate}
							onSelect={setDropdownDate}
							captionLayout="dropdown"
							className="rounded-lg border"
						/>
						<DateBadge
							label="선택된 날짜"
							value={dropdownDate}
						/>
					</div>
				</CalExCard>
			</section>

			{/* ── 4. Presets ──────────────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="4. Presets (빠른 날짜 선택)"
					description="버튼으로 날짜를 빠르게 지정합니다. Calendar와 사이드 버튼 패널을 조합합니다."
				/>
				<div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
					<div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
						<span className="text-xs font-medium text-gray-600 dark:text-gray-400">preset 버튼 + Calendar</span>
					</div>
					<div className="p-5 flex flex-col items-center gap-4">
						<div className="flex flex-wrap justify-center gap-2">
							{presets.map(({ key, label, getDate }) => (
								<PresetButton
									key={key}
									label={label}
									active={activePreset === key}
									onClick={() => handlePreset(key, getDate)}
								/>
							))}
						</div>
						<Calendar
							mode="single"
							selected={presetDate}
							onSelect={(d) => {
								setPresetDate(d);
								setActivePreset('');
							}}
							className="rounded-lg border"
						/>
						<DateBadge
							label="선택된 날짜"
							value={presetDate}
						/>
					</div>
					<div className="border-t border-gray-100 dark:border-gray-800">
						<div className="p-4">
							<pre className="text-xs text-gray-500 dark:text-gray-400 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
								{`const presets = [
  { key: 'today',   label: '오늘',     days: 0  },
  { key: 'tmr',     label: '내일',     days: 1  },
  { key: '3days',   label: '3일 후',   days: 3  },
  { key: '1week',   label: '1주일 후', days: 7  },
  { key: '2weeks',  label: '2주일 후', days: 14 },
];

const handlePreset = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  setDate(d);
};`}
							</pre>
						</div>
					</div>
				</div>
			</section>

			{/* ── 5. Multiple Months ─────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="5. Multiple Months (복수 달 표시)"
					description="numberOfMonths prop으로 한 번에 여러 달을 표시합니다."
				/>
				<CalExCard
					label="numberOfMonths={2}"
					code={`<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
  numberOfMonths={2}
  className="rounded-lg border"
/>`}
				>
					<Calendar
						mode="single"
						selected={multiDate}
						onSelect={setMultiDate}
						numberOfMonths={2}
						className="rounded-lg border"
					/>
				</CalExCard>
			</section>

			{/* ── 6. Week Numbers ────────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="6. Week Numbers (주 번호 표시)"
					description="showWeekNumber prop으로 각 주의 ISO 주 번호를 표시합니다."
				/>
				<CalExCard
					label="showWeekNumber"
					code={`<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
  showWeekNumber
  className="rounded-lg border"
/>`}
				>
					<div className="flex flex-col items-center gap-3">
						<Calendar
							mode="single"
							selected={weekDate}
							onSelect={setWeekDate}
							showWeekNumber
							className="rounded-lg border"
						/>
						<DateBadge
							label="선택된 날짜"
							value={weekDate}
						/>
					</div>
				</CalExCard>
			</section>

			{/* ── 7. Disabled Dates ──────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="7. Disabled Dates (날짜 비활성화)"
					description="disabled prop에 함수를 전달하면 조건에 맞는 날짜를 선택 불가 상태로 만들 수 있습니다. 아래 예제는 주말(토·일)을 비활성화합니다."
				/>
				<CalExCard
					label="disabled: 주말(토·일) 비활성화"
					code={`const isWeekend = (date: Date) =>
  date.getDay() === 0 || date.getDay() === 6;

<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
  disabled={isWeekend}
  className="rounded-lg border"
/>`}
				>
					<div className="flex flex-col items-center gap-3">
						<Calendar
							mode="single"
							selected={workDate}
							onSelect={setWorkDate}
							disabled={isWeekend}
							className="rounded-lg border"
						/>
						<DateBadge
							label="선택된 날짜"
							value={workDate}
						/>
					</div>
				</CalExCard>
			</section>

			{/* ── 8. Outside Days ────────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="8. Outside Days (외부 날짜 숨기기)"
					description="showOutsideDays=false로 현재 달이 아닌 날짜를 숨깁니다. 기본값은 true입니다."
				/>
				<CalExCard
					label="showOutsideDays={false}"
					code={`<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
  showOutsideDays={false}
  className="rounded-lg border"
/>`}
				>
					<Calendar
						mode="single"
						selected={basicDate}
						onSelect={setBasicDate}
						showOutsideDays={false}
						className="rounded-lg border"
					/>
				</CalExCard>
			</section>

			{/* ── 9. Date Picker (버튼 → 달력 팝업) ────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="9. Date Picker (버튼 클릭으로 달력 열기)"
					description="버튼을 클릭하면 달력이 나타납니다. 날짜를 선택하거나 바깥 영역을 클릭하면 닫힙니다."
				/>
				<div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
					<div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
						<span className="text-xs font-medium text-gray-600 dark:text-gray-400">
							useState + useRef + useEffect로 구현한 Date Picker
						</span>
					</div>
					<div className="p-5 flex justify-center">
						<div
							ref={pickerRef}
							className="relative inline-block"
						>
							{/* 트리거 버튼 */}
							<button
								type="button"
								onClick={() => setPickerOpen((v) => !v)}
								className={[
									'inline-flex items-center gap-2 h-9 px-4 rounded-lg border text-sm font-medium transition-colors',
									'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200',
									pickerOpen
										? 'border-blue-400 dark:border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
										: 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500',
								].join(' ')}
							>
								<CalendarDays className="w-4 h-4 text-gray-500 dark:text-gray-400" />
								<span>
									{pickerDate
										? pickerDate.toLocaleDateString('ko-KR', {
												year: 'numeric',
												month: 'long',
												day: 'numeric',
											})
										: '날짜를 선택하세요'}
								</span>
								{pickerDate ? (
									<X
										className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
										onClick={(e) => {
											e.stopPropagation();
											setPickerDate(undefined);
										}}
									/>
								) : (
									<ChevronDown
										className={`w-3.5 h-3.5 text-gray-400 transition-transform ${pickerOpen ? 'rotate-180' : ''}`}
									/>
								)}
							</button>

							{/* 드롭다운 달력 */}
							{pickerOpen && (
								<div className="absolute z-50 mt-1.5 left-0 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg animate-in fade-in-0 zoom-in-95 duration-100">
									<Calendar
										mode="single"
										selected={pickerDate}
										onSelect={(d) => {
											setPickerDate(d);
											setPickerOpen(false);
										}}
										className="p-2"
									/>
								</div>
							)}
						</div>
					</div>
					<div className="border-t border-gray-100 dark:border-gray-800">
						<div className="p-4">
							<CodeBlock
								code={`const [date, setDate] = useState<Date | undefined>(undefined);
const [open, setOpen] = useState(false);
const ref = useRef<HTMLDivElement>(null);

// 바깥 클릭 시 닫기
useEffect(() => {
  const handler = (e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node))
      setOpen(false);
  };
  document.addEventListener('mousedown', handler);
  return () => document.removeEventListener('mousedown', handler);
}, []);

<div ref={ref} className="relative inline-block">
  <button onClick={() => setOpen(v => !v)}>
    <CalendarDays />
    {date ? date.toLocaleDateString('ko-KR') : '날짜를 선택하세요'}
  </button>

  {open && (
    <div className="absolute z-50 mt-1.5 rounded-xl border shadow-lg">
      <Calendar
        mode="single"
        selected={date}
        onSelect={(d) => { setDate(d); setOpen(false); }}
      />
    </div>
  )}
</div>`}
							/>
						</div>
					</div>
				</div>
			</section>

			{/* ── Props 요약 테이블 ──────────────────────────────── */}
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
							{(
								[
									{
										prop: 'mode',
										type: '"single" | "multiple" | "range"',
										def: '"single"',
										desc: '선택 모드 (단일·복수·범위)',
									},
									{
										prop: 'selected',
										type: 'Date | Date[] | DateRange | undefined',
										def: 'undefined',
										desc: '선택된 날짜 값',
									},
									{
										prop: 'onSelect',
										type: 'function',
										def: '—',
										desc: '날짜 선택 시 호출되는 핸들러',
									},
									{
										prop: 'captionLayout',
										type: '"label" | "dropdown"',
										def: '"label"',
										desc: '월·년 표시 방식 (레이블 또는 드롭다운)',
									},
									{
										prop: 'numberOfMonths',
										type: 'number',
										def: '1',
										desc: '동시에 표시할 달력 개수',
									},
									{
										prop: 'showOutsideDays',
										type: 'boolean',
										def: 'true',
										desc: '현재 달 기준 외부 날짜 표시 여부',
									},
									{
										prop: 'showWeekNumber',
										type: 'boolean',
										def: 'false',
										desc: 'ISO 주 번호 표시 여부',
									},
									{
										prop: 'disabled',
										type: 'Date | Date[] | DateRange | ((date: Date) => boolean)',
										def: 'undefined',
										desc: '선택 불가 날짜 지정',
									},
									{
										prop: 'locale',
										type: 'Partial<Locale>',
										def: 'undefined',
										desc: 'react-day-picker 로케일 (다국어)',
									},
									{
										prop: 'className',
										type: 'string',
										def: '—',
										desc: '추가 Tailwind 클래스',
									},
								] as { prop: string; type: string; def: string; desc: string }[]
							).map((row) => (
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

			{/* ── 관련 링크 ─────────────────────────────────────────── */}
			<section className="space-y-3">
				<SectionHeader title="관련 문서" />
				<div className="flex flex-wrap gap-2">
					{[
						{
							label: 'shadcn/ui Calendar 문서',
							href: 'https://ui.shadcn.com/docs/components/calendar',
						},
						{
							label: 'React DayPicker 문서',
							href: 'https://daypicker.dev',
						},
					].map(({ label, href }) => (
						<a
							key={href}
							href={href}
							target="_blank"
							rel="noreferrer"
							className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-xs font-medium text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
						>
							<Layers className="w-3 h-3" />
							{label}
						</a>
					))}
				</div>
			</section>
		</div>
	);
}
