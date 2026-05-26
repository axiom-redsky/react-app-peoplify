import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { getQueryClient } from './query-client-config';
import { type ReactNode, useState, useEffect } from 'react';

interface QueryProviderProps {
	children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
	// useState로 QueryClient를 초기화하여 React 생명주기와 동기화
	const [queryClient] = useState(() => getQueryClient());

	// Tanstack Query Client를 전역 변수로 설정(Devtools Extension 사용 시 필요) =======
	useEffect(() => {
		window.__TANSTACK_QUERY_CLIENT__ = queryClient;
	}, [queryClient]);
	// Tanstack Query Client를 전역 변수로 설정(Devtools Extension 사용 시 필요) =======

	return (
		<QueryClientProvider client={queryClient}>
			{children}
			{import.meta.env.DEV && !import.meta.env.STORYBOOK && <ReactQueryDevtools initialIsOpen={false} />}
		</QueryClientProvider>
	);
}
