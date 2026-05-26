import type { Meta, StoryObj } from '@storybook/react-vite';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@axiom/components/ui';

const meta = {
	title: 'UI Components/Accordion',
	component: Accordion,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component: `
\`Accordion\` 컴포넌트는 \`@axiom/components/ui\` 에서 제공하는 접기/펼치기 UI입니다.

### 임포트

\`\`\`tsx
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@axiom/components/ui';
\`\`\`

### 기본 사용법

\`\`\`tsx
<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>질문 제목</AccordionTrigger>
    <AccordionContent>답변 내용</AccordionContent>
  </AccordionItem>
</Accordion>
\`\`\`

### 주요 Props

- **type**: \`"single"\` (하나만 열림) | \`"multiple"\` (여러 개 동시에 열림)
- **collapsible**: \`type="single"\` 일 때 열린 항목을 다시 클릭해서 닫을 수 있게 허용
- **defaultValue**: 초기에 열릴 항목의 \`value\`
        `,
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		type: {
			control: 'select',
			options: ['single', 'multiple'],
			description: '단일 선택 또는 다중 선택 모드',
		},
		collapsible: {
			control: 'boolean',
			description: 'type="single" 일 때 열린 항목을 닫을 수 있는지 여부',
		},
	},
	args: {
		type: 'single',
		collapsible: true,
	},
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: (args) => (
		<div className="w-full max-w-xl">
			<Accordion {...args}>
				<AccordionItem value="item-1">
					<AccordionTrigger>섹션 1</AccordionTrigger>
					<AccordionContent>첫 번째 섹션의 내용입니다.</AccordionContent>
				</AccordionItem>
				<AccordionItem value="item-2">
					<AccordionTrigger>섹션 2</AccordionTrigger>
					<AccordionContent>두 번째 섹션의 내용입니다.</AccordionContent>
				</AccordionItem>
				<AccordionItem value="item-3">
					<AccordionTrigger>섹션 3</AccordionTrigger>
					<AccordionContent>세 번째 섹션의 내용입니다.</AccordionContent>
				</AccordionItem>
			</Accordion>
		</div>
	),
};

export const SingleMode: Story = {
	name: '단일 선택 (Single)',
	render: () => (
		<div className="w-[400px]">
			<Accordion
				type="single"
				collapsible
			>
				<AccordionItem value="item-1">
					<AccordionTrigger>항목 1</AccordionTrigger>
					<AccordionContent>항목 1의 내용입니다. 다른 항목을 클릭하면 이 항목이 닫힙니다.</AccordionContent>
				</AccordionItem>
				<AccordionItem value="item-2">
					<AccordionTrigger>항목 2</AccordionTrigger>
					<AccordionContent>항목 2의 내용입니다. 동시에 하나의 항목만 열립니다.</AccordionContent>
				</AccordionItem>
				<AccordionItem value="item-3">
					<AccordionTrigger>항목 3</AccordionTrigger>
					<AccordionContent>항목 3의 내용입니다.</AccordionContent>
				</AccordionItem>
			</Accordion>
		</div>
	),
};

export const MultipleMode: Story = {
	name: '다중 선택 (Multiple)',
	render: () => (
		<div className="w-[400px]">
			<Accordion type="multiple">
				<AccordionItem value="item-1">
					<AccordionTrigger>항목 1</AccordionTrigger>
					<AccordionContent>항목 1의 내용입니다. 여러 항목을 동시에 열 수 있습니다.</AccordionContent>
				</AccordionItem>
				<AccordionItem value="item-2">
					<AccordionTrigger>항목 2</AccordionTrigger>
					<AccordionContent>항목 2의 내용입니다. 독립적으로 열고 닫을 수 있습니다.</AccordionContent>
				</AccordionItem>
				<AccordionItem value="item-3">
					<AccordionTrigger>항목 3</AccordionTrigger>
					<AccordionContent>항목 3의 내용입니다.</AccordionContent>
				</AccordionItem>
			</Accordion>
		</div>
	),
};

export const DefaultOpen: Story = {
	name: '기본 열림 상태',
	render: () => (
		<div className="w-[400px]">
			<Accordion
				type="single"
				collapsible
				defaultValue="item-2"
			>
				<AccordionItem value="item-1">
					<AccordionTrigger>항목 1</AccordionTrigger>
					<AccordionContent>항목 1의 내용입니다.</AccordionContent>
				</AccordionItem>
				<AccordionItem value="item-2">
					<AccordionTrigger>항목 2 (기본으로 열려있음)</AccordionTrigger>
					<AccordionContent>이 항목은 defaultValue 설정으로 처음부터 열려 있습니다.</AccordionContent>
				</AccordionItem>
				<AccordionItem value="item-3">
					<AccordionTrigger>항목 3</AccordionTrigger>
					<AccordionContent>항목 3의 내용입니다.</AccordionContent>
				</AccordionItem>
			</Accordion>
		</div>
	),
};

export const FAQ: Story = {
	name: 'FAQ 예시',
	render: () => (
		<div className="w-[560px]">
			<h2 className="mb-4 text-lg font-semibold">자주 묻는 질문</h2>
			<Accordion
				type="single"
				collapsible
			>
				<AccordionItem value="faq-1">
					<AccordionTrigger>이 서비스는 무료인가요?</AccordionTrigger>
					<AccordionContent>
						기본 플랜은 무료로 제공됩니다. 더 많은 기능이 필요하다면 프리미엄 플랜을 이용해 주세요.
					</AccordionContent>
				</AccordionItem>
				<AccordionItem value="faq-2">
					<AccordionTrigger>회원가입은 어떻게 하나요?</AccordionTrigger>
					<AccordionContent>
						상단 우측의 회원가입 버튼을 클릭하거나 <a href="#">여기를 클릭</a>하여 가입 페이지로 이동하세요.
					</AccordionContent>
				</AccordionItem>
				<AccordionItem value="faq-3">
					<AccordionTrigger>비밀번호를 잊어버렸어요.</AccordionTrigger>
					<AccordionContent>
						<p>로그인 페이지 하단의 "비밀번호 찾기" 링크를 클릭하세요.</p>
						<p>이메일로 재설정 링크가 발송됩니다.</p>
					</AccordionContent>
				</AccordionItem>
				<AccordionItem value="faq-4">
					<AccordionTrigger>고객센터 운영 시간이 어떻게 되나요?</AccordionTrigger>
					<AccordionContent>평일 오전 9시 ~ 오후 6시 (주말 및 공휴일 제외) 운영합니다.</AccordionContent>
				</AccordionItem>
			</Accordion>
		</div>
	),
};
