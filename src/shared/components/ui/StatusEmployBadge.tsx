import { cn } from '@/shared/utils/cn';

// 재직 상태 타입 정의
type TEmploymentStatus = 'active' | 'leave' | 'resigned';

// 재직 상태에 따른 스타일 매핑
const statusStyles: Record<TEmploymentStatus, string> = {
	active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
	leave: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
	resigned: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

// 재직 상태에 따른 텍스트 매핑
const statusText: Record<TEmploymentStatus, string> = {
	active: '재직',
	leave: '휴가',
	resigned: '퇴사',
};

interface StatusEmployBadgeProps {
	status: TEmploymentStatus;
	className?: string;
}

/**
 * 직원 재직 상태를 표시하는 배지 컴포넌트
 * @param status - 재직 상태 ('active' | 'leave' | 'resign')
 * @param className - 추가 CSS 클래스
 */
export default function StatusEmployBadge({ status, className }: StatusEmployBadgeProps) {
	const config = statusStyles[status];
	const label = statusText[status];
	return (
		<span
			className={cn(
				'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
				config,
				className,
			)}
		>
			{label}
		</span>
	);
}
