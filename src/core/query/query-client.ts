import { QueryClient, type DefaultOptions, type QueryClientConfig } from '@tanstack/react-query';

const defaultQueryConfig: DefaultOptions = {
	queries: {
		retry: 0,
		refetchOnWindowFocus: true,
		refetchOnReconnect: true,
		staleTime: 0,
		gcTime: 0,
	},
	mutations: {
		retry: 0,
	},
};

export function makeQueryClient(config?: QueryClientConfig): QueryClient {
	return new QueryClient({
		...config,
		defaultOptions: {
			...defaultQueryConfig,
			...(config?.defaultOptions ?? {}),
		},
	});
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient(config?: QueryClientConfig): QueryClient {
	if (typeof window === 'undefined') {
		return makeQueryClient(config);
	}
	if (!browserQueryClient) browserQueryClient = makeQueryClient(config);
	return browserQueryClient;
}
