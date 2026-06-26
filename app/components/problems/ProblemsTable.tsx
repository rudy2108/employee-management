import type { EmployeeProblem, Employee } from "../../services/Api";
import { Button } from "../ui/Button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
  TableLoading,
  TableFooter,
  TableBadge,
} from "../ui/DataTable";

type ProblemStatus = "open" | "in_progress" | "resolved";
type ProblemPriority = "low" | "medium" | "high";

const STATUS_LABELS: Record<ProblemStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
};

const STATUS_STYLES: Record<ProblemStatus, string> = {
  open: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  resolved: "bg-green-100 text-green-700",
};

const PRIORITY_LABELS: Record<ProblemPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const PRIORITY_STYLES: Record<ProblemPriority, string> = {
  low: "bg-blue-100 text-blue-700",
  medium: "bg-gray-100 text-gray-700",
  high: "bg-red-100 text-red-700",
};

const categoryColors: Record<string, string> = {
  Harassment: "bg-red-100 text-red-700",
  "Pay Dispute": "bg-orange-100 text-orange-700",
  "Workplace Safety": "bg-yellow-100 text-yellow-700",
  Discrimination: "bg-pink-100 text-pink-700",
  "Work Environment": "bg-purple-100 text-purple-700",
};

type ProblemWithEmployee = EmployeeProblem & { employee: Employee };

interface ProblemsTableProps {
  filtered: ProblemWithEmployee[];
  isLoading: boolean;
  totalCount: number;
  onUpdateStatus: (id: string | number, status: ProblemStatus) => void;
  onDelete: (id: string | number) => void;
  onView: (problem: ProblemWithEmployee) => void;
}

export default function ProblemsTable({
  filtered,
  isLoading,
  totalCount,
  onUpdateStatus,
  onDelete,
  onView,
}: ProblemsTableProps) {
  return (
    <>
      <Table>
        <TableHeader className="bg-surface-container-high/30 border-b border-outline-variant">
          <tr>
            {["Ticket ID", "Employee", "Category", "Filed Date", "Status", "Priority", "Actions"].map(
              (h, i) => (
                <TableHead
                  key={h}
                  size="lg"
                  align={i === 6 ? "right" : "left"}
                >
                  {h}
                </TableHead>
              )
            )}
          </tr>
        </TableHeader>
        <TableBody className="divide-outline-variant/30">
          {isLoading && <TableLoading colSpan={7} message="Loading problems..." />}

          {!isLoading && filtered.length === 0 && (
            <TableEmpty colSpan={7} message="No problems found matching your filters." />
          )}

          {!isLoading && filtered.map((problem) => {
            const status = problem.status as ProblemStatus;
            const priority = problem.priority as ProblemPriority;
            return (
              <TableRow key={problem.id}>
                <TableCell size="lg" className="text-label-md font-bold text-primary">{problem.ticketId}</TableCell>
                <TableCell size="lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-label-md font-label-md text-primary font-bold">
                        {problem.employee.fullName?.charAt(0)?.toUpperCase() ?? "?"}
                      </span>
                    </div>
                    <div>
                      <p className="text-label-md text-on-surface">{problem.employee.fullName}</p>
                      <p className="text-body-sm text-on-surface-variant">{problem.employee.department}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell size="lg">
                  <TableBadge
                    label={problem.category}
                    className={categoryColors[problem.category] ?? "bg-gray-100 text-gray-700"}
                  />
                </TableCell>
                <TableCell size="lg" className="text-body-sm">{problem.filedDate}</TableCell>
                <TableCell size="lg">
                  <TableBadge
                    size="lg"
                    label={STATUS_LABELS[status]}
                    className={STATUS_STYLES[status]}
                  />
                </TableCell>
                <TableCell size="lg">
                  <TableBadge
                    size="lg"
                    label={PRIORITY_LABELS[priority]}
                    className={`uppercase ${PRIORITY_STYLES[priority]}`}
                  />
                </TableCell>
                <TableCell size="lg" align="right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="View Details"
                      className="text-primary hover:bg-primary/10"
                      onClick={() => onView(problem)}
                    >
                      <span className="material-symbols-outlined text-xl">visibility</span>
                    </Button>
                    {problem.status !== "resolved" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Mark as Resolved"
                        onClick={() => onUpdateStatus(problem.id, "resolved")}
                        className="text-secondary hover:bg-secondary/10"
                      >
                        <span className="material-symbols-outlined text-xl">task_alt</span>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Delete"
                      onClick={() => onDelete(problem.id)}
                      className="text-error hover:bg-error/10"
                    >
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <TableFooter showing={filtered.length} total={totalCount} label="problems" />
    </>
  );
}
