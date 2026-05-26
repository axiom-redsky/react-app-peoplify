import type { ApiLibConfig } from '@/types/api';

export type { ApiLibConfig };

//declare global {
//	interface Window {
//		__MF_APP_CONFIG__: ApiLibConfig;
//	}
//}

//let _config: ApiLibConfig = {};

export const initApiConfig = (config: ApiLibConfig): void => {
	// 앱의 apiConfig설정값이 달라지는 경우가 있어서 전역에 저장하여 하나로 활용.
	window.__MF_APP_CONFIG__ = { ...(window.__MF_APP_CONFIG__ ?? {}), ...config };
	//_config = { ..._config, ...config };
};

export const getApiConfig = (): ApiLibConfig => {
	const stored = window.__MF_APP_CONFIG__ ?? {};
	return {
		...stored,
		baseURL: stored.baseURL ?? window.location.origin,
	};
	//return {
	//	..._config,
	//	baseURL: _config.baseURL ?? (typeof window !== 'undefined' ? window.location.origin : ''),
	//};
};
