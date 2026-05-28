import type { TAppRoute } from '@/types/router';

// 레이아웃 컴포넌트 -------------------------
import RootLayout from '@/shared/components/layout/RootLayout';
import AuthLayout from '@/shared/components/layout/AuthLayout';

// 인증 컴포넌트 ------------------------------
import ProtectedRoute from '@/shared/components/router/ProtectedRoute';

// 업무 라우터 -------------------------
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
import EmployeeRouter from '@/domains/employee/router';
import ProjectRouter from '@/domains/project/router';

// 일반적인 라우터 연결 형식 ========================================================
/*
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
*/

// path 가 없는 "Layout Route (pathless route)" 패턴 사용 형식
// - 라우터에 관여하진 않지만 레이아웃만 추가한다던지 아니면 다른 로직을 끼워넣기 위한 방식.
const routes: TAppRoute[] = [
	// ✅ path 없는 ProtectedRoute 로 인증 필요 라우트 전체를 감싸기===========
	{
		element: <ProtectedRoute />,
		children: [
			{ path: '/', element: <RootLayout />, children: MainRouter },
			{ path: '/example', element: <RootLayout />, children: ExampleRouter },
			{ path: '/employee', element: <RootLayout />, children: EmployeeRouter },
			{ path: '/project', element: <RootLayout />, children: ProjectRouter },
			{ path: '*', element: <RootLayout /> },
		],
	},

	// 인증 불필요한 라우트는 ProtectedRoute 밖에 세팅========================
	{ path: '/auth', element: <AuthLayout />, children: AuthRouter },
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
];

export default routes;