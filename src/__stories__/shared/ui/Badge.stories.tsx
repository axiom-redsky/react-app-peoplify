import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from '@axiom/components/ui';

const meta = {
	title: 'UI Components/Badge',
	component: Badge,
	tags: ['autodocs'],
	argTypes: {
		variant: {
			control: 'select',
			options: ['default', 'secondary', 'destructive', 'outline', 'ghost', 'link'],
			description: '뱃지 스타일 변형',
		},
		children: {
			control: 'text',
			description: '뱃지 내용',
		},
	},
	args: {
		children: '뱃지',
		variant: 'default',
	},
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Secondary: Story = {
	args: { variant: 'secondary' },
};

export const Destructive: Story = {
	args: { variant: 'destructive' },
};

export const Outline: Story = {
	args: { variant: 'outline' },
};

export const Ghost: Story = {
	args: { variant: 'ghost' },
};

export const AllVariants: Story = {
	name: '전체 변형 모음',
	render: () => (
		<div className="flex flex-wrap gap-3 p-4">
			<Badge variant="default">Default</Badge>
			<Badge variant="secondary">Secondary</Badge>
			<Badge variant="destructive">Destructive</Badge>
			<Badge variant="outline">Outline</Badge>
			<Badge variant="ghost">Ghost</Badge>
		</div>
	),
};
