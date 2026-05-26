import type { ReactNode } from 'react';
import { QueryProvider } from './query-client/QueryProvider';

interface AppProvidersProps {
	children: ReactNode;
}

/**
 * 애플리케이션의 모든 Provider를 통합하는 컴포넌트
 *
 * 새로운 Provider 추가 시 이곳에서 관리합니다.
 * Provider 순서는 의존성을 고려하여 배치합니다.
 */
export function AppProviders({ children }: AppProvidersProps) {
	return <QueryProvider>{children}</QueryProvider>;
}
