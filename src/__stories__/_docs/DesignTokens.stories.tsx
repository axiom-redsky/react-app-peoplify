import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';

// ── 헬퍼 ────────────────────────────────────────────────────────────

function getCssVar(name: string): string {
	if (typeof window === 'undefined') return '';
	return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// ── Colors ──────────────────────────────────────────────────────────

const colorGroups = [
	{
		label: 'Brand',
		prefix: '--color-brand',
		steps: ['25', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
	},
	{
		label: 'Gray',
		prefix: '--color-gray',
		steps: ['25', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
	},
	{
		label: 'Success',
		prefix: '--color-success',
		steps: ['25', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
	},
	{
		label: 'Error',
		prefix: '--color-error',
		steps: ['25', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
	},
	{
		label: 'Warning',
		prefix: '--color-warning',
		steps: ['25', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
	},
	{
		label: 'Orange',
		prefix: '--color-orange',
		steps: ['25', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
	},
	{
		label: 'Blue Light',
		prefix: '--color-blue-light',
		steps: ['25', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
	},
];

function ColorSwatch({ varName }: { varName: string }) {
	const [value, setValue] = useState('');
	useEffect(() => {
		setValue(getCssVar(varName));
	}, [varName]);
	return (
		<div className="flex flex-col items-center gap-1">
			<div
				className="h-10 w-10 rounded-lg border border-gray-200 shadow-theme-xs"
				style={{ backgroundColor: value || 'transparent' }}
				title={`${varName}: ${value}`}
			/>
			<span className="text-[10px] text-gray-500">{varName.replace('--color-', '')}</span>
		</div>
	);
}

function ColorsStory() {
	return (
		<div className="space-y-8 p-6">
			{colorGroups.map((group) => (
				<section key={group.label}>
					<h3 className="mb-3 text-theme-sm font-semibold text-gray-700">{group.label}</h3>
					<div className="flex flex-wrap gap-3">
						{group.steps.map((step) => (
							<ColorSwatch
								key={step}
								varName={`${group.prefix}-${step}`}
							/>
						))}
					</div>
				</section>
			))}
		</div>
	);
}

// ── Typography ───────────────────────────────────────────────────────

const titleScale = [
	{ label: 'title-2xl', cls: 'text-title-2xl' },
	{ label: 'title-xl', cls: 'text-title-xl' },
	{ label: 'title-lg', cls: 'text-title-lg' },
	{ label: 'title-md', cls: 'text-title-md' },
	{ label: 'title-sm', cls: 'text-title-sm' },
];
const themeScale = [
	{ label: 'theme-xl', cls: 'text-theme-xl' },
	{ label: 'theme-sm', cls: 'text-theme-sm' },
	{ label: 'theme-xs', cls: 'text-theme-xs' },
];

function TypographyStory() {
	return (
		<div className="p-6 space-y-6">
			<section>
				<h3 className="mb-4 text-theme-sm font-semibold text-gray-500 uppercase tracking-wider">Title Scale</h3>
				<div className="space-y-3">
					{titleScale.map(({ label, cls }) => (
						<div
							key={label}
							className="flex items-baseline gap-4"
						>
							<span className="w-24 text-theme-xs text-gray-400 font-mono">{label}</span>
							<span className={`${cls} font-semibold text-gray-900 leading-none`}>The quick brown fox</span>
						</div>
					))}
				</div>
			</section>
			<section>
				<h3 className="mb-4 text-theme-sm font-semibold text-gray-500 uppercase tracking-wider">Theme Scale</h3>
				<div className="space-y-3">
					{themeScale.map(({ label, cls }) => (
						<div
							key={label}
							className="flex items-baseline gap-4"
						>
							<span className="w-24 text-theme-xs text-gray-400 font-mono">{label}</span>
							<span className={`${cls} text-gray-900`}>The quick brown fox jumps over the lazy dog</span>
						</div>
					))}
				</div>
			</section>
		</div>
	);
}

// ── Shadows ──────────────────────────────────────────────────────────

const shadowTokens = [
	{ label: 'shadow-theme-xs', cls: 'shadow-theme-xs' },
	{ label: 'shadow-theme-sm', cls: 'shadow-theme-sm' },
	{ label: 'shadow-theme-md', cls: 'shadow-theme-md' },
	{ label: 'shadow-theme-lg', cls: 'shadow-theme-lg' },
	{ label: 'shadow-theme-xl', cls: 'shadow-theme-xl' },
	{ label: 'shadow-focus-ring', cls: 'shadow-focus-ring' },
];

function ShadowsStory() {
	return (
		<div className="p-8 bg-gray-50 min-h-screen">
			<div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
				{shadowTokens.map(({ label, cls }) => (
					<div
						key={label}
						className="flex flex-col items-center gap-3"
					>
						<div className={`h-20 w-full rounded-xl bg-white ${cls}`} />
						<span className="text-theme-xs text-gray-500 font-mono">{label}</span>
					</div>
				))}
			</div>
		</div>
	);
}

// ── Spacing (Z-Index) ─────────────────────────────────────────────────

const zIndexTokens = ['1', '9', '99', '999', '9999', '99999', '999999'];

function SpacingStory() {
	return (
		<div className="p-6">
			<h3 className="mb-4 text-theme-sm font-semibold text-gray-700">Z-Index Scale</h3>
			<div className="space-y-2">
				{zIndexTokens.map((z) => (
					<div
						key={z}
						className="flex items-center gap-4"
					>
						<span className="w-20 text-theme-xs text-gray-400 font-mono">z-index-{z}</span>
						<div
							className="h-7 rounded bg-brand-500 text-white text-xs flex items-center px-3"
							style={{ width: `${Math.min(8 + Math.log10(Number(z)) * 80, 560)}px` }}
						>
							{z}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

// ── Meta ─────────────────────────────────────────────────────────────

const meta = {
	title: 'Getting Started/Design Tokens',
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component: `
디자인 토큰 레퍼런스입니다. \`src/design-tokens/primitive/*.json\`에서 관리됩니다.

토큰 값 변경 시 JSON 수정 후 \`npm run build:tokens\`를 실행하세요.
        `,
			},
		},
	},
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Colors: Story = {
	name: 'Colors — 컬러 팔레트',
	render: () => <ColorsStory />,
};

export const Typography: Story = {
	name: 'Typography — 타이포 스케일',
	render: () => <TypographyStory />,
};

export const Shadows: Story = {
	name: 'Shadows — 그림자',
	render: () => <ShadowsStory />,
};

export const Spacing: Story = {
	name: 'Spacing — Z-Index 스케일',
	render: () => <SpacingStory />,
};
