import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@axiom/components/ui';
import React from 'react';

const meta = {
	title: 'UI Components/Button',
	component: Button,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component: `
\`Button\` 컴포넌트는 \`@axiom/components/ui\` 에서 제공하는 기본 버튼 UI입니다.

### 임포트

\`\`\`tsx
import { Button } from '@axiom/components/ui';
\`\`\`

### 기본 사용법
Button 컴포넌트를 화면에 표시하기 위한 기본 사용법입니다.
\`\`\`tsx
<Button>
  버튼 텍스트
</Button>
\`\`\`
        `,
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		variant: {
			control: 'select',
			options: ['default', 'outline', 'secondary', 'ghost', 'destructive', 'link'],
			description: '버튼 스타일 변형',
		},
		size: {
			control: 'select',
			options: ['default', 'xs', 'sm', 'lg', 'icon', 'icon-xs', 'icon-sm', 'icon-lg'],
			description: '버튼 크기',
		},
		disabled: {
			control: 'boolean',
			description: '비활성화 여부',
		},
		children: {
			control: 'text',
			description: '버튼 내용',
		},
	},
	args: {
		children: '버튼',
		variant: 'default',
		size: 'default',
		disabled: false,
	},
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	//name: 'Default',
	args: {
		children: '기본 버튼',
		variant: 'default',
		size: 'default',
	},
};

export const Outline: Story = {
	args: { variant: 'outline' },
};

export const Secondary: Story = {
	args: { variant: 'secondary' },
};

export const Ghost: Story = {
	args: { variant: 'ghost' },
};

export const Destructive: Story = {
	args: { variant: 'destructive' },
};

export const Link: Story = {
	args: { variant: 'link' },
};

export const Disabled: Story = {
	args: { disabled: true },
};

export const AllVariants: Story = {
	name: '전체 변형 모음',
	render: () => (
		<div className="flex flex-wrap gap-3 p-4">
			<Button variant="default">Default</Button>
			<Button variant="outline">Outline</Button>
			<Button variant="secondary">Secondary</Button>
			<Button variant="ghost">Ghost</Button>
			<Button variant="destructive">Destructive</Button>
			<Button variant="link">Link</Button>
		</div>
	),
};

export const AllSizes: Story = {
	name: '전체 크기 모음',
	render: () => (
		<div className="flex flex-wrap items-center gap-3 p-4">
			<Button size="xs">XS</Button>
			<Button size="sm">SM</Button>
			<Button size="default">Default</Button>
			<Button size="lg">LG</Button>
		</div>
	),
};

/**
 * 클릭 이벤트가 발생할 때 버튼 상태가 변하는 인터랙티브 예시입니다.
 * Controls 패널의 variant, size, disabled 변경이 "초기화" 버튼에 실시간 반영됩니다.
 */
export const InteractiveExample: Story = {
	name: '인터랙티브 예시',
	args: {
		children: '초기화',
		variant: 'default',
		size: 'default',
	},
	parameters: {
		docs: {
			source: {
				code: `const [count, setCount] = React.useState(0);

<div
	style={{
		display: 'flex',
		flexDirection: 'column',
		gap: '12px',
		alignItems: 'center',
	}}
>
	<p>클릭 횟수: {count}</p>
	<div style={{ display: 'flex', gap: '8px' }}>
		<Button
			variant="default"
			size="default"
			onClick={() => setCount((c) => c + 1)}
		>
			증가
		</Button>
		<Button
			{...args}
			onClick={() => setCount(0)}
		>
			{args.children}
		</Button>
	</div>
</div>
`,
			},
		},
	},
	render: (args) => {
		const [count, setCount] = React.useState(0);
		return (
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					gap: '12px',
					alignItems: 'center',
				}}
			>
				<p>클릭 횟수: {count}</p>
				<div style={{ display: 'flex', gap: '8px' }}>
					<Button
						variant="default"
						size="default"
						onClick={() => setCount((c) => c + 1)}
					>
						증가
					</Button>
					<Button
						{...args}
						onClick={() => setCount(0)}
					>
						{args.children}
					</Button>
				</div>
			</div>
		);
	},
};
