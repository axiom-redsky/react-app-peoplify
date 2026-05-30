import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '@/shared/lib/shadcn/utils';

const badgeVariants = cva(
	'group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden border border-transparent px-2 py-0.5 text-xs font-semibold whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!',
	{
		variants: {
			// 색상 — Zanex 솔리드 팔레트 (primary=보라 / success=틸 / info=블루 / warning=옐로우 / danger=레드)
			variant: {
				default: 'bg-primary text-primary-foreground [a]:hover:bg-primary/80',
				secondary: 'bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80',
				success: 'bg-[#13bfa6] text-white [a]:hover:bg-[#10a892]',
				info: 'bg-[#4ec2f0] text-white [a]:hover:bg-[#2bb4ec]',
				warning: 'bg-[#f7b731] text-white [a]:hover:bg-[#f0a90f]',
				danger: 'bg-[#f82649] text-white [a]:hover:bg-[#e4163a]',
				destructive:
					'bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20',
				outline: 'border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground',
				ghost: 'hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50',
				link: 'text-primary underline-offset-4 hover:underline',
			},
			// 모양 — pill(완전 둥근) / rounded(작은 라운드, Zanex 기본 Badge)
			shape: {
				pill: 'rounded-full',
				rounded: 'rounded-md',
			},
			// 그라데이션 — variant 색과 조합 (compoundVariants에서 색 정의)
			gradient: {
				true: 'border-transparent bg-linear-to-br text-white shadow-sm',
				false: '',
			},
		},
		compoundVariants: [
			{ gradient: true, variant: 'default', class: 'from-[#9e88f5] to-[#6259ca]' },
			{ gradient: true, variant: 'success', class: 'from-[#5fd0c5] to-[#13bfa6]' },
			{ gradient: true, variant: 'danger', class: 'from-[#fb7b6b] to-[#f82649]' },
			{ gradient: true, variant: 'info', class: 'from-[#7ed3f7] to-[#0db2de]' },
			{ gradient: true, variant: 'warning', class: 'from-[#fcd539] to-[#f7882f]' },
		],
		defaultVariants: {
			variant: 'default',
			shape: 'pill',
			gradient: false,
		},
	},
);

function Badge({
	className,
	variant = 'default',
	shape,
	gradient,
	asChild = false,
	...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
	const Comp = asChild ? Slot.Root : 'span';

	return (
		<Comp
			data-slot="badge"
			data-variant={variant}
			className={cn(badgeVariants({ variant, shape, gradient }), className)}
			{...props}
		/>
	);
}

export { Badge, badgeVariants };
