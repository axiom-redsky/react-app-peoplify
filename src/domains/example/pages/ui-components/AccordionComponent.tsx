import { useState } from 'react';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
	CodeBlock,
} from '@axiom/components/ui';
import SectionHeader from '@/domains/example/components/ui-components/SectionHeader';
import ExCard from '@/domains/example/components/ui-components/ExCard';
import { LayoutList } from 'lucide-react';

export default function AccordionComponent(): React.ReactNode {
	const [openValue, setOpenValue] = useState<string>('');

	return (
		<div className="p-6 space-y-8 max-w-3xl">
			{/* ── 페이지 헤더 ─────────────────────────────────────── */}
			<div className="flex items-center gap-3">
				<div className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/20">
					<LayoutList className="w-5 h-5 text-violet-600 dark:text-violet-400" />
				</div>
				<div>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Accordion 컴포넌트</h1>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						<code className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded border border-violet-300/50 bg-violet-100/60 text-violet-800 dark:border-violet-600/40 dark:bg-violet-900/30 dark:text-violet-300">
							@axiom/components/ui
						</code>
						에서 제공하는 Accordion 컴포넌트 사용 예제입니다.
					</p>
				</div>
			</div>

			{/* ── 1. Basic (Single) ────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="1. Basic — Single (기본)"
					description='type="single" collapsible: 한 번에 하나의 항목만 열리며, 다시 클릭하면 닫힙니다.'
				/>
				<ExCard
					label='type="single" collapsible'
					code={`<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>배송 옵션은 어떻게 되나요?</AccordionTrigger>
    <AccordionContent>
      일반 배송(5~7일), 빠른 배송(2~3일), 당일 배송을 제공합니다.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>반품 정책이 어떻게 되나요?</AccordionTrigger>
    <AccordionContent>
      구매 후 30일 이내에 반품 신청이 가능합니다.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-3">
    <AccordionTrigger>고객 지원에 어떻게 연락하나요?</AccordionTrigger>
    <AccordionContent>
      이메일, 전화, 채팅으로 24시간 지원받을 수 있습니다.
    </AccordionContent>
  </AccordionItem>
</Accordion>`}
				>
					<div className="w-full">
						<Accordion
							type="single"
							collapsible
						>
							<AccordionItem value="item-1">
								<AccordionTrigger>배송 옵션은 어떻게 되나요?</AccordionTrigger>
								<AccordionContent>일반 배송(5~7일), 빠른 배송(2~3일), 당일 배송을 제공합니다. 해외 주문은 무료 배송이 적용됩니다.</AccordionContent>
							</AccordionItem>
							<AccordionItem value="item-2">
								<AccordionTrigger>반품 정책이 어떻게 되나요?</AccordionTrigger>
								<AccordionContent>구매 후 30일 이내에 반품 신청이 가능합니다. 단, 개봉 또는 사용한 상품은 반품이 제한될 수 있습니다.</AccordionContent>
							</AccordionItem>
							<AccordionItem value="item-3">
								<AccordionTrigger>고객 지원에 어떻게 연락하나요?</AccordionTrigger>
								<AccordionContent>이메일(support@example.com), 전화(1588-0000), 채팅으로 24시간 지원받을 수 있습니다.</AccordionContent>
							</AccordionItem>
						</Accordion>
					</div>
				</ExCard>
			</section>

			{/* ── 2. defaultValue ──────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="2. defaultValue (기본 열림 항목)"
					description="defaultValue prop으로 초기에 열려 있을 항목을 지정합니다."
				/>
				<ExCard
					label='defaultValue="item-1"'
					code={`<Accordion type="single" collapsible defaultValue="item-1">
  <AccordionItem value="item-1">
    <AccordionTrigger>비밀번호를 재설정하려면?</AccordionTrigger>
    <AccordionContent>
      로그인 페이지에서 '비밀번호 찾기'를 클릭 후 이메일을 입력하세요.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>구독 플랜을 변경할 수 있나요?</AccordionTrigger>
    <AccordionContent>
      마이페이지 &gt; 구독 관리에서 언제든 변경 가능합니다.
    </AccordionContent>
  </AccordionItem>
</Accordion>`}
				>
					<div className="w-full">
						<Accordion
							type="single"
							collapsible
							defaultValue="item-1"
						>
							<AccordionItem value="item-1">
								<AccordionTrigger>비밀번호를 재설정하려면?</AccordionTrigger>
								<AccordionContent>로그인 페이지에서 '비밀번호 찾기'를 클릭한 후 이메일 주소를 입력하세요. 링크는 24시간 동안 유효합니다.</AccordionContent>
							</AccordionItem>
							<AccordionItem value="item-2">
								<AccordionTrigger>구독 플랜을 변경할 수 있나요?</AccordionTrigger>
								<AccordionContent>마이페이지 &gt; 구독 관리 메뉴에서 언제든 플랜 변경 및 취소가 가능합니다.</AccordionContent>
							</AccordionItem>
						</Accordion>
					</div>
				</ExCard>
			</section>

			{/* ── 3. Multiple ──────────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title='3. type="multiple" (다중 열기)'
					description="여러 항목을 동시에 열 수 있습니다."
				/>
				<ExCard
					label='type="multiple"'
					code={`<Accordion type="multiple">
  <AccordionItem value="item-1">
    <AccordionTrigger>알림 설정</AccordionTrigger>
    <AccordionContent>이메일 알림과 푸시 알림을 설정할 수 있습니다.</AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>개인정보 보호</AccordionTrigger>
    <AccordionContent>데이터 수집 및 쿠키 정책을 관리합니다.</AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-3">
    <AccordionTrigger>결제 및 구독</AccordionTrigger>
    <AccordionContent>결제 수단과 구독 플랜을 확인합니다.</AccordionContent>
  </AccordionItem>
</Accordion>`}
				>
					<div className="w-full">
						<Accordion type="multiple">
							<AccordionItem value="item-1">
								<AccordionTrigger>알림 설정</AccordionTrigger>
								<AccordionContent>이메일 알림과 모바일 기기용 푸시 알림을 켜거나 끌 수 있습니다.</AccordionContent>
							</AccordionItem>
							<AccordionItem value="item-2">
								<AccordionTrigger>개인정보 보호</AccordionTrigger>
								<AccordionContent>데이터 수집, 쿠키 정책, 제3자 공유 설정을 관리할 수 있습니다.</AccordionContent>
							</AccordionItem>
							<AccordionItem value="item-3">
								<AccordionTrigger>결제 및 구독</AccordionTrigger>
								<AccordionContent>등록된 결제 수단 목록과 현재 구독 중인 플랜을 확인하고 변경할 수 있습니다.</AccordionContent>
							</AccordionItem>
						</Accordion>
					</div>
				</ExCard>
			</section>

			{/* ── 4. Disabled ──────────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="4. Disabled (비활성화)"
					description="AccordionItem에 disabled prop을 추가하면 해당 항목을 비활성화합니다."
				/>
				<ExCard
					label="AccordionItem disabled"
					code={`<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>계정 내역 조회</AccordionTrigger>
    <AccordionContent>지난 12개월의 활동 내역을 확인할 수 있습니다.</AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2" disabled>
    <AccordionTrigger>프리미엄 기능 (비활성화)</AccordionTrigger>
    <AccordionContent>이 기능은 프리미엄 플랜에서만 이용 가능합니다.</AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-3">
    <AccordionTrigger>이메일 주소 변경</AccordionTrigger>
    <AccordionContent>설정 페이지에서 이메일 주소를 변경할 수 있습니다.</AccordionContent>
  </AccordionItem>
</Accordion>`}
				>
					<div className="w-full">
						<Accordion
							type="single"
							collapsible
						>
							<AccordionItem value="item-1">
								<AccordionTrigger>계정 내역 조회</AccordionTrigger>
								<AccordionContent>지난 12개월의 활동 내역을 확인할 수 있습니다.</AccordionContent>
							</AccordionItem>
							<AccordionItem
								value="item-2"
								disabled
							>
								<AccordionTrigger>프리미엄 기능 (비활성화)</AccordionTrigger>
								<AccordionContent>이 기능은 프리미엄 플랜에서만 이용 가능합니다.</AccordionContent>
							</AccordionItem>
							<AccordionItem value="item-3">
								<AccordionTrigger>이메일 주소 변경</AccordionTrigger>
								<AccordionContent>설정 페이지에서 이메일 주소를 변경할 수 있습니다.</AccordionContent>
							</AccordionItem>
						</Accordion>
					</div>
				</ExCard>
			</section>

			{/* ── 5. Border Style ──────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="5. Border 스타일"
					description="className으로 border를 추가해 카드형 스타일을 적용합니다."
				/>
				<ExCard
					label="border + rounded 스타일"
					code={`<Accordion
  type="single"
  collapsible
  className="border rounded-xl px-4"
>
  <AccordionItem value="item-1" className="border-b last:border-b-0">
    <AccordionTrigger>결제는 어떻게 이루어지나요?</AccordionTrigger>
    <AccordionContent>...</AccordionContent>
  </AccordionItem>
</Accordion>`}
				>
					<div className="w-full">
						<Accordion
							type="single"
							collapsible
							className="border border-gray-200 dark:border-gray-700 rounded-xl px-4"
						>
							<AccordionItem
								value="item-1"
								className="border-b last:border-b-0 border-gray-200 dark:border-gray-700"
							>
								<AccordionTrigger>결제는 어떻게 이루어지나요?</AccordionTrigger>
								<AccordionContent>월간 및 연간 구독 플랜을 제공하며, 각 주기 시작 시 자동으로 청구됩니다. 언제든지 취소할 수 있습니다.</AccordionContent>
							</AccordionItem>
							<AccordionItem
								value="item-2"
								className="border-b last:border-b-0 border-gray-200 dark:border-gray-700"
							>
								<AccordionTrigger>데이터는 안전한가요?</AccordionTrigger>
								<AccordionContent>모든 데이터는 AES-256으로 암호화되어 저장되며, SSL/TLS로 전송됩니다.</AccordionContent>
							</AccordionItem>
							<AccordionItem
								value="item-3"
								className="border-b last:border-b-0 border-gray-200 dark:border-gray-700"
							>
								<AccordionTrigger>어떤 연동(Integration)을 지원하나요?</AccordionTrigger>
								<AccordionContent>Slack, GitHub, Jira, Notion 등 50개 이상의 서비스와 연동을 지원합니다.</AccordionContent>
							</AccordionItem>
						</Accordion>
					</div>
				</ExCard>
			</section>

			{/* ── 6. 인터랙티브 예제 ─────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="6. 인터랙티브 예제 — Controlled"
					description="value / onValueChange를 사용해 열린 항목을 외부에서 제어합니다."
				/>

				<div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
					<div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
						<span className="text-xs font-medium text-gray-600 dark:text-gray-400">
							현재 열린 항목:{' '}
							<code className="font-mono text-violet-700 dark:text-violet-400">{openValue || '없음'}</code>
						</span>
					</div>
					<div className="p-5 space-y-3">
						<div className="flex flex-wrap gap-2">
							{['item-1', 'item-2', 'item-3'].map((v) => (
								<button
									key={v}
									onClick={() => setOpenValue((prev) => (prev === v ? '' : v))}
									className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
										openValue === v
											? 'bg-violet-600 text-white border-violet-600'
											: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-violet-400'
									}`}
								>
									{v} 열기
								</button>
							))}
							<button
								onClick={() => setOpenValue('')}
								className="px-3 py-1 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 hover:border-gray-400 transition-colors"
							>
								모두 닫기
							</button>
						</div>
						<Accordion
							type="single"
							collapsible
							value={openValue}
							onValueChange={(v) => setOpenValue(v)}
						>
							<AccordionItem value="item-1">
								<AccordionTrigger>스타터 플랜 ($9/월)</AccordionTrigger>
								<AccordionContent>기본 저장 공간, API 접근, 이메일 지원이 포함됩니다. 개인 프로젝트에 적합합니다.</AccordionContent>
							</AccordionItem>
							<AccordionItem value="item-2">
								<AccordionTrigger>프로 플랜 ($29/월)</AccordionTrigger>
								<AccordionContent>스타터의 모든 기능과 함께 우선 지원, 팀 협업 기능, 고급 분석 도구가 제공됩니다.</AccordionContent>
							</AccordionItem>
							<AccordionItem value="item-3">
								<AccordionTrigger>엔터프라이즈 플랜 ($99/월)</AccordionTrigger>
								<AccordionContent>모든 기능과 전담 지원, 무제한 저장 공간, SLA 보장, 커스텀 연동을 제공합니다.</AccordionContent>
							</AccordionItem>
						</Accordion>
					</div>
					<div className="border-t border-gray-100 dark:border-gray-800">
						<CodeBlock
							code={`const [openValue, setOpenValue] = useState('');

<Accordion
  type="single"
  collapsible
  value={openValue}
  onValueChange={(v) => setOpenValue(v)}
>
  <AccordionItem value="item-1">
    <AccordionTrigger>스타터 플랜</AccordionTrigger>
    <AccordionContent>...</AccordionContent>
  </AccordionItem>
</Accordion>`}
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
								<th className="text-left px-4 py-2.5 font-medium text-gray-600 dark:text-gray-400 text-xs">컴포넌트</th>
								<th className="text-left px-4 py-2.5 font-medium text-gray-600 dark:text-gray-400 text-xs">Prop</th>
								<th className="text-left px-4 py-2.5 font-medium text-gray-600 dark:text-gray-400 text-xs">타입</th>
								<th className="text-left px-4 py-2.5 font-medium text-gray-600 dark:text-gray-400 text-xs">설명</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100 dark:divide-gray-800">
							{[
								{
									component: 'Accordion',
									prop: 'type',
									type: '"single" | "multiple"',
									desc: '동시에 열 수 있는 항목 수 제어',
								},
								{
									component: 'Accordion',
									prop: 'collapsible',
									type: 'boolean',
									desc: 'single 모드에서 열린 항목을 다시 닫을 수 있도록 허용',
								},
								{
									component: 'Accordion',
									prop: 'defaultValue',
									type: 'string | string[]',
									desc: '초기에 열려 있을 항목의 value (비제어)',
								},
								{
									component: 'Accordion',
									prop: 'value',
									type: 'string | string[]',
									desc: '현재 열린 항목 (제어 모드)',
								},
								{
									component: 'Accordion',
									prop: 'onValueChange',
									type: '(value: string) => void',
									desc: '열린 항목이 변경될 때 호출되는 콜백',
								},
								{
									component: 'AccordionItem',
									prop: 'value',
									type: 'string',
									desc: '항목을 식별하는 고유 키 (필수)',
								},
								{
									component: 'AccordionItem',
									prop: 'disabled',
									type: 'boolean',
									desc: '항목 비활성화',
								},
							].map((row, i) => (
								<tr
									key={i}
									className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
								>
									<td className="px-4 py-2.5">
										<code className="text-xs font-mono text-violet-700 dark:text-violet-400">{row.component}</code>
									</td>
									<td className="px-4 py-2.5">
										<code className="text-xs font-mono text-blue-700 dark:text-blue-400">{row.prop}</code>
									</td>
									<td className="px-4 py-2.5">
										<code className="text-xs font-mono text-gray-600 dark:text-gray-400">{row.type}</code>
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
