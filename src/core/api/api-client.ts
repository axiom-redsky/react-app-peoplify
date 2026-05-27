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
		// JWT access token 관련 체크 로직
		const token = localStorage.getItem('access_token');
		if (token) {
			requestConfig.headers = requestConfig.headers ?? {};
			requestConfig.headers['Authorization'] = `Bearer ${token}`;
		}
		return requestConfig;
	}

	private responseInterceptor(response: AxiosResponse): AxiosResponse {
		return response;
	}

	private errorInterceptor(error: AxiosError): Promise<never> {
		// 401 Unauthorized 응답 시 토큰 삭제 및 리디렉션 처리
		if (error.response?.status === 401) {
			localStorage.removeItem('access_token');
			// 전역 $router 객체를 사용하여 '/' 로 리디렉션
			$router.push('/');
		}
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
			// baseURL이 상대 경로(예: /api)인 경우 window.location.origin 기준으로 절대 URL 변환
			const absoluteBase = /^https?:\/\//.test(apiConfig.baseURL)
				? apiConfig.baseURL
				: new URL(apiConfig.baseURL, window.location.origin).href;
			url = new URL(endpoint, absoluteBase);
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
