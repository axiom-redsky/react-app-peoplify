import { Button } from '@/shared/ui';
import PageHeader from '@/shared/components/ui/PageHeader';
import { X, Plus } from 'lucide-react';

const depts = ['개발팀', '디자인', '마케팅', 'HR', '영업', '기획'];
const grades = ['사원', '대리', '과장', '차장', '부장', '이사'];
const skillSuggestions = ['Java', 'Spring Boot', 'React', 'Vue', 'Python', 'Oracle', 'MySQL', 'AWS', 'Docker', 'Git'];

export default function EmployeeFormPage(): React.ReactNode {
	return (
		<div className="p-5">
			<PageHeader
				title="직원 등록"
				breadcrumb={[
					{ label: '직원관리', path: '/employees' },
					{ label: '직원 등록' },
				]}
			/>

			<div className="max-w-2xl">
				{/* 기본정보 섹션 */}
				<div className="bg-card rounded-xl border p-5 mb-4">
					<h2 className="font-semibold text-foreground mb-4 text-sm flex items-center gap-2">
						<span className="w-5 h-5 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center">1</span>
						기본 정보
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-foreground mb-1">이름 *</label>
							<input className="w-full px-3 py-2 text-sm border rounded-lg outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20" placeholder="홍길동" />
						</div>
						<div>
							<label className="block text-sm font-medium text-foreground mb-1">이메일 *</label>
							<input type="email" className="w-full px-3 py-2 text-sm border rounded-lg outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20" placeholder="name@company.com" />
						</div>
						<div>
							<label className="block text-sm font-medium text-foreground mb-1">연락처 *</label>
							<input className="w-full px-3 py-2 text-sm border rounded-lg outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20" placeholder="010-0000-0000" />
						</div>
						<div>
							<label className="block text-sm font-medium text-foreground mb-1">입사일 *</label>
							<input type="date" className="w-full px-3 py-2 text-sm border rounded-lg outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20" />
						</div>
						<div>
							<label className="block text-sm font-medium text-foreground mb-1">부서 *</label>
							<select className="w-full px-3 py-2 text-sm border rounded-lg outline-none focus:border-teal-500 bg-background">
								<option value="">부서 선택</option>
								{depts.map((d) => <option key={d}>{d}</option>)}
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium text-foreground mb-1">직급 *</label>
							<select className="w-full px-3 py-2 text-sm border rounded-lg outline-none focus:border-teal-500 bg-background">
								<option value="">직급 선택</option>
								{grades.map((g) => <option key={g}>{g}</option>)}
							</select>
						</div>
					</div>
				</div>

				{/* 기술스택 섹션 */}
				<div className="bg-card rounded-xl border p-5 mb-4">
					<h2 className="font-semibold text-foreground mb-4 text-sm flex items-center gap-2">
						<span className="w-5 h-5 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center">2</span>
						기술스택
						<span className="text-xs font-normal text-teal-600">★ 신규</span>
					</h2>

					{/* 선택된 스킬 태그 */}
					<div className="flex flex-wrap gap-2 mb-3 min-h-10 p-2 border border-dashed rounded-lg bg-muted/20">
						{['Java', 'Spring Boot', 'React'].map((skill) => (
							<span key={skill} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-100 text-teal-700 text-sm font-medium">
								{skill}
								<button className="hover:text-teal-900">
									<X className="w-3 h-3" />
								</button>
							</span>
						))}
					</div>

					{/* 스킬 추가 입력 */}
					<div className="flex gap-2 mb-3">
						<input className="flex-1 px-3 py-2 text-sm border rounded-lg outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20" placeholder="기술스택 직접 입력..." />
						<Button size="sm" variant="outline">
							<Plus className="w-4 h-4" />
						</Button>
					</div>

					{/* 추천 스킬 */}
					<div>
						<p className="text-xs text-muted-foreground mb-2">자주 사용되는 기술스택:</p>
						<div className="flex flex-wrap gap-1.5">
							{skillSuggestions.map((skill) => (
								<button key={skill} className="px-2.5 py-1 text-xs border rounded-full hover:border-teal-400 hover:text-teal-600 transition-colors text-muted-foreground">
									+ {skill}
								</button>
							))}
						</div>
					</div>
				</div>

				{/* 액션 버튼 */}
				<div className="flex justify-end gap-3">
					<Button variant="outline">취소</Button>
					<Button>직원 등록</Button>
				</div>
			</div>
		</div>
	);
}
