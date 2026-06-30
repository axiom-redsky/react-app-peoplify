type TMember = {
  assignmentId: number; // 삭제 API에 넘길 assignments.id
  employeeId: number;
  name: string;
  role: string;
  rate: string;
  start: string;
  end: string | null;
};

type Props = {
  members: TMember[];
  isRemoving: boolean;
  deleteAssignmentId?: number;
  onRemoveMember: (assignmentId: number) => void;
};

function formatDate(value: string) {
  return value.slice(0, 10).replaceAll('-', '.');
}

export default function ProjectAssignInfoPageTab({
  members,
  isRemoving,
  deleteAssignmentId,
  onRemoveMember,
}: Props) {
  return (
    <div className="bg-card rounded-xl border overflow-hidden mb-4">
      <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
        <h3 className="font-semibold text-foreground text-sm">
          투입 인력 ({members.length}명)
        </h3>
      </div>

      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">이름</th>
            <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">역할</th>
            <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">투입률</th>
            <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">투입일</th>
            <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">철수예정</th>
            <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">제외</th>
          </tr>
        </thead>

        <tbody>
          {members.length > 0 ? (
            members.map((m) => (
              <tr
                key={m.assignmentId}
                className="border-t hover:bg-muted/20 transition-colors"
              >
                <td className="py-2.5 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-xs">
                      {m.name[0]}
                    </div>
                    <span className="font-medium text-foreground">{m.name}</span>
                  </div>
                </td>

                <td className="py-2.5 px-4">
                  <span className="px-2 py-0.5 rounded text-xs bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 font-medium">
                    {m.role}
                  </span>
                </td>

                <td className="py-2.5 px-4 font-medium text-muted-foreground">
                  {m.rate}
                </td>

                <td className="py-2.5 px-4 text-muted-foreground">
                  {formatDate(m.start)}
                </td>

                <td className="py-2.5 px-4 text-muted-foreground">
                  {m.end ? formatDate(m.end) : '미정'}
                </td>

                <td className="py-2.5 px-4 font-medium text-muted-foreground">
                  <button
                    type="button"
                    disabled={isRemoving}
                    onClick={() => onRemoveMember(m.assignmentId)}
                    className="text-red-500 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRemoving && deleteAssignmentId === m.assignmentId ? '처리 중' : '삭제'}
                  </button>
                </td>
              </tr>
            ))
          ) : (
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