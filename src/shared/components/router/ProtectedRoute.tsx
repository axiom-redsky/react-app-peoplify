// access token 체크를 통해 라우터 이동전 로그인 상태 체크
import { Navigate, Outlet } from 'react-router';

// 라우터 페이지 이동 시 token 인증처리 컴포넌트
const ProtectedRoute = () => {
	const token = localStorage.getItem('access_token');
	return token ? (
		<Outlet />
	) : (
		<Navigate
			to="/auth/login"
			replace
		/>
	);
};

export default ProtectedRoute;
