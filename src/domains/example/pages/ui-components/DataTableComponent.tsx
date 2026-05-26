import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Table2 } from 'lucide-react';

import { Button } from '@axiom/components/ui';
import { CodeBlock } from '@axiom/components/ui';
import SectionHeader from '@/domains/example/components/ui-components/SectionHeader';
import {
	DataTable,
	DataTableSelectAllHeader,
	DataTableSelectRowCell,
} from '@/domains/example/components/ui-components/DataTable';
import { DataTableColumnHeader } from '@/domains/example/components/ui-components/DataTableColumnHeader';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/shared/lib/shadcn/ui/dropdown-menu';

// ── 결제 내역 타입 정의 ───────────────────────────────────────────────
type Payment = {
	id: string;
	amount: number;
	status: 'pending' | 'processing' | 'success' | 'failed';
	email: string;
};

// ── 샘플 데이터 ──────────────────────────────────────────────────────
const payments: Payment[] = [
	{ id: '728ed52f', amount: 316, status: 'success', email: 'ken99@example.com' },
	{ id: '489e1d42', amount: 242, status: 'success', email: 'Abe45@example.com' },
	{ id: 'a3b0f901', amount: 837, status: 'processing', email: 'Monserrat44@example.com' },
	{ id: '2c7f8e3d', amount: 874, status: 'success', email: 'Silas22@example.com' },
	{ id: '9f1b4c6a', amount: 721, status: 'failed', email: 'carmella@example.com' },
	{ id: '6d2e9b7f', amount: 100, status: 'pending', email: 'm@example.com' },
	{ id: '3a5c0d8e', amount: 125, status: 'processing', email: 'example@gmail.com' },
	{ id: 'b8e1f2a4', amount: 550, status: 'success', email: 'john.doe@company.com' },
	{ id: 'c4d7g3h2', amount: 390, status: 'failed', email: 'jane.smith@org.net' },
	{ id: 'e2f6i9j0', amount: 210, status: 'success', email: 'alice@domain.io' },
	{ id: 'h5k8l1m3', amount: 675, status: 'pending', email: 'bob@service.co' },
	{ id: 'n7o4p2q6', amount: 430, status: 'processing', email: 'carol@startup.dev' },
	{ id: 'r9s0t5u8', amount: 920, status: 'success', email: 'david@enterprise.com' },
	{ id: 'v3w1x4y7', amount: 185, status: 'failed', email: 'eva@freelance.net' },
	{ id: 'z6a2b8c5', amount: 760, status: 'success', email: 'frank@agency.kr' },
];

// ── 상태 배지 색상 매핑 ───────────────────────────────────────────────
const statusConfig: Record<Payment['status'], { label: string; className: string }> = {
	pending: {
		label: '대기',
		className:
			'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800/50',
	},
	processing: {
		label: '처리 중',
		className:
			'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50',
	},
	success: {
		label: '완료',
		className:
			'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50',
	},
	failed: {
		label: '실패',
		className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50',
	},
};

// ── 컬럼 정의 ────────────────────────────────────────────────────────
const columns: ColumnDef<Payment>[] = [
	// 행 선택 체크박스
	{
		id: 'select',
		header: ({ table }) => <DataTableSelectAllHeader table={table} />,
		cell: ({ row }) => <DataTableSelectRowCell row={row} />,
		enableSorting: false,
		enableHiding: false,
	},
	// ID
	{
		accessorKey: 'id',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title="ID"
			/>
		),
		cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.getValue<string>('id')}</span>,
	},
	// 상태
	{
		accessorKey: 'status',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title="상태"
			/>
		),
		cell: ({ row }) => {
			const status = row.getValue<Payment['status']>('status');
			const config = statusConfig[status];
			return (
				<span
					className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.className}`}
				>
					{config.label}
				</span>
			);
		},
	},
	// 이메일
	{
		accessorKey: 'email',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title="이메일"
			/>
		),
		cell: ({ row }) => <span className="text-sm">{row.getValue<string>('email')}</span>,
	},
	// 금액
	{
		accessorKey: 'amount',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title="금액"
			/>
		),
		cell: ({ row }) => {
			const amount = parseFloat(row.getValue('amount'));
			const formatted = new Intl.NumberFormat('ko-KR', {
				style: 'currency',
				currency: 'KRW',
			}).format(amount * 1000);
			return <div className="text-right font-medium tabular-nums">{formatted}</div>;
		},
	},
	// 행 액션
	{
		id: 'actions',
		enableHiding: false,
		cell: ({ row }) => {
			const payment = row.original;
			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="size-8"
						>
							<span className="sr-only">메뉴 열기</span>
							<MoreHorizontal className="size-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>작업</DropdownMenuLabel>
						<DropdownMenuItem onClick={() => navigator.clipboard.writeText(payment.id)}>결제 ID 복사</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem>고객 상세 보기</DropdownMenuItem>
						<DropdownMenuItem>결제 상세 보기</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];

// ── 메인 페이지 컴포넌트 ─────────────────────────────────────────────
export default function DataTableComponent(): React.ReactNode {
	return (
		<div className="p-6 space-y-8 max-w-5xl">
			{/* ── 페이지 헤더 ──────────────────────────────────────── */}
			<div className="flex items-center gap-3">
				<div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20">
					<Table2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
				</div>
				<div>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data Table 컴포넌트</h1>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						<code className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded border border-blue-300/50 bg-blue-100/60 text-blue-800 dark:border-blue-600/40 dark:bg-blue-900/30 dark:text-blue-300">
							@tanstack/react-table
						</code>
						을 활용한 강력한 Data Table 예제입니다.
					</p>
				</div>
			</div>

			{/* ── 1. 전체 기능 데모 ────────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="1. 전체 기능 데모"
					description="정렬, 필터링, 컬럼 표시/숨기기, 행 선택, 페이지네이션, 행 액션이 모두 포함된 종합 예제입니다."
				/>
				<div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
					<div className="p-5">
						<DataTable
							columns={columns}
							data={payments}
							filterColumnId="email"
							filterPlaceholder="이메일로 검색..."
							pageSize={5}
						/>
					</div>
				</div>
			</section>

			{/* ── 2. 컬럼 정의 ─────────────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="2. 컬럼 정의 (Column Definitions)"
					description="ColumnDef 배열로 컬럼의 키, 헤더, 셀 렌더링 방식을 정의합니다."
				/>
				<div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
					<div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
						<span className="text-xs font-medium text-gray-600 dark:text-gray-400">기본 컬럼 정의</span>
					</div>
					<div className="border-t border-gray-100 dark:border-gray-800">
						<CodeBlock
							code={`type Payment = {
  id: string
  amount: number
  status: "pending" | "processing" | "success" | "failed"
  email: string
}

const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "status",
    header: "상태",
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="이메일" />
    ),
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">금액</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"))
      const formatted = new Intl.NumberFormat("ko-KR", {
        style: "currency",
        currency: "KRW",
      }).format(amount)
      return <div className="text-right font-medium">{formatted}</div>
    },
  },
]`}
							lang="tsx"
						/>
					</div>
				</div>
			</section>

			{/* ── 3. 정렬 (Sorting) ────────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="3. 정렬 (Sorting)"
					description="getSortedRowModel과 DataTableColumnHeader를 사용해 컬럼 정렬 기능을 추가합니다."
				/>
				<div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
					<div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
						<span className="text-xs font-medium text-gray-600 dark:text-gray-400">DataTable 설정</span>
					</div>
					<div className="border-t border-gray-100 dark:border-gray-800">
						<CodeBlock
							code={`const [sorting, setSorting] = useState<SortingState>([])

const table = useReactTable({
  data,
  columns,
  onSortingChange: setSorting,
  getSortedRowModel: getSortedRowModel(),
  state: { sorting },
})

// 헤더에서 DataTableColumnHeader 사용
{
  accessorKey: "email",
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="이메일" />
  ),
}`}
							lang="tsx"
						/>
					</div>
				</div>
			</section>

			{/* ── 4. 필터링 (Filtering) ────────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="4. 필터링 (Filtering)"
					description="getFilteredRowModel로 텍스트 필터링을 지원합니다. Input을 통해 특정 컬럼을 실시간 검색합니다."
				/>
				<div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
					<div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
						<span className="text-xs font-medium text-gray-600 dark:text-gray-400">필터 입력 연동</span>
					</div>
					<div className="border-t border-gray-100 dark:border-gray-800">
						<CodeBlock
							code={`const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

const table = useReactTable({
  // ...
  onColumnFiltersChange: setColumnFilters,
  getFilteredRowModel: getFilteredRowModel(),
  state: { columnFilters },
})

// 필터 입력
<Input
  placeholder="이메일로 검색..."
  value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
  onChange={(e) =>
    table.getColumn("email")?.setFilterValue(e.target.value)
  }
/>`}
							lang="tsx"
						/>
					</div>
				</div>
			</section>

			{/* ── 5. 행 선택 (Row Selection) ──────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="5. 행 선택 (Row Selection)"
					description="Checkbox 컴포넌트와 onRowSelectionChange를 사용해 단일/전체 행 선택을 구현합니다."
				/>
				<div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
					<div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
						<span className="text-xs font-medium text-gray-600 dark:text-gray-400">선택 컬럼 정의</span>
					</div>
					<div className="border-t border-gray-100 dark:border-gray-800">
						<CodeBlock
							code={`const columns: ColumnDef<Payment>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() ? "indeterminate" : false)
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="전체 선택"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="행 선택"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  // ... 나머지 컬럼
]`}
							lang="tsx"
						/>
					</div>
				</div>
			</section>

			{/* ── 6. 행 액션 (Row Actions) ─────────────────────────── */}
			<section className="space-y-4">
				<SectionHeader
					title="6. 행 액션 (Row Actions)"
					description="DropdownMenu를 사용해 각 행에 작업 메뉴를 추가합니다. row.original로 원본 데이터에 접근합니다."
				/>
				<div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
					<div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
						<span className="text-xs font-medium text-gray-600 dark:text-gray-400">액션 컬럼 정의</span>
					</div>
					<div className="border-t border-gray-100 dark:border-gray-800">
						<CodeBlock
							code={`{
  id: "actions",
  enableHiding: false,
  cell: ({ row }) => {
    const payment = row.original

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>작업</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(payment.id)}
          >
            결제 ID 복사
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>고객 상세 보기</DropdownMenuItem>
          <DropdownMenuItem>결제 상세 보기</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  },
}`}
							lang="tsx"
						/>
					</div>
				</div>
			</section>

			{/* ── Props 요약 테이블 ─────────────────────────────────── */}
			<section className="space-y-3">
				<SectionHeader title="DataTable Props 요약" />
				<div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
								<th className="text-left px-4 py-2.5 font-medium text-gray-600 dark:text-gray-400 text-xs">Prop</th>
								<th className="text-left px-4 py-2.5 font-medium text-gray-600 dark:text-gray-400 text-xs">타입</th>
								<th className="text-left px-4 py-2.5 font-medium text-gray-600 dark:text-gray-400 text-xs">기본값</th>
								<th className="text-left px-4 py-2.5 font-medium text-gray-600 dark:text-gray-400 text-xs">설명</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100 dark:divide-gray-800">
							{[
								{
									prop: 'columns',
									type: 'ColumnDef<TData, TValue>[]',
									def: '—',
									desc: 'TanStack Table 컬럼 정의 배열',
								},
								{
									prop: 'data',
									type: 'TData[]',
									def: '—',
									desc: '테이블에 표시할 데이터 배열',
								},
								{
									prop: 'filterColumnId',
									type: 'string',
									def: 'undefined',
									desc: '텍스트 필터링을 적용할 컬럼 id',
								},
								{
									prop: 'filterPlaceholder',
									type: 'string',
									def: '"검색..."',
									desc: '필터 입력창 placeholder',
								},
								{
									prop: 'pageSize',
									type: 'number',
									def: '10',
									desc: '초기 페이지당 표시 행 수',
								},
							].map((row) => (
								<tr
									key={row.prop}
									className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
								>
									<td className="px-4 py-2.5">
										<code className="text-xs font-mono text-blue-700 dark:text-blue-400">{row.prop}</code>
									</td>
									<td className="px-4 py-2.5">
										<code className="text-xs font-mono text-gray-600 dark:text-gray-400">{row.type}</code>
									</td>
									<td className="px-4 py-2.5">
										<code className="text-xs font-mono text-amber-700 dark:text-amber-400">{row.def}</code>
									</td>
									<td className="px-4 py-2.5 text-xs text-gray-600 dark:text-gray-400">{row.desc}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>

			{/* ── 재사용 가능 컴포넌트 안내 ─────────────────────────── */}
			<section className="space-y-3">
				<SectionHeader
					title="재사용 가능 컴포넌트"
					description="다음 컴포넌트들을 조합해 다양한 Data Table을 구성할 수 있습니다."
				/>
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
					{[
						{
							name: 'DataTable',
							path: 'example/components/ui-components/DataTable',
							desc: '정렬·필터·선택·페이지네이션이 내장된 범용 테이블 컴포넌트',
							badge: 'Generic',
							badgeClass: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
						},
						{
							name: 'DataTableColumnHeader',
							path: 'example/components/ui-components/DataTableColumnHeader',
							desc: '정렬 방향 변경 및 컬럼 숨기기 드롭다운이 포함된 헤더 셀',
							badge: 'Helper',
							badgeClass: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
						},
						{
							name: 'DataTablePagination',
							path: 'example/components/ui-components/DataTablePagination',
							desc: '페이지 크기 선택 및 이전/다음 이동 버튼이 포함된 페이지네이션',
							badge: 'Helper',
							badgeClass: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
						},
					].map((item) => (
						<div
							key={item.name}
							className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 space-y-2 shadow-sm"
						>
							<div className="flex items-center gap-2">
								<span
									className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${item.badgeClass}`}
								>
									{item.badge}
								</span>
							</div>
							<p className="font-mono text-sm font-semibold text-gray-900 dark:text-white">{item.name}</p>
							<p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
							<p className="text-xs font-mono text-gray-400 dark:text-gray-600 truncate">{item.path}</p>
						</div>
					))}
				</div>
			</section>
		</div>
	);
}
