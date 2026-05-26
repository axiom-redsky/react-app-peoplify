import type { Meta, StoryObj } from '@storybook/react-vite';
import { ExampleCard } from './ExampleCard';

const meta = {
	title: 'Publishing/Components/ExampleCard',
	component: ExampleCard,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component: `
퍼블리싱 예시 카드 컴포넌트입니다.

디자인 토큰 클래스(brand, gray, success, error, warning)와 shadow-theme-sm을 활용합니다.

핸드오프 후: \`src/shared/\` 또는 \`src/domains/[name]/components/\`로 이동
        `,
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		variant: {
			control: 'select',
			options: ['default', 'success', 'error', 'warning'],
			description: '카드 스타일 변형',
		},
		title: { control: 'text', description: '카드 제목' },
		description: { control: 'text', description: '카드 설명' },
		badge: { control: 'text', description: '배지 텍스트' },
	},
	args: {
		title: '예시 카드',
		description: '디자인 토큰을 활용한 예시 카드입니다.',
		badge: 'New',
		variant: 'default',
	},
} satisfies Meta<typeof ExampleCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Success: Story = {
	args: {
		title: '성공 상태',
		description: '작업이 성공적으로 완료됐습니다.',
		badge: 'Done',
		variant: 'success',
	},
};

export const Error: Story = {
	args: {
		title: '오류 상태',
		description: '요청 처리 중 오류가 발생했습니다.',
		badge: 'Error',
		variant: 'error',
	},
};

export const Warning: Story = {
	args: {
		title: '경고 상태',
		description: '주의가 필요한 항목입니다.',
		badge: 'Warning',
		variant: 'warning',
	},
};

export const AllVariants: Story = {
	name: '전체 변형 모음',
	render: () => (
		<div className="flex flex-col gap-4 w-80">
			<ExampleCard
				title="Default"
				description="기본 카드"
				badge="New"
				variant="default"
			/>
			<ExampleCard
				title="Success"
				description="성공 카드"
				badge="Done"
				variant="success"
			/>
			<ExampleCard
				title="Error"
				description="오류 카드"
				badge="Error"
				variant="error"
			/>
			<ExampleCard
				title="Warning"
				description="경고 카드"
				badge="Warn"
				variant="warning"
			/>
		</div>
	),
};
