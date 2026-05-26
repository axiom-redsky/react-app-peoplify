import * as React from 'react';
import type { ColumnDef, ColumnFiltersState, SortingState, VisibilityState } from '@tanstack/react-table';
import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table';
import { Settings2 } from 'lucide-react';

import {
	Button,
	Checkbox,
	Input,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@axiom/components/ui';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/shared/lib/shadcn/ui/dropdown-menu';

import { DataTablePagination } from './DataTablePagination';

export interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	/** 이메일 필터링 등 특정 컬럼을 필터링할 때 사용할 컬럼 id */
	filterColumnId?: string;
	filterPlaceholder?: string;
	/** 초기 페이지 크기 */
	pageSize?: number;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	filterColumnId,
	filterPlaceholder = '검색...',
	pageSize = 10,
}: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({});

	const table = useReactTable({
		data,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		initialState: {
			pagination: { pageSize },
		},
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
		},
	});

	return (
		<div className="space-y-3">
			{/* 툴바 */}
			<div className="flex items-center gap-2">
				{filterColumnId && (
					<Input
						placeholder={filterPlaceholder}
						value={(table.getColumn(filterColumnId)?.getFilterValue() as string) ?? ''}
						onChange={(e) => table.getColumn(filterColumnId)?.setFilterValue(e.target.value)}
						className="max-w-xs h-8"
					/>
				)}

				{/* 컬럼 표시/숨기기 드롭다운 */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="outline"
							size="sm"
							className="ml-auto h-8 gap-1"
						>
							<Settings2 className="size-4" />
							컬럼
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="end"
						className="w-[160px]"
					>
						<DropdownMenuLabel className="text-xs">컬럼 표시 설정</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{table
							.getAllColumns()
							.filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())
							.map((column) => (
								<DropdownMenuCheckboxItem
									key={column.id}
									className="capitalize"
									checked={column.getIsVisible()}
									onCheckedChange={(value) => column.toggleVisibility(!!value)}
								>
									{column.id}
								</DropdownMenuCheckboxItem>
							))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{/* 테이블 */}
			<div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow
								key={headerGroup.id}
								className="bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-800/60"
							>
								{headerGroup.headers.map((header) => (
									<TableHead
										key={header.id}
										className="text-xs font-semibold text-gray-600 dark:text-gray-400"
									>
										{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() ? 'selected' : undefined}
									className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/80 dark:hover:bg-gray-800/30 data-[state=selected]:bg-blue-50/60 dark:data-[state=selected]:bg-blue-900/20"
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell
											key={cell.id}
											className="text-sm text-gray-700 dark:text-gray-300"
										>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center text-sm text-muted-foreground"
								>
									결과가 없습니다.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* 페이지네이션 */}
			<DataTablePagination table={table} />
		</div>
	);
}

/** 전체 행 선택 체크박스 헤더 셀 */
export function DataTableSelectAllHeader<TData>({ table }: { table: import('@tanstack/react-table').Table<TData> }) {
	return (
		<Checkbox
			checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() ? 'indeterminate' : false)}
			onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
			aria-label="전체 선택"
		/>
	);
}

/** 개별 행 선택 체크박스 셀 */
export function DataTableSelectRowCell<TData>({ row }: { row: import('@tanstack/react-table').Row<TData> }) {
	return (
		<Checkbox
			checked={row.getIsSelected()}
			onCheckedChange={(value) => row.toggleSelected(!!value)}
			aria-label="행 선택"
		/>
	);
}
