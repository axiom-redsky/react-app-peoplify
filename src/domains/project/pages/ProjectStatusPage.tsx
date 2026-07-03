import { useApi } from '@axiom/hooks';
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@axiom/components/ui';
import PageHeader from '@/shared/components/ui/PageHeader';
import StatusBadge, { type StatusType } from '@/shared/components/ui/StatusBadge';
import { Download, SlidersHorizontal } from 'lucide-react';

// API 응답 타입 정의
// /api/assignments 조회 결과에서 내려오는 투입 현황 1건의 데이터 구조이다.
type TAssignmentItem = {
	// assignments 테이블의 고유 ID
	id: number;

	// 프로젝트 내 담당 역할 또는 직무명
	role: string;

	// 투입률. 예: 100, 50
	rate_pct: number;

	// 투입 시작일
	start_date: string;

	// 철수 예정일. 미정이면 null
	end_date: string | null;

	// 현재 투입 중 여부
	is_current: boolean;

	// 직원 고유 ID
	employee_id: number;

	// 직원 이름
	employee_name: string;

	// 직원 소속 부서명
	department: string;

	// 프로젝트 고유 ID
	project_id: number;

	// 현재 투입된 프로젝트명
	project_name: string;

	// 고객사명
	client: string;
};

// 화면 테이블에서 사용하는 멤버 데이터 타입
// API 원본 데이터를 화면 표시에 맞게 변환한 구조이다.
type TMemberRow = {
	// 직원 이름
	name: string;

	// 소속 부서명
	dept: string;

	// 현재 프로젝트명
	project: string;

	// 역할 또는 직무명
	role: string;

	// 화면 표시용 투입률. 예: 100%
	rate: string;

	// 화면 표시용 투입일. 예: 25.03.01
	start: string;

	// 화면 표시용 철수 예정일. 값이 없으면 —
	end: string;

	// 상태 배지에 전달할 상태값
	status: 'active' | 'complete' | 'bench';
};

// 날짜 포맷팅 헬퍼 함수
// ISO 8601 형식 문자열을 화면 표시용 YY.MM.DD 형식으로 변환한다.
const formatDate = (dateStr: string | null): string => {
	// 날짜 값이 없으면 대시로 표시한다.
	if (!dateStr) return '—';

	// 문자열 날짜를 Date 객체로 변환한다.
	const date = new Date(dateStr);

	// 연도는 뒤 2자리만 사용한다.
	const year = date.getFullYear().toString().slice(-2);

	// 월은 0부터 시작하므로 1을 더하고, 한 자리 월은 0을 채운다.
	const month = String(date.getMonth() + 1).padStart(2, '0');

	// 일자는 한 자리일 경우 앞에 0을 채운다.
	const day = String(date.getDate()).padStart(2, '0');

	return `${year}.${month}.${day}`;
};

// API 응답 데이터를 화면 테이블에서 사용하는 데이터 형식으로 변환하는 헬퍼 함수
const mapAssignmentsToMembers = (assignments: TAssignmentItem[]): TMemberRow[] => {
	return assignments.map((a) => ({
		// 직원 이름
		name: a.employee_name,

		// 부서명
		dept: a.department,

		// 프로젝트명
		project: a.project_name,

		// 역할 또는 직무명
		role: a.role,

		// 숫자 투입률을 화면 표시 문자열로 변환한다.
		rate: `${a.rate_pct}%`,

		// 투입 시작일을 화면 표시 형식으로 변환한다.
		start: formatDate(a.start_date),

		// 철수 예정일을 화면 표시 형식으로 변환한다.
		end: formatDate(a.end_date),

		// 현재 투입 여부 기준으로 상태값을 매핑한다.
		status: a.is_current ? 'active' : 'complete',
	}));
};

// 초기 상태용 더미 데이터
// API 데이터가 없을 때 화면이 비어 보이지 않도록 사용하는 fallback 데이터이다.
const initialMembers: TMemberRow[] = [
	{
		name: '김민준',
		dept: '개발팀',
		project: 'A금융 차세대',
		role: '백엔드 개발자',
		rate: '100%',
		start: '25.03.01',
		end: '26.09.30',
		status: 'active',
	},
	{
		name: '이서연',
		dept: '디자인',
		project: '벤치',
		role: '—',
		rate: '0%',
		start: '—',
		end: '—',
		status: 'bench',
	},
];

// 상단 요약 카드 데이터
// 현재는 고정 값이며, 추후 API 집계값으로 대체할 수 있다.
const summaryCards = [
	{ label: '전체', value: '32 명', color: 'text-foreground' },
	{ label: '투입 중', value: '26 명', color: 'text-emerald-600' },
	{ label: '벤치', value: '6 명', color: 'text-amber-600' },
	{ label: '휴가', value: '1 명', color: 'text-sky-600' },
];

// 전체 투입 현황 페이지 컴포넌트
// 현재 투입 중인 인력 목록을 조회하고, 요약 카드·필터·테이블을 렌더링한다.
export default function ProjectStatusPage(): React.ReactNode {
	// 현재 투입 중인 인원만 조회한다.
	// current_only=true 파라미터를 전달하여 현재 투입 데이터만 API에서 가져온다.
	const {
		// API 전체 응답 객체
		data: apiResponse,

		// 최초 로딩 상태
		isPending,

		// API 호출 실패 시 에러 객체
		error,

		// 조회 버튼 클릭 시 API를 다시 호출하기 위한 함수
		refetch,

		// 재조회 진행 상태
		isFetching,
	} = useApi<{ success: boolean; data: TAssignmentItem[] }>('/api/assignments', {
		params: { current_only: true },
	});

	// API 응답에서 실제 투입 현황 배열만 추출한다.
	const assignments = apiResponse?.data ?? [];

	// API 데이터가 있으면 화면용 데이터로 변환하고, 없으면 초기 더미 데이터를 사용한다.
	const members = assignments.length > 0 ? mapAssignmentsToMembers(assignments) : initialMembers;

	return (
		<div className="p-5">
			<PageHeader
				title="전체 투입 현황"
				actions={
					<Button
						variant="outline"
						size="sm"
					>
						<Download className="w-4 h-4 mr-1.5" />
						엑셀 저장
					</Button>
				}
			/>

			{/* 요약 수치 영역 */}
			<div className="flex flex-wrap gap-3 mb-4">
				{summaryCards.map((card) => (
					<div
						key={card.label}
						className="bg-card rounded-lg border px-4 py-2 flex items-center gap-2"
					>
						<span className={`text-lg font-bold ${card.color}`}>{card.value}</span>
						<span className="text-sm text-muted-foreground">{card.label}</span>
					</div>
				))}
			</div>

			{/* 필터 영역 */}
			<div className="flex flex-wrap gap-2 mb-4">
				{/* 상태 필터 */}
				<Select defaultValue="all">
					<SelectTrigger
						size="lg"
						className="bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm"
					>
						<SelectValue placeholder="상태" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">상태 전체</SelectItem>
						<SelectItem value="active">투입중</SelectItem>
						<SelectItem value="bench">벤치</SelectItem>
						<SelectItem value="leave">휴가</SelectItem>
					</SelectContent>
				</Select>

				{/* 부서 필터 */}
				<Select defaultValue="all">
					<SelectTrigger
						size="lg"
						className="bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm"
					>
						<SelectValue placeholder="부서" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">부서 전체</SelectItem>
					</SelectContent>
				</Select>

				{/* 철수 예정일 기준 필터 */}
				<Select defaultValue="all">
					<SelectTrigger
						size="lg"
						className="bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm"
					>
						<SelectValue placeholder="철수 임박 (30 일)" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">철수 임박 전체</SelectItem>
						<SelectItem value="30">30 일 이내</SelectItem>
					</SelectContent>
				</Select>

				{/* 필터 초기화 버튼 */}
				<button className="flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg text-muted-foreground hover:bg-muted transition-colors">
					<SlidersHorizontal className="w-4 h-4" />
					초기화
				</button>

				{/* API 재조회 버튼 */}
				<Button
					size="sm"
					onClick={() => refetch()}
					disabled={isFetching}
				>
					{isFetching ? '조회 중…' : '조회'}
				</Button>
			</div>

			{/* 로딩, 에러, 정상 테이블 렌더링 분기 */}
			{isPending ? (
				<div className="flex items-center justify-center py-12 text-muted-foreground">로딩 중…</div>
			) : error ? (
				<div className="flex items-center justify-center py-12 text-red-600 bg-red-50 rounded-lg border border-red-200">
					에러 발생: {error.message}
				</div>
			) : (
				// 투입 현황 테이블
				<div className="bg-card rounded-xl border overflow-hidden">
					<table className="w-full text-sm">
						<thead className="bg-muted/50">
							<tr>
								<th className="text-left py-3 px-4 font-medium text-muted-foreground">이름</th>
								<th className="text-left py-3 px-4 font-medium text-muted-foreground">부서</th>
								<th className="text-left py-3 px-4 font-medium text-muted-foreground">현재 프로젝트</th>
								<th className="text-left py-3 px-4 font-medium text-muted-foreground">역할</th>
								<th className="text-left py-3 px-4 font-medium text-muted-foreground">투입률</th>
								<th className="text-left py-3 px-4 font-medium text-muted-foreground">투입일</th>
								<th className="text-left py-3 px-4 font-medium text-muted-foreground">철수 예정일</th>
								<th className="text-left py-3 px-4 font-medium text-muted-foreground">상태</th>
							</tr>
						</thead>
						<tbody>
							{members.map((m) => (
								<tr
									key={m.name}
									className={`border-t transition-colors hover:bg-muted/20 ${
										m.status === 'warning' ? 'bg-orange-50/50 dark:bg-orange-900/10' : ''
									}`}
								>
									{/* 이름 */}
									<td className="py-2.5 px-4">
										<div className="flex items-center gap-2">
											<div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-700 dark:text-brand-300 font-semibold text-xs">
												{m.name[0]}
											</div>
											<span className="font-medium text-foreground">{m.name}</span>
										</div>
									</td>

									{/* 부서 */}
									<td className="py-2.5 px-4 text-muted-foreground">{m.dept}</td>

									{/* 현재 프로젝트 */}
									<td className="py-2.5 px-4 font-medium text-foreground">{m.project}</td>

									{/* 역할 */}
									<td className="py-2.5 px-4">
										{m.role !== '—' && (
											<span className="px-2 py-0.5 rounded text-xs bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 font-medium">
												{m.role}
											</span>
										)}
										{m.role === '—' && <span className="text-muted-foreground">—</span>}
									</td>

									{/* 투입률 */}
									<td className="py-2.5 px-4 font-medium">{m.rate}</td>

									{/* 투입일 */}
									<td className="py-2.5 px-4 text-muted-foreground">{m.start}</td>

									{/* 철수 예정일 */}
									<td className="py-2.5 px-4 text-muted-foreground">{m.end}</td>

									{/* 상태 */}
									<td className="py-2.5 px-4">
										<StatusBadge status={m.status as StatusType} />
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
