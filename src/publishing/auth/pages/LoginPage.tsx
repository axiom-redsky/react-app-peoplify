import { Button } from '@/shared/ui';

export default function LoginPage(): React.ReactNode {
	return (
		<div>
			<div className="mb-6">
				<h2 className="text-xl font-bold text-gray-900">로그인</h2>
				<p className="mt-1 text-sm text-gray-500">계정 정보를 입력하세요</p>
			</div>

			<form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						이메일
					</label>
					<input
						type="email"
						placeholder="name@company.com"
						className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-colors"
						defaultValue="admin@peoplify.com"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						비밀번호
					</label>
					<input
						type="password"
						placeholder="••••••••"
						className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-colors"
						defaultValue="password"
					/>
				</div>

				<div className="flex items-center justify-between">
					<label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
						<input type="checkbox" className="rounded border-gray-300 text-teal-600" />
						로그인 상태 유지
					</label>
					<button type="button" className="text-sm text-teal-600 hover:underline">
						비밀번호 찾기
					</button>
				</div>

				<Button type="submit" className="w-full">
					로그인
				</Button>
			</form>

			<div className="mt-6 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
				관리자 문의: admin@peoplify.com
			</div>
		</div>
	);
}
