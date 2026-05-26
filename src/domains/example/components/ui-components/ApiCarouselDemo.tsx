import { useEffect, useState } from 'react';
import { CodeBlock } from '@axiom/components/ui';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
	type CarouselApi,
} from '@/shared/lib/shadcn/ui/carousel';

const COLORS = [
	'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300',
	'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300',
	'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300',
	'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300',
	'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300',
];

export default function ApiCarouselDemo(): React.ReactNode {
	const [api, setApi] = useState<CarouselApi>();
	const [current, setCurrent] = useState(0);
	const [count, setCount] = useState(0);

	useEffect(() => {
		if (!api) return;
		setCount(api.scrollSnapList().length);
		setCurrent(api.selectedScrollSnap() + 1);
		api.on('select', () => {
			setCurrent(api.selectedScrollSnap() + 1);
		});
	}, [api]);

	return (
		<div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
			<div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
				<span className="text-xs font-medium text-gray-600 dark:text-gray-400">setApi로 현재 슬라이드 위치 파악</span>
			</div>
			<div className="p-5 px-16 space-y-3">
				<Carousel setApi={setApi}>
					<CarouselContent>
						{COLORS.map((color, i) => (
							<CarouselItem key={i}>
								<div className={`flex items-center justify-center h-32 rounded-xl text-4xl font-bold ${color}`}>
									{i + 1}
								</div>
							</CarouselItem>
						))}
					</CarouselContent>
					<CarouselPrevious />
					<CarouselNext />
				</Carousel>
				<p className="text-center text-sm text-gray-500 dark:text-gray-400">
					슬라이드{' '}
					<span className="font-semibold text-gray-800 dark:text-gray-200">{current}</span>
					{' '}/ {count}
				</p>
			</div>
			<div className="border-t border-gray-100 dark:border-gray-800">
				<CodeBlock
					code={`import { type CarouselApi } from "@/shared/lib/shadcn/ui/carousel";

const [api, setApi] = useState<CarouselApi>();
const [current, setCurrent] = useState(0);
const [count, setCount] = useState(0);

useEffect(() => {
  if (!api) return;
  setCount(api.scrollSnapList().length);
  setCurrent(api.selectedScrollSnap() + 1);
  api.on("select", () => {
    setCurrent(api.selectedScrollSnap() + 1);
  });
}, [api]);

<Carousel setApi={setApi}>...</Carousel>
<p>슬라이드 {current} / {count}</p>`}
					lang="tsx"
					theme="github-dark"
				/>
			</div>
		</div>
	);
}
