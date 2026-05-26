// src/domains/example/router/index.tsx
import type { TAppRoute } from '@/types/router';
import loadable from '@loadable/component';

const ExamplePage = loadable(() => import('@/publishing/example/pages/ExamplePage'));

const routes: TAppRoute[] = [
	{
		path: 'example-page', // 라우터 path 를 원하는 이름으로 정하여 작성한다. kebab-case
		element: <ExamplePage />, // 위에서 가져온 페이지 컴포넌트를 element 에 연결한다.
		name: '예제 페이지', // 페이지 name 을 원하는 이름으로 정하여 입력한다.
	},
];

export default routes;
