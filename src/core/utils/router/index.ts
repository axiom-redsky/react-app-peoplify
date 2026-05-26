import type { DataRouter, To, NavigateOptions } from 'react-router';
import type { IRouter } from '@/types/router';

export function createWindowRouter(router: DataRouter): IRouter {
	return {
		push(to: To, options?: NavigateOptions) {
			router.navigate(to, options);
		},
		replace(to: To, options?: NavigateOptions) {
			router.navigate(to, { ...options, replace: true });
		},
		back() {
			router.navigate(-1);
		},
	};
}

// 전역 $router 등록
export function registerWindowRouter(router: DataRouter): void {
	window.$router = createWindowRouter(router);
}
