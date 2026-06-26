import { useQuery } from "@tanstack/react-query";
import { employeeAPI, problemAPI } from "../../services/Api";
import { cap, CARD_SHADOW } from "../../lib/Utils";

const PSTY: Record<string, string> = {
  high: "bg-error/10 text-error",
  medium: "bg-[#F59E0B]/10 text-[#F59E0B]",
  low: "bg-primary/10 text-primary",
};

export default function OpenProblemsCard() {
  const { data: employees = [] } = useQuery({ queryKey: ['employees'], queryFn: employeeAPI.fetchAll });
  const { data: problems = [] } = useQuery({ queryKey: ['problems'], queryFn: problemAPI.fetchAll });

  const openProblems = problems.filter((p) => p.status === "open");
  const resolvedProblems = problems.filter((p) => p.status === "resolved");
  const probByPriority = {
    high: problems.filter((p) => p.priority === "high").length,
    medium: problems.filter((p) => p.priority === "medium").length,
    low: problems.filter((p) => p.priority === "low").length,
  };

  return (
    <div
      className="bg-surface-container-lowest rounded-xl border border-surface-container-highest overflow-hidden"
      style={CARD_SHADOW}
    >
      <div className="p-4 border-b border-surface-container-highest flex justify-between items-center">
        <h3 className="text-headline-md font-headline-md text-on-surface">Open Problems</h3>
        <div className="flex gap-2.5 text-label-sm font-label-sm text-on-surface-variant">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-error inline-block" /> High: {probByPriority.high}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B] inline-block" /> Med: {probByPriority.medium}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-primary inline-block" /> Low: {probByPriority.low}
          </span>
        </div>
      </div>
      <div className="divide-y divide-surface-container-highest">
        {openProblems.length === 0 ? (
          <p className="p-4 text-center text-on-surface-variant">No open problems.</p>
        ) : (
          openProblems.map((p) => {
            const emp = employees.find((e) => e.id === p.employeeId);
            return (
              <div
                key={p.id}
                className="p-3 flex items-start gap-3 hover:bg-surface-container-lowest/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-label-sm font-label-sm text-on-surface-variant">{p.ticketId}</span>
                    <span
                      className={`text-label-sm font-label-sm px-2 py-0.5 rounded-full capitalize ${PSTY[p.priority] ?? "bg-surface-container text-on-surface"}`}
                    >
                      {p.priority}
                    </span>
                  </div>
                  <p className="text-body-sm font-body-sm text-on-surface font-medium">{p.category}</p>
                  {emp && (
                    <p className="text-label-sm font-label-sm text-on-surface-variant mt-1">
                      {emp.fullName} · {cap(emp.department)}
                    </p>
                  )}
                </div>
                <p className="text-label-sm font-label-sm text-on-surface-variant shrink-0">{p.filedDate}</p>
              </div>
            );
          })
        )}
      </div>
      {resolvedProblems.length > 0 && (
        <div className="p-3 bg-surface-container-low flex items-center gap-2 text-label-sm font-label-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span>
          {resolvedProblems.length} problem{resolvedProblems.length > 1 ? "s" : ""} resolved
        </div>
      )}
    </div>
  );
}
