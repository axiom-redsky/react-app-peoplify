import { useRef } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import SectionHeader from '@/domains/example/components/ui-components/SectionHeader';
import CarouselDemoCard from '@/domains/example/components/ui-components/CarouselDemoCard';
import ApiCarouselDemo from '@/domains/example/components/ui-components/ApiCarouselDemo';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from '@/shared/lib/shadcn/ui/carousel';
import { GalleryHorizontal } from 'lucide-react';

const SLIDE_COLORS = [
	'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300',
	'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300',
	'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300',
	'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300',
	'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300',
];

export default function CarouselComponent(): React.ReactNode {
	const autoplayPlugin = useRef(Autoplay({ delay: 2000, stopOnInteraction: true }));

	return (
		<div className="p-6 space-y-8 max-w-3xl">
			{/* ── 페이지 헤더 ─────────────────────────────────────── */}
			<div className="flex items-center gap-3">
				<div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20">
					<GalleryHorizontal className="w-5 h-5 text-blue-600 dark:text-blue-400" />
				</div>
				<div>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Carousel 컴포넌트</h1>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						<code className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded border border-blue-300/50 bg-blue-100/60 text-blue-800 dark:border-blue-600/40 dark:bg-blue-900/30 dark:text-blue-300">
							@/shared/lib/shadcn/ui/carousel
						</code>
						에서 제공하는 Embla 기반 Carousel 컴포넌트 사용 예제입니다.
					</p>
				</div>
			</div>

			{/* ── 1. 기본 사용법 ───────────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="1. 기본 사용법"
					description="Carousel · CarouselContent · CarouselItem · CarouselPrevious · CarouselNext를 조합해 슬라이드를 구성합니다."
				/>
				<CarouselDemoCard
					label="기본 슬라이드 (5개 아이템)"
					code={`import {
  Carousel, CarouselContent, CarouselItem,
  CarouselPrevious, CarouselNext,
} from "@/shared/lib/shadcn/ui/carousel";

<Carousel>
  <CarouselContent>
    <CarouselItem>...</CarouselItem>
    <CarouselItem>...</CarouselItem>
    <CarouselItem>...</CarouselItem>
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>`}
				>
					<Carousel>
						<CarouselContent>
							{SLIDE_COLORS.map((color, i) => (
								<CarouselItem key={i}>
									<div
										className={`flex items-center justify-center h-32 rounded-xl text-4xl font-bold ${color}`}
									>
										{i + 1}
									</div>
								</CarouselItem>
							))}
						</CarouselContent>
						<CarouselPrevious />
						<CarouselNext />
					</Carousel>
				</CarouselDemoCard>
			</section>

			{/* ── 2. 크기 ─────────────────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="2. 크기 (Sizes)"
					description="CarouselItem의 basis 클래스로 한 화면에 보이는 슬라이드 수를 조절합니다."
				/>
				<CarouselDemoCard
					label="basis-1/3 — 한 번에 3개씩 표시"
					code={`<Carousel>
  <CarouselContent>
    <CarouselItem className="basis-1/3">...</CarouselItem>
    <CarouselItem className="basis-1/3">...</CarouselItem>
  </CarouselContent>
</Carousel>`}
				>
					<Carousel>
						<CarouselContent>
							{SLIDE_COLORS.map((color, i) => (
								<CarouselItem
									key={i}
									className="basis-1/3"
								>
									<div
										className={`flex items-center justify-center h-24 rounded-xl text-2xl font-bold ${color}`}
									>
										{i + 1}
									</div>
								</CarouselItem>
							))}
						</CarouselContent>
						<CarouselPrevious />
						<CarouselNext />
					</Carousel>
				</CarouselDemoCard>
				<CarouselDemoCard
					label="md:basis-1/2 lg:basis-1/3 — 반응형 크기"
					code={`<CarouselItem className="md:basis-1/2 lg:basis-1/3">...</CarouselItem>`}
				>
					<Carousel>
						<CarouselContent>
							{SLIDE_COLORS.map((color, i) => (
								<CarouselItem
									key={i}
									className="md:basis-1/2 lg:basis-1/3"
								>
									<div
										className={`flex items-center justify-center h-24 rounded-xl text-2xl font-bold ${color}`}
									>
										{i + 1}
									</div>
								</CarouselItem>
							))}
						</CarouselContent>
						<CarouselPrevious />
						<CarouselNext />
					</Carousel>
				</CarouselDemoCard>
			</section>

			{/* ── 3. 간격 ─────────────────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="3. 간격 (Spacing)"
					description="CarouselContent에 -ml-[VALUE], CarouselItem에 pl-[VALUE]를 사용해 슬라이드 간 간격을 조정합니다."
				/>
				<CarouselDemoCard
					label="-ml-4 / pl-4 조합 (basis-1/2)"
					code={`<Carousel>
  <CarouselContent className="-ml-4">
    <CarouselItem className="pl-4 basis-1/2">...</CarouselItem>
    <CarouselItem className="pl-4 basis-1/2">...</CarouselItem>
  </CarouselContent>
</Carousel>`}
				>
					<Carousel>
						<CarouselContent className="-ml-4">
							{SLIDE_COLORS.map((color, i) => (
								<CarouselItem
									key={i}
									className="pl-4 basis-1/2"
								>
									<div
										className={`flex items-center justify-center h-28 rounded-xl text-3xl font-bold ${color}`}
									>
										{i + 1}
									</div>
								</CarouselItem>
							))}
						</CarouselContent>
						<CarouselPrevious />
						<CarouselNext />
					</Carousel>
				</CarouselDemoCard>
			</section>

			{/* ── 4. 방향 ─────────────────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="4. 방향 (Orientation)"
					description={'orientation="vertical"로 세로 방향 캐러셀을 만듭니다. 상하 버튼 여백(-top-12 / -bottom-12)을 고려한 패딩이 필요합니다.'}
				/>
				<CarouselDemoCard
					label='orientation="vertical"'
					contentClassName="p-5 px-16 py-14"
					code={`<Carousel orientation="vertical" className="h-48 w-full">
  <CarouselContent className="-mt-4 h-48">
    <CarouselItem className="pt-4 basis-1/3">...</CarouselItem>
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>`}
				>
					<div className="flex justify-center">
						<Carousel
							orientation="vertical"
							className="h-48 w-full max-w-sm"
						>
							<CarouselContent className="-mt-4 h-48">
								{SLIDE_COLORS.map((color, i) => (
									<CarouselItem
										key={i}
										className="pt-4 basis-1/3"
									>
										<div
											className={`flex items-center justify-center h-full rounded-xl text-2xl font-bold ${color}`}
										>
											{i + 1}
										</div>
									</CarouselItem>
								))}
							</CarouselContent>
							<CarouselPrevious />
							<CarouselNext />
						</Carousel>
					</div>
				</CarouselDemoCard>
			</section>

			{/* ── 5. 옵션 ─────────────────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="5. 옵션 (opts)"
					description="opts prop으로 Embla Carousel의 loop, align 등 다양한 옵션을 설정합니다."
				/>
				<CarouselDemoCard
					label='loop: true · align: "start"'
					code={`<Carousel
  opts={{
    loop: true,
    align: "start",
  }}
>
  <CarouselContent>
    <CarouselItem className="basis-1/2">...</CarouselItem>
  </CarouselContent>
</Carousel>`}
				>
					<Carousel opts={{ loop: true, align: 'start' }}>
						<CarouselContent>
							{SLIDE_COLORS.map((color, i) => (
								<CarouselItem
									key={i}
									className="basis-1/2"
								>
									<div
										className={`flex items-center justify-center h-28 rounded-xl text-3xl font-bold ${color}`}
									>
										{i + 1}
									</div>
								</CarouselItem>
							))}
						</CarouselContent>
						<CarouselPrevious />
						<CarouselNext />
					</Carousel>
				</CarouselDemoCard>
			</section>

			{/* ── 6. API 활용 ──────────────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="6. API 활용 (setApi)"
					description="setApi prop으로 Carousel API 인스턴스를 받아 현재 슬라이드 위치 등을 동적으로 파악합니다."
				/>
				<ApiCarouselDemo />
			</section>

			{/* ── 7. 자동재생 플러그인 ─────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="7. 자동재생 플러그인 (Autoplay)"
					description="embla-carousel-autoplay 플러그인으로 자동 슬라이드 전환을 구현합니다. 클릭하면 자동재생이 정지됩니다."
				/>
				<CarouselDemoCard
					label="2초 간격 자동재생 · stopOnInteraction: true"
					code={`import Autoplay from "embla-carousel-autoplay";

// 렌더링 간 안정적인 인스턴스 유지를 위해 useRef 사용
const plugin = useRef(Autoplay({ delay: 2000, stopOnInteraction: true }));

<Carousel plugins={[plugin.current]}>
  <CarouselContent>
    <CarouselItem>...</CarouselItem>
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>`}
				>
					<Carousel plugins={[autoplayPlugin.current]}>
						<CarouselContent>
							{SLIDE_COLORS.map((color, i) => (
								<CarouselItem key={i}>
									<div
										className={`flex items-center justify-center h-32 rounded-xl text-4xl font-bold ${color}`}
									>
										{i + 1}
									</div>
								</CarouselItem>
							))}
						</CarouselContent>
						<CarouselPrevious />
						<CarouselNext />
					</Carousel>
				</CarouselDemoCard>
			</section>

			{/* ── Props 요약 테이블 ─────────────────────────────────── */}
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
									prop: 'opts',
									type: 'EmblaOptionsType',
									def: '—',
									desc: 'Embla Carousel 옵션 (loop, align, direction 등)',
								},
								{
									prop: 'plugins',
									type: 'EmblaPluginType[]',
									def: '—',
									desc: 'Embla 플러그인 배열 (Autoplay 등)',
								},
								{
									prop: 'orientation',
									type: '"horizontal" | "vertical"',
									def: '"horizontal"',
									desc: '슬라이드 스크롤 방향',
								},
								{
									prop: 'setApi',
									type: '(api: CarouselApi) => void',
									def: '—',
									desc: 'API 인스턴스를 받아 외부에서 제어할 때 사용',
								},
								{
									prop: 'className',
									type: 'string',
									def: '—',
									desc: '추가 Tailwind 클래스',
								},
								{
									prop: 'CarouselItem · basis-*',
									type: 'Tailwind class',
									def: '"basis-full"',
									desc: '한 화면에 표시할 슬라이드 수 조절 (1/2, 1/3 등)',
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
