import type React from 'react';
import { useState } from 'react';
import { Button, Input } from '@axiom/components/ui';
import { callApi } from '@/core/api/api';

interface LoginResponse {
	success: boolean;
	data: {
		token: string;
		user: { id: number; name: string; email: string; role: string };
	};
}

export default function LoginPage(): React.ReactNode {
	const [email, setEmail] = useState('admin@peoplify.com');
	const [password, setPassword] = useState('password');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const handleLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError('');
		setLoading(true);

		try {
			const result = await callApi<LoginResponse>('/api/auth/login', {
				method: 'POST',
				body: { email, password },
			});
			console.log('로그인 토큰>>>>>', result.data!.data.token);
			localStorage.setItem('access_token', result.data!.data.token);
			$router.push('/');
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : '로그인에 실패했습니다.';
			setError(message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<div className="mb-6">
				<h2 className="text-xl font-bold text-foreground">로그인</h2>
				<p className="mt-1 text-sm text-muted-foreground">계정 정보를 입력하세요</p>
			</div>

			<form
				className="space-y-4"
				onSubmit={handleLogin}
			>
				<div>
					<label className="block text-sm font-medium text-foreground mb-1">이메일</label>
					<Input
						type="email"
						placeholder="name@company.com"
						className="h-9 bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm focus-visible:border-teal-500 focus-visible:ring-teal-500/20"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-foreground mb-1">비밀번호</label>
					<Input
						type="password"
						placeholder="••••••••"
						className="h-9 bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm focus-visible:border-teal-500 focus-visible:ring-teal-500/20"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
				</div>

				{error && <p className="text-sm text-red-500 text-center">{error}</p>}

				<div className="flex items-center justify-between">
					<label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
						<input
							type="checkbox"
							className="rounded border-slate-300 dark:border-slate-600 text-teal-600 dark:bg-muted dark:accent-teal-400"
						/>
						로그인 상태 유지
					</label>
					<button
						type="button"
						className="text-sm text-teal-600 hover:underline"
					>
						비밀번호 찾기
					</button>
				</div>

				<Button
					type="submit"
					className="w-full"
					size="lg"
					disabled={loading}
				>
					{loading ? '로그인 중...' : '로그인'}
				</Button>
			</form>

			<div className="mt-6 pt-6 border-t text-center text-xs text-muted-foreground">
				관리자 문의: admin@peoplify.com
			</div>
		</div>
	);
}
