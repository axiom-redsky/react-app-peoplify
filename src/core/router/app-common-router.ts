import { createHashRouter, type DOMRouterOpts } from 'react-router';
import type { TAppRoute } from '@/types/router';

export const createAppRouter = (routes: TAppRoute[], opts?: DOMRouterOpts) => {
	// createBrowserRouter는 서버 설정이 필요 (모든 경로를 index.html로 리다이렉트)하기 때문에 사용하지 않는다.
	//return createBrowserRouter(routes, opts);
	return createHashRouter(routes, opts);
};
