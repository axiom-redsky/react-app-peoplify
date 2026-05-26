export type THttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface QueryParams {
	[key: string]: string | number | boolean | undefined | null;
}

export interface ApiRequestConfig {
	method?: THttpMethod;
	headers?: Record<string, string>;
	body?: Record<string, unknown>;
	params?: QueryParams;
	timeout?: number;
}

export type ApiInstanceConfig = {
	baseURL?: string;
	timeout?: number;
	headers?: Record<string, string>;
};

export type ApiResponse<T = unknown> = {
	success?: boolean;
	data?: T;
	error?: string;
	message?: string;
	statusCode?: number;
};
