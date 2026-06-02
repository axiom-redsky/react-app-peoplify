import { useContext } from 'react';
import { AuthContext, type IAuthContext } from '@/core/context/auth/AuthContext';

/** 전역 로그인 사용자 상태에 접근하는 훅 */
export function useAuth(): IAuthContext {
	return useContext(AuthContext);
}
