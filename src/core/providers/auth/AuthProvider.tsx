import { useEffect, useState, type ReactNode } from 'react';
import { useApi } from '@axiom/hooks';
import { AuthContext, type AuthUser } from '@/core/context/auth/AuthContext';

interface MeResponse {
	success: boolean;
	data: { user: AuthUser };
}

/**
 * 로그인 사용자 정보를 전역에서 관리한다.
 * - 새로고침 시 access_token 이 있으면 `/api/auth/me` 로 사용자 정보를 복원한다.
 * - 로그인 직후에는 LoginPage 가 setUser 로 직접 채우므로 /me 재호출이 발생하지 않는다.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<AuthUser | null>(null);
	const hasToken = !!localStorage.getItem('access_token');

	// 토큰은 있는데 아직 사용자 정보가 없을 때만(=새로고침 직후) /me 호출
	const { data, isLoading } = useApi<MeResponse>('/api/auth/me', {
		queryOptions: {
			enabled: hasToken && !user,
			retry: false,
			staleTime: Infinity,
		},
	});

	useEffect(() => {
		if (data?.data?.user) {
			setUser(data.data.user);
		}
	}, [data]);

	const logout = () => {
		localStorage.removeItem('access_token');
		setUser(null);
	};

	return (
		<AuthContext.Provider value={{ user, setUser, logout, isLoading: hasToken && !user && isLoading }}>
			{children}
		</AuthContext.Provider>
	);
}
