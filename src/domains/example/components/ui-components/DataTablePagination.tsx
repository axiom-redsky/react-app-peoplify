import type { Table } from "@tanstack/react-table"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

import { Button } from "@axiom/components/ui"

interface DataTablePaginationProps<TData> {
  table: Table<TData>
}

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-1 py-2">
      {/* 선택된 행 정보 */}
      <div className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">
          {table.getFilteredSelectedRowModel().rows.length}
        </span>
        {" / "}
        {table.getFilteredRowModel().rows.length}개 행 선택됨
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {/* 페이지 크기 선택 */}
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium whitespace-nowrap">페이지당 행 수</p>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="h-8 rounded-md border border-input bg-transparent px-2 py-1 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 cursor-pointer"
          >
            {[5, 10, 20, 30, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>

        {/* 페이지 정보 */}
        <div className="flex items-center gap-2 text-sm font-medium min-w-[80px] justify-center">
          {table.getState().pagination.pageIndex + 1} / {table.getPageCount()} 페이지
        </div>

        {/* 이동 버튼 */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="size-8 hidden sm:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            title="첫 페이지"
          >
            <span className="sr-only">첫 페이지</span>
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            title="이전 페이지"
          >
            <span className="sr-only">이전 페이지</span>
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            title="다음 페이지"
          >
            <span className="sr-only">다음 페이지</span>
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8 hidden sm:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            title="마지막 페이지"
          >
            <span className="sr-only">마지막 페이지</span>
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
