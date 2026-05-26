import { createAppRouter } from './app-common-router.ts';
import { registerWindowRouter } from '@/core/utils/router';
import routes from '@/shared/router';

const router = createAppRouter(routes, {
	// .env 파일에 설정된 VITE_ROUTER_BASENAME 값을 사용합니다.
	basename: import.meta.env.VITE_ROUTER_BASENAME,
});

// window.$router를 전역 변수로 등록
registerWindowRouter(router);

export * from './app-common-router.ts';
export default router;
