import { Outlet } from 'react-router';

export default function AuthLayout(): React.ReactNode {
	return (
		<div className="min-h-screen flex items-center justify-center bg-linear-to-br from-brand-700 via-brand-500 to-brand-800 dark:from-[#1a1a2e] dark:via-[#2e2e4a] dark:to-brand-950">
			{/* 배경 패턴 */}
			<div className="absolute inset-0 opacity-10">
				<div
					className="absolute inset-0"
					style={{
						backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
						backgroundSize: '40px 40px',
					}}
				/>
			</div>

			<div className="relative w-full max-w-md px-4">
				{/* 로고 영역 */}
				<div className="text-center mb-8">
					<div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur mb-4">
						<svg
							className="w-8 h-8 text-white"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth={2}
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
							/>
						</svg>
					</div>
					<h1 className="text-3xl font-bold text-white tracking-tight">Peoplify</h1>
					<p className="mt-1 text-white/80 text-sm">인력 투입 관리 시스템</p>
				</div>

				{/* 로그인 카드 */}
				<div className="bg-card rounded-2xl shadow-2xl p-8 border border-border">
					<Outlet />
				</div>

				<p className="text-center mt-6 text-white/70 text-xs">© 2026 Peoplify. All rights reserved.</p>
			</div>
		</div>
	);
}
