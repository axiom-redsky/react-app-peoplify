type TMember = {
  assignmentId: number; // assignments 테이블의 id. 삭제 API 호출 시 이 값을 넘김
  employeeId: number; // employees 테이블의 id
  name: string; // 담당자 이름
  jobRole: string; // 화면에 표시할 직무명
  rate: string; // 투입률 표시값. 예: "100%"
  start: string; // 투입 시작일
  end: string | null; // 철수 예정일. null이면 "미정"으로 표시
};

type Props = {
  members: TMember[]; // 현재 프로젝트에 투입된 인력 목록
  isRemoving: boolean; // 삭제 API 처리 중 여부
  deleteAssignmentId?: number; // 현재 삭제 처리 중인 assignmentId
  onRemoveMember: (assignmentId: number) => void; // 투입 인력 제외 버튼 클릭 시 실행할 함수
};

/**
 * 날짜 문자열을 화면 표시용으로 변환한다.
 *
 * 예:
 * 2026-07-03T00:00:00.000Z -> 2026.07.03
 * 2026-07-03 -> 2026.07.03
 */
function formatDate(value: string) {
  return value.slice(0, 10).replaceAll('-', '.');
}

/**
 * 프로젝트 상세 > 투입 인력 목록 탭 컴포넌트
 *
 * 이 컴포넌트는 담당자 배정 화면이 아니라,
 * 이미 프로젝트에 투입된 인력 목록을 표 형태로 보여주는 영역이다.
 */
export default function ProjectAssignInfoPageTab({
  members,
  isRemoving,
  deleteAssignmentId,
  onRemoveMember,
}: Props) {
  return (
    <div className="bg-card rounded-xl border overflow-hidden mb-4">
      {/* 투입 인력 목록 헤더 */}
      <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
        <h3 className="font-semibold text-foreground text-sm">
          {/* 현재 투입 인력 수 표시 */}
          투입 인력 ({members.length}명)
        </h3>
      </div>

      {/* 투입 인력 목록 테이블 */}
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">이름</th>
            <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">직무</th>
            <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">투입률</th>
            <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">투입일</th>
            <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">철수예정</th>
            <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">제외</th>
          </tr>
        </thead>

        <tbody>
          {/* 투입 인력이 1명 이상 있으면 목록을 렌더링 */}
          {members.length > 0 ? (
            members.map((m) => (
              <tr
                key={m.assignmentId}
                className="border-t hover:bg-muted/20 transition-colors"
              >
                {/* 이름 영역 */}
                <td className="py-2.5 px-4">
                  <div className="flex items-center gap-2">
                    {/* 이름 첫 글자를 원형 아이콘처럼 표시 */}
                    <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-xs">
                      {m.name[0]}
                    </div>

                    {/* 담당자 이름 */}
                    <span className="font-medium text-foreground">{m.name}</span>
                  </div>
                </td>

                {/* 직무 영역 */}
                <td className="py-2.5 px-4">
                  <span className="px-2 py-0.5 rounded text-xs bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 font-medium">
                    {m.jobRole}
                  </span>
                </td>

                {/* 투입률 영역 */}
                <td className="py-2.5 px-4 font-medium text-muted-foreground">
                  {m.rate}
                </td>

                {/* 투입 시작일 영역 */}
                <td className="py-2.5 px-4 text-muted-foreground">
                  {formatDate(m.start)}
                </td>

                {/* 철수 예정일 영역 */}
                <td className="py-2.5 px-4 text-muted-foreground">
                  {m.end ? formatDate(m.end) : '미정'}
                </td>

                {/* 제외 버튼 영역 */}
                <td className="py-2.5 px-4 font-medium text-muted-foreground">
                  <button
                    type="button"
                    disabled={isRemoving}
                    onClick={() => onRemoveMember(m.assignmentId)}
                    className="text-red-500 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {/* 현재 삭제 중인 행이면 처리 중 표시 */}
                    {isRemoving && deleteAssignmentId === m.assignmentId ? '처리 중' : '삭제'}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            // 투입 인력이 없을 때 빈 상태 메시지 표시
            <tr>
              <td
                colSpan={6}
                className="py-8 text-center text-muted-foreground"
              >
                아직 투입 인력이 없습니다
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}