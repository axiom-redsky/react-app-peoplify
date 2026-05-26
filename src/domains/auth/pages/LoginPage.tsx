import type React from 'react';
import { useState } from 'react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, CardDescription, Label } from '@axiom/components/ui';

export default function LoginPage(): React.ReactNode {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const handleLogin = () => {
		// TODO: 실제 로그인 로직 구현 (useApi 등 활용)
		console.log('Login attempt:', { email, password });
		$router.push('/');
	};

	return (
		<div>
			<div className="mb-6">
				<h2 className="text-xl font-bold text-foreground">로그인</h2>
				<p className="mt-1 text-sm text-muted-foreground">계정 정보를 입력하세요</p>
			</div>

			<form
				className="space-y-4"
				onSubmit={(e) => e.preventDefault()}
			>
				<div>
					<label className="block text-sm font-medium text-foreground mb-1">이메일</label>
					<Input
						type="email"
						placeholder="name@company.com"
						className="h-9 bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm focus-visible:border-teal-500 focus-visible:ring-teal-500/20"
						defaultValue="admin@peoplify.com"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-foreground mb-1">비밀번호</label>
					<Input
						type="password"
						placeholder="••••••••"
						className="h-9 bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm focus-visible:border-teal-500 focus-visible:ring-teal-500/20"
						defaultValue="password"
					/>
				</div>

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
				>
					로그인
				</Button>
			</form>

			<div className="mt-6 pt-6 border-t text-center text-xs text-muted-foreground">
				관리자 문의: admin@peoplify.com
			</div>
		</div>
	);
}
