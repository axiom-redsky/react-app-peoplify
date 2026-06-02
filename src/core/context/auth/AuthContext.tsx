import { createContext } from 'react';

export interface AuthUser {
	id: number;
	name: string;
	email: string;
	role: string;
	/** 연결된 직원 ID. 직원과 연결되지 않은 관리 전용 계정은 null. */
	employee_id: number | null;
}

export interface IAuthContext {
	/** 현재 로그인 사용자. 비로그인/미하이드레이션 상태면 null. */
	user: AuthUser | null;
	/** 로그인 성공 시 사용자 정보를 전역에 반영 */
	setUser: (user: AuthUser | null) => void;
	/** 토큰 제거 + 사용자 상태 초기화 */
	logout: () => void;
	/** 새로고침 후 /me 로 사용자 정보를 복원하는 중인지 여부 */
	isLoading: boolean;
}

export const AuthContext = createContext<IAuthContext>({
	user: null,
	setUser: () => {},
	logout: () => {},
	isLoading: false,
});
