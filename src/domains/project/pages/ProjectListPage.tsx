import type React from 'react';
import { useState } from 'react';
import { useApi } from '@axiom/hooks';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@axiom/components/ui';
import {
	Button,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Skeleton,
} from '@axiom/components/ui';
import PageHeader from '@/shared/components/ui/PageHeader';
import StatusBadge from '@/shared/components/ui/StatusBadge';
import type { StatusType } from '@/shared/components/ui/StatusBadge';
import * as XLSX from 'xlsx';
import { Search, Plus, Calendar, Users, Download } from 'lucide-react';

// 프로젝트 목록 API에서 내려오는 개별 프로젝트 데이터 타입
// 화면에서 사용하는 프로젝트명, 고객사, 기간, 상태, 기술스택 정보를 정의한다.
interface Project {
	id: number;
	name: string;
	client: string;
	start_date: string;
	end_date: string;
	status: StatusType;
	tech_stack: string[];
	member_count?: number;
}

// 날짜 문자열을 화면 표시 형식으로 변환한다.
// 예: 2026-07-03 또는 ISO 날짜 문자열 → 2026.07.03
const formatDate = (dateString: string): string => {
	const date = new Date(dateString);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}.${month}.${day}`;
};

// 프로젝트 엑셀 컬럼 타입
// 카드형 목록 화면에는 그리드 헤더가 없기 때문에 엑셀 전용 헤더 정보를 별도로 정의한다.
type ProjectExcelColumn = {
	header: string;
	width: number;
	getValue: (project: Project, index: number) => string | number;
};

/******************************* Excel 다운로드 로직 영역 ************************/
// 프로젝트 목록 엑셀 다운로드 컬럼 정의
// header: 엑셀 헤더명
// width: 엑셀 컬럼 너비
// getValue: 각 프로젝트 데이터에서 해당 컬럼에 들어갈 값을 만드는 함수
const projectExcelColumns: ProjectExcelColumn[] = [
	{
		header: '번호',
		width: 8,
		getValue: (_project, index) => index + 1,
	},
	{
		header: '프로젝트명',
		width: 30,
		getValue: (project) => project.name,
	},
	{
		header: '고객사',
		width: 20,
		getValue: (project) => project.client,
	},
	{
		header: '투입인력', // 실제 인력이 아니라 기술에 대해서 숫자를 카운팅중 하단에 고칠게있다.
		width: 12,
		getValue: (project) => `${project.member_count ?? 0}명`,
	},
	{
		header: '상태',
		width: 12,
		getValue: (project) => getStatusLabel(project.status),
	},
	{
		header: '시작일',
		width: 14,
		getValue: (project) => formatDate(project.start_date),
	},
	{
		header: '종료일',
		width: 14,
		getValue: (project) => formatDate(project.end_date),
	},
	{
		header: '프로젝트기간',
		width: 28,
		getValue: (project) => `${formatDate(project.start_date)} ~ ${formatDate(project.end_date)}`,
	},
	{
		header: '기술스택',
		width: 45,
		getValue: (project) => (Array.isArray(project.tech_stack) ? project.tech_stack.join(', ') : ''),
	},
];

// 프로젝트 상태 코드를 엑셀 표시용 한글명으로 변환한다.
// API 상태값(active, complete, planned)을 사용자가 읽기 쉬운 한글로 바꾼다.
const getStatusLabel = (status: StatusType): string => {
	switch (status) {
		case 'active':
			return '진행 중';
		case 'complete':
			return '완료';
		case 'planned':
			return '예정';
		default:
			return String(status);
	}
};

// 엑셀 파일명에 사용할 오늘 날짜 문자열을 생성한다.
// 예: 20260706
const getTodayText = (): string => {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');

	return `${year}${month}${day}`;
};
/******************************* Excel 다운로드 로직 영역 ************************/

// 프로젝트 목록 화면 컴포넌트
// 프로젝트 목록 조회, 상태 탭 필터, 검색어 필터, 상세/등록 이동을 담당한다.
export default function ProjectListPage(): React.ReactNode {
	// 프로젝트 목록 API 호출
	// /api/projects 응답의 data 배열을 프로젝트 목록으로 사용한다.
	const { data: projects, isLoading, error } = useApi<{ data: Project[] }>('/api/projects');

	// 현재 선택된 상태 탭 인덱스
	// 0: 전체, 1: 진행 중, 2: 완료, 3: 예정
	const [activeTab, setActiveTab] = useState(0);

	// 프로젝트명 또는 고객사 검색어 상태
	const [searchQuery, setSearchQuery] = useState('');

	// 화면 상단 상태 탭 정의
	// count 값은 API 데이터 기준으로 getTabCount 함수에서 동적으로 계산한다.
	const tabs = [{ label: '전체' }, { label: '진행 중' }, { label: '완료' }, { label: '예정' }];

	// 선택한 탭에 해당하는 프로젝트 수를 계산한다.
	// API 응답이 없을 때는 0을 반환한다.
	const getTabCount = (tabIndex: number): number => {
		if (!projects?.data) return 0;

		switch (tabIndex) {
			case 0: // 전체
				return projects.data.length;
			case 1: // 진행 중(active)
				return projects.data.filter((p) => p.status === 'active').length;
			case 2: // 완료(complete)
				return projects.data.filter((p) => p.status === 'complete').length;
			case 3: // 예정(planned)
				return projects.data.filter((p) => p.status === 'planned').length;
			default:
				return 0;
		}
	};

	// 프로젝트 상세 버튼 클릭 시 상세 화면으로 이동한다.
	// id는 프로젝트 ID이며 라우터 경로 /project/:id 에 사용된다.
	const handleDetailProject = (id: any) => {
		$router.push(`/project/${id}`);
	};

	// 상태 탭 클릭 시 현재 선택 탭을 변경한다.
	const handleTabClick = (index: number) => {
		setActiveTab(index);
	};

	// 검색 입력값 변경 시 검색어 상태를 갱신한다.
	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setSearchQuery(value);
	};

	// 프로젝트 목록 필터링 결과
	// 현재 선택된 상태 탭과 검색어를 동시에 반영한다.
	const filteredProjects = projects?.data?.filter((proj: Project) => {
		// 상태 탭 기준 필터링
		const statusMatch =
			activeTab === 0 || // 전체
			(activeTab === 1 && proj.status === 'active') || // 진행 중
			(activeTab === 2 && proj.status === 'complete') || // 완료
			(activeTab === 3 && proj.status === 'planned'); // 예정

		// 프로젝트명 또는 고객사 기준 검색어 필터링
		const searchMatch =
			searchQuery === '' ||
			proj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			proj.client.toLowerCase().includes(searchQuery.toLowerCase());

		return statusMatch && searchMatch;
	});

	// 현재 필터링된 프로젝트 목록을 엑셀 다운로드용 2차원 배열로 변환한다.
	// 첫 번째 행은 헤더, 두 번째 행부터 실제 프로젝트 데이터다.
	const getProjectExcelRows = (targetProjects: Project[]) => {
		const headerRow = projectExcelColumns.map((column) => column.header);

		const dataRows = targetProjects.map((project, index) =>
			projectExcelColumns.map((column) => column.getValue(project, index)),
		);

		return [headerRow, ...dataRows];
	};

	// 현재 화면에 표시된 프로젝트 목록을 엑셀 파일로 다운로드한다.
	const handleExcelDownload = () => {
		const targetProjects = filteredProjects ?? [];

		if (targetProjects.length === 0) {
			alert('다운로드할 프로젝트가 없습니다.');
			return;
		}

		const excelRows = getProjectExcelRows(targetProjects);

		const worksheet = XLSX.utils.aoa_to_sheet(excelRows);

		// 엑셀 컬럼 너비 설정
		worksheet['!cols'] = projectExcelColumns.map((column) => ({
			wch: column.width,
		}));

		// 엑셀 헤더 필터 설정
		if (worksheet['!ref']) {
			worksheet['!autofilter'] = {
				ref: worksheet['!ref'],
			};
		}

		const workbook = XLSX.utils.book_new();

		XLSX.utils.book_append_sheet(workbook, worksheet, '프로젝트 목록');

		XLSX.writeFile(workbook, `프로젝트_목록_${getTodayText()}.xlsx`);
	};

	// 프로젝트 목록 로딩 중 표시 화면
	// 실제 테이블 구조와 유사한 Skeleton UI를 보여준다.
	if (isLoading) {
		return (
			<div className="p-5 space-y-4">
				<PageHeader
					title="프로젝트 목록"
					breadcrumb={[{ label: '프로젝트관리', path: '/projects' }, { label: '목록' }]}
				/>
				<div className="bg-card rounded-xl border p-5">
					<div className="flex justify-between items-center mb-4">
						<Skeleton className="h-6 w-48" />
						<Skeleton className="h-9 w-32" />
					</div>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-16">번호</TableHead>
								<TableHead>프로젝트명</TableHead>
								<TableHead>담당자</TableHead>
								<TableHead>상태</TableHead>
								<TableHead>시작일</TableHead>
								<TableHead>종료일</TableHead>
								<TableHead className="w-32">액션</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{Array.from({ length: 5 }).map((_, i) => (
								<TableRow key={i}>
									<TableCell>
										<Skeleton className="h-4 w-8" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-48" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-24" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-16" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-24" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-24" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-8 w-20" />
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</div>
		);
	}

	// 프로젝트 목록 API 호출 실패 시 표시 화면
	if (error) {
		return (
			<div className="p-5">
				<PageHeader
					title="프로젝트 목록"
					breadcrumb={[{ label: '프로젝트관리', path: '/projects' }, { label: '목록' }]}
				/>
				<div className="bg-card rounded-xl border p-5">
					<div className="text-center text-red-500 py-8">
						<p>데이터를 불러오지 못했습니다.</p>
						<p className="text-sm text-muted-foreground mt-2">{error.message}</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="p-5">
			<PageHeader
				title="프로젝트 관리"
				actions={
					<>
						<Button
							size="lg"
							onClick={handleExcelDownload}
							className="mr-2"
						>
							<Download className="w-4 h-4 mr-1.5" />
							엑셀 다운로드
						</Button>

						<Button
							size="lg"
							onClick={() => $router.push(`/project/new`)}
						>
							<Plus className="w-4 h-4 mr-1.5" />
							프로젝트 등록
						</Button>
					</>
				}
			/>

			{/* 상태 탭 영역: 전체/진행 중/완료/예정 프로젝트를 필터링한다. */}
			<div className="flex gap-1 mb-4 border-b">
				{tabs.map((tab, idx) => (
					<button
						key={tab.label}
						onClick={() => handleTabClick(idx)}
						className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
							idx === activeTab
								? 'border-brand-600 text-brand-600'
								: 'border-transparent text-muted-foreground hover:text-foreground'
						}`}
					>
						{tab.label}
						<span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">
							{getTabCount(idx)}
						</span>
					</button>
				))}
			</div>

			{/* 검색/필터 영역: 프로젝트명·고객사 검색과 추가 필터 UI를 제공한다. */}
			<div className="flex flex-wrap gap-2 mb-4">
				<div className="relative flex-1 min-w-48">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
					<Input
						className="h-9 pl-9 bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm focus-visible:border-brand-500 focus-visible:ring-brand-500/20"
						placeholder="프로젝트명·고객사 검색..."
						value={searchQuery}
						onChange={handleSearchChange}
					/>
				</div>
				<Select defaultValue="all">
					<SelectTrigger
						size="lg"
						className="bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm"
					>
						<SelectValue placeholder="기술스택" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">기술스택 전체</SelectItem>
						<SelectItem value="java">Java</SelectItem>
						<SelectItem value="react">React</SelectItem>
						<SelectItem value="python">Python</SelectItem>
						<SelectItem value="sap">SAP</SelectItem>
					</SelectContent>
				</Select>
				<Select defaultValue="all">
					<SelectTrigger
						size="lg"
						className="bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm"
					>
						<SelectValue placeholder="PM" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">PM 전체</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* 카드형 프로젝트 목록 영역 */}
			<div className="grid grid-cols-1 gap-3">
				{filteredProjects?.map((proj) => {
					// 프로젝트 기간 표시 문자열
					const period = `${formatDate(proj.start_date)} ~ ${formatDate(proj.end_date)}`;

					// 프로젝트 기술스택 목록
					const tech = proj.tech_stack;

					return (
						<div
							key={proj.id}
							className="bg-card rounded-xl border p-4 hover:border-brand-200 dark:hover:border-brand-700 hover:shadow-sm transition-all"
						>
							<div className="flex items-start justify-between gap-3">
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 mb-1">
										<h3 className="font-semibold text-foreground truncate">{proj.name}</h3>
										<StatusBadge status={proj.status} />
									</div>
									<p className="text-sm text-muted-foreground mb-2">{proj.client}</p>
									<div className="flex flex-wrap gap-4 text-sm">
										<span className="flex items-center gap-1 text-muted-foreground">
											<Calendar className="w-3.5 h-3.5" />
											{period}
										</span>
										<span className="flex items-center gap-1 text-muted-foreground">
											<Users className="w-3.5 h-3.5" />
											투입 {proj.member_count}명
										</span>
									</div>
									<div className="flex flex-wrap gap-1.5 mt-2">
										{tech.map((t) => (
											<span
												key={t}
												className="px-2 py-0.5 text-xs rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
											>
												{t}
											</span>
										))}
									</div>
								</div>
								<Button
									variant="outline"
									size="sm"
									className="shrink-0"
									onClick={() => handleDetailProject(proj.id)}
								>
									상세
								</Button>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
