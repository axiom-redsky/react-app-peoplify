import axios, {
	type AxiosInstance,
	type AxiosRequestConfig,
	type AxiosResponse,
	type AxiosError,
	type InternalAxiosRequestConfig,
} from 'axios';
import type { ApiInstanceConfig, ApiRequestConfig, ApiResponse } from '../types/api-types';
import { getApiConfig } from './api-config';

class BaseAxiosClient {
	private static instance: BaseAxiosClient;
	private axiosInstance: AxiosInstance;

	private constructor(config: ApiInstanceConfig = {}) {
		this.axiosInstance = this.createAxiosInstance(config);
		this.axiosInstance.defaults.withCredentials = true;
		this.axiosInstance.interceptors.request.use(this.requestInterceptor);
		this.axiosInstance.interceptors.response.use(this.responseInterceptor, this.errorInterceptor);
	}

	static getInstance(): BaseAxiosClient {
		if (!BaseAxiosClient.instance) {
			BaseAxiosClient.instance = new BaseAxiosClient();
		}
		return BaseAxiosClient.instance;
	}

	private createAxiosInstance(config: ApiInstanceConfig): AxiosInstance {
		const apiConfig = getApiConfig();
		return axios.create({
			baseURL: config.baseURL || apiConfig.baseURL || '',
			timeout: config.timeout ?? 30000,
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
				...(config.headers ?? {}),
			},
		});
	}

	private requestInterceptor(requestConfig: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
		return requestConfig;
	}

	private responseInterceptor(response: AxiosResponse): AxiosResponse {
		return response;
	}

	private errorInterceptor(error: AxiosError): Promise<never> {
		return Promise.reject(error);
	}

	makeRequestConfig(endpoint: string, config: ApiRequestConfig): AxiosRequestConfig {
		const { method = 'GET', params, headers = {}, body, timeout } = config;
		const apiConfig = getApiConfig();

		let url: URL;
		const isAbsoluteUrl = /^https?:\/\//.test(endpoint);

		if (isAbsoluteUrl) {
			url = new URL(endpoint);
		} else if (!apiConfig.baseURL) {
			url = new URL(endpoint, window.location.origin);
		} else {
			url = new URL(endpoint, apiConfig.baseURL);
		}

		if (method.toUpperCase() === 'GET' && params) {
			Object.entries(params).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					url.searchParams.append(key, String(value));
				}
			});
		}

		const requestConfig: AxiosRequestConfig = {
			method,
			url: url.toString(),
			headers,
			timeout: timeout ?? 30000,
		};

		if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase()) && body) {
			requestConfig.data = JSON.stringify(body);
		}

		return requestConfig;
	}

	async request<T>(config: AxiosRequestConfig, token: string | null = null): Promise<ApiResponse<T>> {
		try {
			if (token) {
				config.headers = {
					...config.headers,
					Authorization: `Bearer ${token}`,
				};
			}

			const response = await this.axiosInstance.request<T>(config);

			return {
				success: true,
				data: response.data,
				statusCode: response.status,
			};
		} catch (error) {
			if (axios.isAxiosError(error)) {
				const axiosError = error as AxiosError<{ message?: string; error?: string }>;

				if (axiosError.code === 'ECONNABORTED') {
					return { success: false, error: '요청 시간이 초과되었습니다', statusCode: 408 };
				}

				return {
					success: false,
					error:
						axiosError.response?.data?.message ||
						axiosError.response?.data?.error ||
						axiosError.message ||
						'API 요청 실패',
					statusCode: axiosError.response?.status ?? 500,
				};
			}

			return { success: false, error: '알 수 없는 오류가 발생했습니다', statusCode: 500 };
		}
	}
}

export default BaseAxiosClient.getInstance();
