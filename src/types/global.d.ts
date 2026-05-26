import type { IRouter } from '@/types/router';
//import type { IUtils } from '@/types/common';
//import type { IUI } from '@/types/components';
import type { ApiLibConfig } from '@/types/api';

declare global {
	interface Window {
		$router: IRouter;
		//$util: IUtils;
		//$ui: IUI;
		// Tanstack Query Client를 전역 변수로 설정(Devtools Extension 사용 시 필요) =======
		__TANSTACK_QUERY_CLIENT__: import('@tanstack/query-core').QueryClient;
		__MF_APP_CONFIG__: ApiLibConfig;
	}

	const $router: IRouter;
	//const $util: IUtils;
	//const $ui: IUI;

	// Tanstack Query Client를 전역 변수로 설정(Devtools Extension 사용 시 필요) =======
	const __TANSTACK_QUERY_CLIENT__: import('@tanstack/query-core').QueryClient;
	const __MF_APP_CONFIG__: ApiLibConfig;
}

/**
 * export {}가 반드시 필요한 이유:
 * .d.ts 파일이라도 import/export 구문이 하나도 없으면 TypeScript는 이 파일을 script(전역 파일)로 간주합니다. 그 상태에서 declare global { } 을 쓰면 오류가 납니다. export {}를 추가해야 TypeScript가 이 파일을 module로 인식하고, 그 안의 declare global이 비로소 올바른 전역 augmentation으로 작동합니다.
 * 그런데 만약 import 문이 하나라도 있으면 export {} 구문은 필요없음.
 */
export {};
