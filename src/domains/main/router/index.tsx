import type { TAppRoute } from '@/types/router';

// 메인화면 컴포넌트 가져오기
import MainIndex from '../pages/MainIndex';

const routes: TAppRoute[] = [
	{
		path: '/',
		element: <MainIndex />,
		name: 'MainIndex',
	},
];

export default routes;
