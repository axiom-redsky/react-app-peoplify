import { useState } from 'react';
import { CodeBlock } from '@axiom/components/ui';
import { Checkbox } from '@/shared/lib/shadcn/ui/checkbox';
import SectionHeader from '@/domains/example/components/ui-components/SectionHeader';
import ExCard from '@/domains/example/components/ui-components/ExCard';
import CheckboxGroupDemo from '@/domains/example/components/ui-components/CheckboxGroupDemo';
import { CheckSquare2 } from 'lucide-react';

export default function CheckboxComponent(): React.ReactNode {
	const [controlled, setControlled] = useState(false);
	const [termsAccepted, setTermsAccepted] = useState(false);
	const [notifEnabled, setNotifEnabled] = useState(true);

	return (
		<div className="p-6 space-y-8 max-w-3xl">
			{/* ── 페이지 헤더 ─────────────────────────────────────── */}
			<div className="flex items-center gap-3">
				<div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20">
					<CheckSquare2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
				</div>
				<div>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Checkbox 컴포넌트</h1>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						<code className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded border border-blue-300/50 bg-blue-100/60 text-blue-800 dark:border-blue-600/40 dark:bg-blue-900/30 dark:text-blue-300">
							@/shared/lib/shadcn/ui/checkbox
						</code>
						에서 제공하는 Checkbox 컴포넌트 사용 예제입니다.
					</p>
				</div>
			</div>

			{/* ── 1. Basic ─────────────────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="1. Basic (기본 사용)"
					description="Checkbox와 label을 함께 사용하는 기본 예제입니다."
				/>
				<ExCard
					label="label + Checkbox 조합"
					code={`<label className="flex items-center gap-2 cursor-pointer select-none">
  <Checkbox defaultChecked />
  <span className="text-sm">이용약관에 동의합니다</span>
</label>`}
				>
					<label className="flex items-center gap-2 cursor-pointer select-none">
						<Checkbox defaultChecked />
						<span className="text-sm text-gray-800 dark:text-gray-200">이용약관에 동의합니다</span>
					</label>
				</ExCard>
			</section>

			{/* ── 2. Checked State ─────────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="2. Checked State (체크 상태)"
					description="defaultChecked(비제어) 또는 checked + onCheckedChange(제어) 방식으로 상태를 관리합니다."
				/>
				<ExCard
					label="비제어(defaultChecked) vs 제어(checked)"
					code={`// 비제어 – 초기 체크 상태만 지정
<Checkbox defaultChecked />

// 제어 – React 상태와 연결
const [checked, setChecked] = useState(false);
<Checkbox checked={checked} onCheckedChange={setChecked} />`}
				>
					<div className="flex flex-col gap-3 w-full">
						<label className="flex items-center gap-2 cursor-pointer select-none">
							<Checkbox defaultChecked />
							<span className="text-sm text-gray-700 dark:text-gray-300">
								비제어 (defaultChecked) — 체크 상태가 컴포넌트 내부에서 관리됩니다
							</span>
						</label>
						<label className="flex items-center gap-2 cursor-pointer select-none">
							<Checkbox
								checked={controlled}
								onCheckedChange={(v) => setControlled(!!v)}
							/>
							<span className="text-sm text-gray-700 dark:text-gray-300">
								제어 (checked) — 현재 상태:{' '}
								<span className="font-mono text-blue-600 dark:text-blue-400">
									{controlled ? 'true' : 'false'}
								</span>
							</span>
						</label>
					</div>
				</ExCard>
			</section>

			{/* ── 3. Description ───────────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="3. Description (설명 텍스트)"
					description="체크박스 아래에 보조 설명을 함께 표시합니다."
				/>
				<ExCard
					label="체크박스 + 설명 텍스트"
					code={`<label className="flex items-start gap-2.5 cursor-pointer select-none">
  <Checkbox className="mt-0.5" />
  <div>
    <p className="text-sm font-medium">이용약관에 동의합니다</p>
    <p className="text-xs text-gray-500">이 체크박스를 클릭하면 서비스 이용약관에 동의하게 됩니다.</p>
  </div>
</label>`}
				>
					<label className="flex items-start gap-2.5 cursor-pointer select-none">
						<Checkbox
							className="mt-0.5"
							checked={termsAccepted}
							onCheckedChange={(v) => setTermsAccepted(!!v)}
						/>
						<div>
							<p className="text-sm font-medium text-gray-800 dark:text-gray-200">
								이용약관에 동의합니다
							</p>
							<p className="text-xs text-gray-500 dark:text-gray-400">
								이 체크박스를 클릭하면 서비스 이용약관에 동의하게 됩니다.
							</p>
						</div>
					</label>
				</ExCard>
			</section>

			{/* ── 4. Disabled ──────────────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="4. Disabled (비활성화)"
					description="disabled prop으로 체크박스 상호작용을 막습니다."
				/>
				<ExCard
					label="disabled 상태 (checked / unchecked)"
					code={`<Checkbox disabled />
<Checkbox disabled defaultChecked />`}
				>
					<label className="flex items-center gap-2 select-none opacity-50 cursor-not-allowed">
						<Checkbox disabled />
						<span className="text-sm text-gray-600 dark:text-gray-400">비활성화 (미체크)</span>
					</label>
					<label className="flex items-center gap-2 select-none opacity-50 cursor-not-allowed">
						<Checkbox
							disabled
							defaultChecked
						/>
						<span className="text-sm text-gray-600 dark:text-gray-400">비활성화 (체크됨)</span>
					</label>
				</ExCard>
			</section>

			{/* ── 5. aria-invalid ──────────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="5. aria-invalid (유효성 오류 상태)"
					description="aria-invalid 속성으로 폼 유효성 검사 오류 상태를 표현합니다."
				/>
				<ExCard
					label="aria-invalid 예제"
					code={`<label className="flex items-start gap-2.5 cursor-pointer select-none">
  <Checkbox aria-invalid="true" className="mt-0.5" />
  <div>
    <p className="text-sm font-medium text-destructive">필수 항목입니다</p>
    <p className="text-xs text-red-500">이용약관에 동의하셔야 계속 진행할 수 있습니다.</p>
  </div>
</label>`}
				>
					<label className="flex items-start gap-2.5 cursor-pointer select-none">
						<Checkbox
							aria-invalid="true"
							className="mt-0.5"
						/>
						<div>
							<p className="text-sm font-medium text-red-600 dark:text-red-400">필수 항목입니다</p>
							<p className="text-xs text-red-500 dark:text-red-400/80">
								이용약관에 동의하셔야 계속 진행할 수 있습니다.
							</p>
						</div>
					</label>
				</ExCard>
			</section>

			{/* ── 6. 알림 설정 인터랙티브 ─────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="6. 인터랙티브 예제 — 알림 설정"
					description="실제로 클릭해서 동작을 확인해 보세요."
				/>
				<div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
					<div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
						<span className="text-xs font-medium text-gray-600 dark:text-gray-400">알림 설정</span>
					</div>
					<div className="p-5 space-y-3">
						<label className="flex items-start gap-2.5 cursor-pointer select-none">
							<Checkbox
								className="mt-0.5"
								checked={notifEnabled}
								onCheckedChange={(v) => setNotifEnabled(!!v)}
							/>
							<div>
								<p className="text-sm font-medium text-gray-800 dark:text-gray-200">
									알림 활성화
								</p>
								<p className="text-xs text-gray-500 dark:text-gray-400">
									언제든지 알림을 켜거나 끌 수 있습니다.
								</p>
							</div>
						</label>
						<p className="text-xs text-gray-500 dark:text-gray-400">
							현재 상태:{' '}
							<span
								className={`font-mono font-semibold ${
									notifEnabled
										? 'text-green-600 dark:text-green-400'
										: 'text-gray-400 dark:text-gray-500'
								}`}
							>
								{notifEnabled ? '알림 ON' : '알림 OFF'}
							</span>
						</p>
					</div>
					<div className="border-t border-gray-100 dark:border-gray-800">
						<CodeBlock
							code={`const [notifEnabled, setNotifEnabled] = useState(true);

<label className="flex items-start gap-2.5 cursor-pointer select-none">
  <Checkbox
    checked={notifEnabled}
    onCheckedChange={(v) => setNotifEnabled(!!v)}
  />
  <div>
    <p className="text-sm font-medium">알림 활성화</p>
    <p className="text-xs text-gray-500">언제든지 알림을 켜거나 끌 수 있습니다.</p>
  </div>
</label>`}
						/>
					</div>
				</div>
			</section>

			{/* ── 7. Group ─────────────────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="7. Group (체크박스 그룹)"
					description="여러 항목을 선택하는 그룹 + 전체 선택(indeterminate) 패턴입니다."
				/>
				<CheckboxGroupDemo />
			</section>

			{/* ── Props 요약 테이블 ────────────────────────────────── */}
			<section className="space-y-3">
				<SectionHeader title="Props 요약" />
				<div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
								<th className="text-left px-4 py-2.5 font-medium text-gray-600 dark:text-gray-400 text-xs">
									Prop
								</th>
								<th className="text-left px-4 py-2.5 font-medium text-gray-600 dark:text-gray-400 text-xs">
									타입
								</th>
								<th className="text-left px-4 py-2.5 font-medium text-gray-600 dark:text-gray-400 text-xs">
									기본값
								</th>
								<th className="text-left px-4 py-2.5 font-medium text-gray-600 dark:text-gray-400 text-xs">
									설명
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100 dark:divide-gray-800">
							{[
								{
									prop: 'checked',
									type: 'boolean | "indeterminate"',
									def: '—',
									desc: '제어 모드에서 체크 상태 (indeterminate 지원)',
								},
								{
									prop: 'defaultChecked',
									type: 'boolean',
									def: 'false',
									desc: '비제어 모드 초기 체크 상태',
								},
								{
									prop: 'onCheckedChange',
									type: '(checked: boolean | "indeterminate") => void',
									def: '—',
									desc: '체크 상태 변경 이벤트 핸들러',
								},
								{
									prop: 'disabled',
									type: 'boolean',
									def: 'false',
									desc: '비활성화 여부',
								},
								{
									prop: 'required',
									type: 'boolean',
									def: 'false',
									desc: '폼 필수 항목 여부',
								},
								{
									prop: 'name',
									type: 'string',
									def: '—',
									desc: '폼 제출 시 사용할 name 속성',
								},
								{
									prop: 'value',
									type: 'string',
									def: '"on"',
									desc: '폼 제출 시 사용할 value 속성',
								},
								{
									prop: 'aria-invalid',
									type: '"true" | "false"',
									def: '—',
									desc: '유효성 오류 상태 표시',
								},
								{
									prop: 'className',
									type: 'string',
									def: '—',
									desc: '추가 Tailwind 클래스',
								},
							].map((row) => (
								<tr
									key={row.prop}
									className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
								>
									<td className="px-4 py-2.5">
										<code className="text-xs font-mono text-blue-700 dark:text-blue-400">
											{row.prop}
										</code>
									</td>
									<td className="px-4 py-2.5">
										<code className="text-xs font-mono text-gray-600 dark:text-gray-400">
											{row.type}
										</code>
									</td>
									<td className="px-4 py-2.5">
										<code className="text-xs font-mono text-amber-700 dark:text-amber-400">
											{row.def}
										</code>
									</td>
									<td className="px-4 py-2.5 text-xs text-gray-600 dark:text-gray-400">
										{row.desc}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>
		</div>
	);
}
