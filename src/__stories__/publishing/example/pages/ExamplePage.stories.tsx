import type { Meta, StoryObj } from '@storybook/react-vite';
import ExamplePage from '@/publishing/example/pages/ExamplePage';

const meta = {
	title: 'Publishing/example/pages/ExamplePage',
	component: ExamplePage,
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component: `
퍼블리싱 예시 페이지 컴포넌트입니다.

디자인 토큰(brand, gray, success, error, warning, shadow-theme-*)을 활용한 전체 페이지 레이아웃 예시입니다.

핸드오프 후: \`src/domains/[name]/pages/\`로 이동
        `,
			},
		},
	},
	tags: ['autodocs'],
} satisfies Meta<typeof ExamplePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
