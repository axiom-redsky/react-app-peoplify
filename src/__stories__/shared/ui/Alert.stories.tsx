import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert, AlertTitle, AlertDescription, AlertAction } from '@axiom/components/ui';
import { Button } from '@axiom/components/ui';
import React from 'react';
import { InfoIcon, AlertTriangleIcon, XIcon, CheckCircleIcon, AlertCircleIcon } from 'lucide-react';

const meta = {
	title: 'UI Components/Alert',
	component: Alert,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component: `
\`Alert\` 컴포넌트는 \`@axiom/components/ui\` 에서 제공하는 알림 UI입니다.

### 임포트

\`\`\`tsx
import { Alert, AlertTitle, AlertDescription, AlertAction } from '@axiom/components/ui';
\`\`\`

### 기본 사용법

\`\`\`tsx
<Alert>
  <AlertTitle>알림 제목</AlertTitle>
  <AlertDescription>알림 내용을 여기에 작성합니다.</AlertDescription>
</Alert>
\`\`\`

### 서브 컴포넌트

| 컴포넌트 | 설명 |
|---|---|
| \`Alert\` | 루트 컨테이너 |
| \`AlertTitle\` | 알림 제목 |
| \`AlertDescription\` | 알림 본문 내용 |
| \`AlertAction\` | 우측 상단에 배치되는 액션 영역 (닫기 버튼 등) |

### variant

- **default**: 기본 카드 스타일
- **destructive**: 위험/오류 강조 스타일 (빨간색 계열)
        `,
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		variant: {
			control: 'select',
			options: ['default', 'destructive'],
			description: '알림 스타일 변형',
		},
	},
	args: {
		variant: 'default',
	},
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: (args) => (
		<div className="w-[480px]">
			<Alert {...args}>
				<AlertTitle>알림</AlertTitle>
				<AlertDescription>기본 알림 메시지입니다.</AlertDescription>
			</Alert>
		</div>
	),
};

export const DefaultVariant: Story = {
	name: 'Default 스타일',
	render: () => (
		<div className="w-[480px]">
			<Alert variant="default">
				<InfoIcon />
				<AlertTitle>안내</AlertTitle>
				<AlertDescription>시스템 점검이 오늘 오전 2시에 예정되어 있습니다.</AlertDescription>
			</Alert>
		</div>
	),
};

export const DestructiveVariant: Story = {
	name: 'Destructive 스타일',
	render: () => (
		<div className="w-[480px]">
			<Alert variant="destructive">
				<AlertCircleIcon />
				<AlertTitle>오류 발생</AlertTitle>
				<AlertDescription>요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.</AlertDescription>
			</Alert>
		</div>
	),
};

export const WithIcon: Story = {
	name: '아이콘 포함',
	render: () => (
		<div className="flex w-[480px] flex-col gap-3">
			<Alert>
				<InfoIcon />
				<AlertTitle>정보</AlertTitle>
				<AlertDescription>정보성 메시지를 표시할 때 사용합니다.</AlertDescription>
			</Alert>
			<Alert variant="destructive">
				<AlertTriangleIcon />
				<AlertTitle>경고</AlertTitle>
				<AlertDescription>위험하거나 오류가 발생한 상황을 표시할 때 사용합니다.</AlertDescription>
			</Alert>
		</div>
	),
};

export const WithAction: Story = {
	name: '액션 버튼 포함',
	render: () => (
		<div className="w-[480px]">
			<Alert>
				<InfoIcon />
				<AlertTitle>새로운 업데이트가 있습니다</AlertTitle>
				<AlertDescription>버전 2.0이 출시되었습니다. 지금 업데이트하세요.</AlertDescription>
				<AlertAction>
					<Button
						variant="ghost"
						size="icon-sm"
					>
						<XIcon />
					</Button>
				</AlertAction>
			</Alert>
		</div>
	),
};

export const TitleOnly: Story = {
	name: '제목만 있는 알림',
	render: () => (
		<div className="w-[480px]">
			<Alert>
				<CheckCircleIcon />
				<AlertTitle>저장이 완료되었습니다.</AlertTitle>
			</Alert>
		</div>
	),
};

export const AllVariants: Story = {
	name: '전체 변형 모음',
	render: () => (
		<div className="flex w-[520px] flex-col gap-4 p-4">
			<Alert variant="default">
				<InfoIcon />
				<AlertTitle>Default</AlertTitle>
				<AlertDescription>기본 스타일의 알림입니다.</AlertDescription>
			</Alert>
			<Alert variant="destructive">
				<AlertCircleIcon />
				<AlertTitle>Destructive</AlertTitle>
				<AlertDescription>오류 또는 위험 상황을 나타내는 알림입니다.</AlertDescription>
			</Alert>
		</div>
	),
};

export const InteractiveExample: Story = {
	name: '인터랙티브 예시 (닫기 가능)',
	parameters: {
		docs: {
			source: {
				code: `const [visible, setVisible] = React.useState(true);

{visible && (
  <Alert>
    <InfoIcon />
    <AlertTitle>닫을 수 있는 알림</AlertTitle>
    <AlertDescription>우측 X 버튼을 클릭하면 알림이 사라집니다.</AlertDescription>
    <AlertAction>
      <Button variant="ghost" size="icon-sm" onClick={() => setVisible(false)}>
        <XIcon />
      </Button>
    </AlertAction>
  </Alert>
)}
{!visible && (
  <Button onClick={() => setVisible(true)}>알림 다시 표시</Button>
)}`,
			},
		},
	},
	render: () => {
		const [visible, setVisible] = React.useState(true);
		return (
			<div className="flex w-[480px] flex-col gap-3">
				{visible && (
					<Alert>
						<InfoIcon />
						<AlertTitle>닫을 수 있는 알림</AlertTitle>
						<AlertDescription>우측 X 버튼을 클릭하면 알림이 사라집니다.</AlertDescription>
						<AlertAction>
							<Button
								variant="ghost"
								size="icon-sm"
								onClick={() => setVisible(false)}
							>
								<XIcon />
							</Button>
						</AlertAction>
					</Alert>
				)}
				{!visible && <Button onClick={() => setVisible(true)}>알림 다시 표시</Button>}
			</div>
		);
	},
};
