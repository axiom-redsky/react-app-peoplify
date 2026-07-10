import type React from "react";
import { useMemo, useState } from "react";
import { useApi } from "@axiom/hooks";
import { useAppAlert } from "@/shared/components/layout/default/AppAlertProvider";
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@axiom/components/ui";
import PageHeader from "@/shared/components/ui/PageHeader";
import StatusBadge, {
  type StatusType,
} from "@/shared/components/ui/StatusBadge";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  SlidersHorizontal,
} from "lucide-react";
import * as XLSX from "xlsx";

const EMPLOYEES_STATUS_ENDPOINT = "/api/employees/status" as const;
const DEPARTMENTS_ENDPOINT = "/api/departments" as const;
const COMMON_CODES_ENDPOINT = "/api/common-codes" as const;
const PAGE_SIZE = 10;

type ApiDeploymentStatus =
  "active" | "complete" | "completed" | "bench" | "deployed" | string;

type TEmployeeStatusItem = {
  employee_id: number;
  employee_name: string;

  department_id: number | null;
  department: string | null;

  project_id: number | null;
  project_name: string | null;
  client: string | null;

  role: string | null;
  job_role_code?: string | null;

  rate_pct: number | null;

  start_date: string | null;
  end_date: string | null;

  status: ApiDeploymentStatus;
};

type TMemberRow = {
  id: number;
  name: string;
  dept: string;
  project: string;
  roleCategory: string;
  role: string;
  rate: string;
  start: string;
  end: string;
  status: StatusType;
};

type TMemberExcelColumn = {
  header: string;
  width: number;
  getValue: (member: TMemberRow, index: number) => string | number;
};

type TEmployeeStatusListResponse = {
  success: boolean;
  data: TEmployeeStatusItem[];
  pagination?: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
};

type TDepartment = {
  id: number;
  name: string;
};

type TDepartmentResponse = {
  success: boolean;
  data: TDepartment[];
};

type TCommonCode = {
  id?: number;
  group_code: string;
  code: string;
  code_name?: string;
  name?: string;
  sort_order: number;
  parent_code?: string | null;
  use_yn?: boolean;
  extra1?: string | null;
  extra2?: string | null;
  extra3?: string | null;
};

type TCommonCodesResponse = {
  success: boolean;
  data: {
    DEPLOYMENT_STATUS?: TCommonCode[];
    JOB_ROLE?: TCommonCode[];
    JOB_ROLE_CATEGORY?: TCommonCode[];
  };
};

const normalizeStatus = (status: ApiDeploymentStatus): StatusType => {
  if (status === "deployed") return "active";
  if (status === "active") return "active";

  // 완료/철수/기타는 화면에서 벤치로 통합
  return "bench";
};

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return "—";

  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) return "—";

  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
};

const getCodeName = (options: TCommonCode[], code?: string | null): string => {
  if (!code) return "—";

  const found = options.find((item) => item.code === code);

  return found?.code_name ?? found?.name ?? code;
};

const getJobRoleInfo = (
  assignmentRole: string | null,
  employeeJobRoleCode: string | null | undefined,
  status: StatusType,
  jobRoleOptions: TCommonCode[],
  jobRoleCategoryOptions: TCommonCode[],
): {
  roleCategoryName: string;
  roleName: string;
} => {
  const trimmedAssignmentRole = assignmentRole?.trim() || null;
  const trimmedEmployeeJobRoleCode = employeeJobRoleCode?.trim() || null;

  const getCategoryNameByCode = (categoryCode?: string | null): string => {
    return getCodeName(jobRoleCategoryOptions, categoryCode);
  };

  const getCategoryByText = (text: string): string => {
    if (
      text.includes("DB") ||
      text.includes("데이터") ||
      text.includes("SQL") ||
      text.includes("Database") ||
      text.includes("database")
    ) {
      return getCategoryNameByCode("DATA_DB");
    }

    if (
      text.includes("UI") ||
      text.includes("UX") ||
      text.includes("디자인") ||
      text.includes("퍼블리싱") ||
      text.includes("퍼블리셔")
    ) {
      return getCategoryNameByCode("DESIGN_PUBLISHING");
    }

    if (
      text.includes("QA") ||
      text.includes("테스트") ||
      text.includes("품질")
    ) {
      return getCategoryNameByCode("QA_TEST");
    }

    if (
      text.includes("기획") ||
      text.includes("분석") ||
      text.includes("BA") ||
      text.includes("업무 분석")
    ) {
      return getCategoryNameByCode("PLANNING_ANALYSIS");
    }

    if (
      text.includes("아키텍트") ||
      text === "AA" ||
      text === "TA" ||
      text === "SA" ||
      text === "DA"
    ) {
      return getCategoryNameByCode("ARCHITECT");
    }

    if (
      text.includes("백엔드") ||
      text.includes("프론트엔드") ||
      text.includes("풀스택") ||
      text.includes("개발") ||
      text.includes("API") ||
      text.includes("인터페이스") ||
      text.includes("배치") ||
      text.includes("리포트")
    ) {
      return getCategoryNameByCode("DEVELOPMENT");
    }

    if (
      text.includes("SM") ||
      text.includes("운영") ||
      text.includes("유지보수")
    ) {
      return getCategoryNameByCode("SM_OPERATION");
    }

    if (text.includes("사업관리") || text.includes("문서")) {
      return getCategoryNameByCode("BUSINESS");
    }

    if (
      text === "PM" ||
      text === "PL" ||
      text === "PMO" ||
      text.includes("관리") ||
      text.includes("리딩")
    ) {
      return getCategoryNameByCode("MANAGEMENT");
    }

    return "—";
  };

  const getRoleFromCode = (roleCode: string | null) => {
    if (!roleCode) return null;

    const found = jobRoleOptions.find(
      (item) =>
        item.code === roleCode ||
        item.code_name === roleCode ||
        item.name === roleCode,
    );

    if (!found) return null;

    return {
      roleName: found.code_name ?? found.name ?? found.code,
      roleCategoryName: getCategoryNameByCode(found.parent_code),
    };
  };

  /**
   * 핵심 규칙
   * 1. 투입중이면 현재 프로젝트의 assignments.role 기준
   * 2. 벤치면 직원 기본정보의 employees.job_role_code 기준
   */
  if (status === "active") {
    if (trimmedAssignmentRole) {
      const matchedAssignmentRole = getRoleFromCode(trimmedAssignmentRole);

      if (matchedAssignmentRole) {
        return matchedAssignmentRole;
      }

      return {
        roleName: trimmedAssignmentRole,
        roleCategoryName: getCategoryByText(trimmedAssignmentRole),
      };
    }

    const employeeRole = getRoleFromCode(trimmedEmployeeJobRoleCode);

    if (employeeRole) {
      return employeeRole;
    }

    return {
      roleName: "—",
      roleCategoryName: "—",
    };
  }

  // 벤치 멤버는 직원 기본 직무 기준
  const employeeRole = getRoleFromCode(trimmedEmployeeJobRoleCode);

  if (employeeRole) {
    return employeeRole;
  }

  return {
    roleName: "—",
    roleCategoryName: "—",
  };
};

const mapEmployeeStatusToMembers = (
  employeeStatus: TEmployeeStatusItem[],
  jobRoleOptions: TCommonCode[],
  jobRoleCategoryOptions: TCommonCode[],
): TMemberRow[] => {
  return employeeStatus.map((status) => {
    const normalizedStatus = normalizeStatus(status.status);

    const { roleCategoryName, roleName } = getJobRoleInfo(
      status.role,
      status.job_role_code,
      normalizedStatus,
      jobRoleOptions,
      jobRoleCategoryOptions,
    );

    return {
      id: status.employee_id,
      name: status.employee_name ?? "-",
      dept: status.department ?? "-",

      // 완료/철수도 화면에서는 벤치로 통합
      project:
        normalizedStatus === "bench" ? "벤치" : (status.project_name ?? "벤치"),

      roleCategory: roleCategoryName,
      role: roleName,

      // 벤치는 투입률/투입일/철수예정일을 비움
      rate:
        normalizedStatus === "bench"
          ? "0%"
          : status.rate_pct != null
            ? `${status.rate_pct}%`
            : "0%",
      start: normalizedStatus === "bench" ? "—" : formatDate(status.start_date),
      end: normalizedStatus === "bench" ? "—" : formatDate(status.end_date),

      status: normalizedStatus,
    };
  });
};

const getStatusText = (status: StatusType): string => {
  if (status === "active") return "투입중";
  if (status === "bench") return "벤치";

  return status;
};

const memberExcelColumns: TMemberExcelColumn[] = [
  {
    header: "번호",
    width: 8,
    getValue: (_member, index) => index + 1,
  },
  {
    header: "이름",
    width: 16,
    getValue: (member) => member.name,
  },
  {
    header: "부서",
    width: 16,
    getValue: (member) => member.dept,
  },
  {
    header: "현재 프로젝트",
    width: 28,
    getValue: (member) => member.project,
  },
  {
    header: "직무구분",
    width: 18,
    getValue: (member) => member.roleCategory,
  },
  {
    header: "직무",
    width: 18,
    getValue: (member) => member.role,
  },
  {
    header: "투입률",
    width: 10,
    getValue: (member) => member.rate,
  },
  {
    header: "투입일",
    width: 12,
    getValue: (member) => member.start,
  },
  {
    header: "철수 예정일",
    width: 14,
    getValue: (member) => member.end,
  },
  {
    header: "상태",
    width: 12,
    getValue: (member) => getStatusText(member.status),
  },
];

const getTodayText = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
};

const getMemberExcelRows = (targetMembers: TMemberRow[]) => {
  const headerRow = memberExcelColumns.map((column) => column.header);
  const dataRows = targetMembers.map((member, index) =>
    memberExcelColumns.map((column) => column.getValue(member, index)),
  );

  return [headerRow, ...dataRows];
};

export default function ProjectStatusPage(): React.ReactNode {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedWithdrawDays, setSelectedWithdrawDays] =
    useState<string>("all");

  const { openAlert } = useAppAlert();

  const {
    data: apiResponse,
    isPending,
    error,
    refetch,
    isFetching,
  } = useApi<TEmployeeStatusListResponse>(EMPLOYEES_STATUS_ENDPOINT, {
    params: {
      paging: false,
      department_id:
        selectedDepartment === "all" ? undefined : selectedDepartment,
      withdraw_days:
        selectedWithdrawDays === "all" ? undefined : selectedWithdrawDays,
    },
  });

  const { data: departmentsResponse } =
    useApi<TDepartmentResponse>(DEPARTMENTS_ENDPOINT);
  const departments = departmentsResponse?.data ?? [];

  const { data: commonCodesResponse } = useApi<TCommonCodesResponse>(
    COMMON_CODES_ENDPOINT,
    {
      params: {
        groups: "DEPLOYMENT_STATUS,JOB_ROLE,JOB_ROLE_CATEGORY",
      },
    },
  );

  const deploymentStatuses = commonCodesResponse?.data?.DEPLOYMENT_STATUS ?? [];
  const jobRoleOptions = commonCodesResponse?.data?.JOB_ROLE ?? [];
  const jobRoleCategoryOptions =
    commonCodesResponse?.data?.JOB_ROLE_CATEGORY ?? [];

  const visibleDeploymentStatuses = deploymentStatuses.filter((status) => {
    const code = status.code;
    const name = status.code_name ?? status.name ?? "";

    if (code === "completed") return false;
    if (code === "complete") return false;
    if (code === "withdrawn") return false;
    if (name.includes("완료")) return false;
    if (name.includes("철수")) return false;

    return true;
  });

  const assignments = apiResponse?.data ?? [];

  const allMembers = useMemo(() => {
    return mapEmployeeStatusToMembers(
      assignments,
      jobRoleOptions,
      jobRoleCategoryOptions,
    );
  }, [assignments, jobRoleOptions, jobRoleCategoryOptions]);

  const filteredMembers = useMemo(() => {
    if (selectedStatus === "all") return allMembers;

    if (selectedStatus === "deployed") {
      return allMembers.filter((member) => member.status === "active");
    }

    if (selectedStatus === "active") {
      return allMembers.filter((member) => member.status === "active");
    }

    if (selectedStatus === "bench") {
      return allMembers.filter((member) => member.status === "bench");
    }

    return allMembers;
  }, [allMembers, selectedStatus]);

  const totalCount = allMembers.length;
  const activeCount = allMembers.filter(
    (member) => member.status === "active",
  ).length;
  const benchCount = allMembers.filter(
    (member) => member.status === "bench",
  ).length;

  const summaryCards = [
    { label: "전체", value: `${totalCount} 명`, color: "text-foreground" },
    { label: "투입 중", value: `${activeCount} 명`, color: "text-emerald-600" },
    { label: "벤치", value: `${benchCount} 명`, color: "text-amber-600" },
  ];

  const filteredTotalCount = filteredMembers.length;
  const totalPages =
    filteredTotalCount > 0 ? Math.ceil(filteredTotalCount / PAGE_SIZE) : 0;

  const pagedMembers = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;

    return filteredMembers.slice(startIndex, endIndex);
  }, [filteredMembers, currentPage]);

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    setCurrentPage(1);
  };

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value);
    setCurrentPage(1);
  };

  const handleWithdrawDaysChange = (value: string) => {
    setSelectedWithdrawDays(value);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSelectedStatus("all");
    setSelectedDepartment("all");
    setSelectedWithdrawDays("all");
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;

    setCurrentPage(page);
  };

  // 현재 검색/필터 조건에 맞는 전체 투입 현황을 엑셀 파일로 다운로드한다.
  const handleExcelDownload = () => {
    try {
      const targetMembers = filteredMembers ?? [];

      if (targetMembers.length === 0) {
        openAlert({
          title: "다운로드 불가",
          message: "다운로드할 투입 현황이 없습니다.",
          confirmText: "확인",
        });
        return;
      }

      const excelRows = getMemberExcelRows(targetMembers);
      const worksheet = XLSX.utils.aoa_to_sheet(excelRows);

      worksheet["!cols"] = memberExcelColumns.map((column) => ({
        wch: column.width,
      }));

      if (worksheet["!ref"]) {
        worksheet["!autofilter"] = {
          ref: worksheet["!ref"],
        };
      }

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "전체 투입 현황");
      XLSX.writeFile(workbook, `전체_투입_현황_${getTodayText()}.xlsx`);
    } catch (err) {
      const downloadError = err as Error;

      openAlert({
        title: "다운로드 실패",
        message:
          downloadError.message || "엑셀 다운로드 중 오류가 발생했습니다.",
        confirmText: "확인",
      });
    }
  };

  return (
    <div className="p-5">
      <PageHeader
        title="전체 투입 현황"
        actions={
          <Button size="lg"
onClick={handleExcelDownload}
disabled={isPending}>
            <Download className="w-4 h-4 mr-1.5" />
            엑셀 다운로드
          </Button>
        }
      />

      <div className="flex flex-wrap gap-3 mb-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="bg-card rounded-lg border px-4 py-2 flex items-center gap-2"
          >
            <span className={`text-lg font-bold ${card.color}`}>
              {card.value}
            </span>
            <span className="text-sm text-muted-foreground">{card.label}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Select value={selectedStatus}
onValueChange={handleStatusChange}>
          <SelectTrigger
            size="lg"
            className="bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm"
          >
            <SelectValue placeholder="상태" />
          </SelectTrigger>

          <SelectContent position="popper"
sideOffset={4}
className="z-[9999]">
            <SelectItem value="all">상태 전체</SelectItem>

            {visibleDeploymentStatuses.length > 0 ? (
              visibleDeploymentStatuses.map((status) => (
                <SelectItem key={status.code}
value={status.code}>
                  {status.code_name ?? status.name ?? status.code}
                </SelectItem>
              ))
            ) : (
              <>
                <SelectItem value="deployed">투입중</SelectItem>
                <SelectItem value="bench">벤치</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>

        <Select
          value={selectedDepartment}
          onValueChange={handleDepartmentChange}
        >
          <SelectTrigger
            size="lg"
            className="bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm"
          >
            <SelectValue placeholder="부서" />
          </SelectTrigger>

          <SelectContent position="popper"
sideOffset={4}
className="z-[9999]">
            <SelectItem value="all">부서 전체</SelectItem>

            {departments.map((department) => (
              <SelectItem key={department.id}
value={String(department.id)}>
                {department.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedWithdrawDays}
          onValueChange={handleWithdrawDaysChange}
        >
          <SelectTrigger
            size="lg"
            className="bg-muted/60 border-slate-300 dark:border-slate-600 shadow-sm"
          >
            <SelectValue placeholder="철수 임박" />
          </SelectTrigger>

          <SelectContent position="popper"
sideOffset={4}
className="z-[9999]">
            <SelectItem value="all">철수 임박 전체</SelectItem>
            <SelectItem value="30">30 일 이내</SelectItem>
            <SelectItem value="60">60 일 이내</SelectItem>
            <SelectItem value="90">90 일 이내</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="lg"
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg text-muted-foreground hover:bg-muted transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          초기화
        </Button>
      </div>

      <div className="bg-card rounded-xl border overflow-hidden">
        {error ? (
          <div className="p-8 text-center text-red-600">
            <p>에러 발생: {error.message}</p>

            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="mt-3"
            >
              {isFetching ? "다시 가져오는 중…" : "다시 가져오기"}
            </Button>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    이름
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    부서
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    현재 프로젝트
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    직무구분
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    직무
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    투입률
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    투입일
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    철수 예정일
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    상태
                  </th>
                </tr>
              </thead>

              <tbody>
                {isPending ? (
                  Array.from({ length: PAGE_SIZE }).map((_, rowIndex) => (
                    <tr key={rowIndex}
className="border-t">
                      {Array.from({ length: 9 }).map((__, cellIndex) => (
                        <td key={cellIndex}
className="py-3 px-4">
                          <div className="h-4 bg-muted animate-pulse rounded w-20" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : pagedMembers.length > 0 ? (
                  pagedMembers.map((member) => (
                    <tr
                      key={member.id}
                      className="border-t transition-colors hover:bg-muted/20"
                    >
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-700 dark:text-brand-300 font-semibold text-xs">
                            {member.name?.[0] ?? "?"}
                          </div>
                          <span className="font-medium text-foreground">
                            {member.name}
                          </span>
                        </div>
                      </td>

                      <td className="py-2.5 px-4 text-muted-foreground">
                        {member.dept}
                      </td>

                      <td className="py-2.5 px-4 font-medium text-foreground">
                        {member.project}
                      </td>

                      <td className="py-2.5 px-4 text-muted-foreground">
                        {member.roleCategory}
                      </td>

                      <td className="py-2.5 px-4">
                        {member.role !== "—" ? (
                          <span className="px-2 py-0.5 rounded text-xs bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 font-medium">
                            {member.role}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>

                      <td className="py-2.5 px-4 font-medium">{member.rate}</td>

                      <td className="py-2.5 px-4 text-muted-foreground">
                        {member.start}
                      </td>

                      <td className="py-2.5 px-4 text-muted-foreground">
                        {member.end}
                      </td>

                      <td className="py-2.5 px-4">
                        <StatusBadge status={member.status} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={9}
                      className="py-8 text-center text-muted-foreground"
                    >
                      조회된 투입 현황이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/30">
              <div className="text-sm text-muted-foreground">
                총 {filteredTotalCount}개 중{" "}
                {totalPages === 0 ? 0 : currentPage}페이지
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1 || totalPages === 0}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1,
                  ).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
