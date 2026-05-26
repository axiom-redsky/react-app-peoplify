import type { TAppRoute } from '@/types/router';
import RootLayout from '@/shared/components/layout/RootLayout';
import AuthLayout from '@/shared/components/layout/AuthLayout';
import MainRouter from '@/domains/main/router';
import ExampleRouter from '@/domains/example/router';
import PubExampleRouter from '@/publishing/example/router';
import PubDashboardRouter from '@/publishing/dashboard/router';
import PubEmployeeRouter from '@/publishing/employee/router';
import PubProjectRouter from '@/publishing/project/router';
import PubAttendanceRouter from '@/publishing/attendance/router';
import PubReportRouter from '@/publishing/report/router';
import PubAuthRouter from '@/publishing/auth/router';
import AuthRouter from '@/domains/auth/router';

const routes: TAppRoute[] = [
	{
		path: '/',
		element: <RootLayout />,
		children: MainRouter,
	},
	// 업무(domain) 라우터 생성될 때 다음과 같이 추가
	{
		path: '/example',
		element: <RootLayout />,
		children: ExampleRouter,
	},
	// Publishing 라우트 — 퍼블리셔 목업 페이지 (RootLayout 사용)
	{
		path: '/publishing/example',
		element: <RootLayout />,
		children: PubExampleRouter,
	},
	{
		path: '/publishing',
		element: <RootLayout />,
		children: [
			...PubDashboardRouter,
			...PubEmployeeRouter,
			...PubProjectRouter,
			...PubAttendanceRouter,
			...PubReportRouter,
		],
	},
	// Publishing Auth — 사이드바 없는 AuthLayout 사용
	{
		path: '/publishing',
		element: <AuthLayout />,
		children: PubAuthRouter,
	},
	// Auth 도메인 — 로그인 페이지 (AuthLayout 사용)
	{
		path: '/auth',
		element: <AuthLayout />,
		children: AuthRouter,
	},
	{
		path: '*',
		element: (
			<RootLayout
			//message="죄송합니다. 현재 시스템에 일시적인 문제가 발생했습니다."
			//subMessage="잠시 후 다시 접속해주세요."
			/>
		),
	},
];

export default routes;