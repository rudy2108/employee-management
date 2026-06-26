import type { Employee, LeaveRequest } from "../../services/Api";
import { computeLeaveDays } from "../../services/Api";
import { useMemo } from "react";
import { Link } from "react-router";
import { Button } from "../ui/Button";
import {
  TableContainer,
  TableToolbar,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
  TableLoading,
  TableError,
  TableAvatar,
  TableBadge,
} from "../ui/DataTable";

const STATUS_VARIANT: Record<string, "primary" | "warning" | "secondary" | "error"> = {
  'full-time': 'primary',
  'part-time': 'warning',
  contract: 'secondary',
  probation: 'error',
};

interface EmployeeTableProps {
  filteredEmployees: Employee[];
  leaveRequests: LeaveRequest[];
  loading: boolean;
  error: Error | null;
  searchQuery: string;
  employees: Employee[];
  onDelete: (id: string | number) => void;
  onOpenModal: (e: React.MouseEvent, id: string | number, name: string) => void;
  onCancelLeave: (e: React.MouseEvent, id: string | number) => void;
}

interface EmployeeLeaveStats {
  takenDays: number;
  pendingCount: number;
}

export default function EmployeeTable({
  filteredEmployees,
  leaveRequests,
  loading,
  error,
  searchQuery,
  employees,
  onDelete,
  onOpenModal,
  onCancelLeave,
}: EmployeeTableProps) {
  const leaveStatsByEmployee = useMemo(() => {
    const map = new Map<string | number, EmployeeLeaveStats>();
    for (const r of leaveRequests) {
      if (!r.employeeId) continue;
      const existing = map.get(r.employeeId) ?? { takenDays: 0, pendingCount: 0 };
      if (r.status === 'approved') {
        existing.takenDays += computeLeaveDays(r.startDate, r.endDate);
      } else if (r.status === 'pending' || r.status === 'hr_approved') {
        existing.pendingCount += 1;
      }
      map.set(r.employeeId, existing);
    }
    return map;
  }, [leaveRequests]);

  const colSpan = 7;

  return (
    <TableContainer>
      <TableToolbar title="All Employees" count={filteredEmployees.length} />

      <Table>
        <TableHeader>
          <tr className="border-b border-surface-container-highest">
            <TableHead size="lg">Employee</TableHead>
            <TableHead size="lg" className="hidden md:table-cell">ID</TableHead>
            <TableHead size="lg" className="hidden sm:table-cell">Department</TableHead>
            <TableHead size="lg" className="hidden lg:table-cell">Date Joined</TableHead>
            <TableHead size="lg">Status</TableHead>
            <TableHead size="lg" className="hidden xl:table-cell">Leave Balance</TableHead>
            <TableHead size="lg" align="right">Actions</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {loading && <TableLoading colSpan={colSpan} message="Loading employees…" />}

          {!loading && error && <TableError colSpan={colSpan} message={error.message} />}

          {!loading && !error && employees.length === 0 && (
            <TableEmpty
              colSpan={colSpan}
              icon="group"
              message="No employees yet."
              action={
                <Button asChild>
                  <Link to="/employee-management/add">
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                    Add your first employee
                  </Link>
                </Button>
              }
            />
          )}

          {!loading && !error && employees.length > 0 && filteredEmployees.length === 0 && (
            <TableEmpty
              colSpan={colSpan}
              icon="search_off"
              message={`No employees match "${searchQuery}".`}
            />
          )}

          {!loading && !error && filteredEmployees.map((emp) => {
            const stats = leaveStatsByEmployee.get(emp.id);
            const takenDays = stats?.takenDays ?? 0;
            const pendingCount = stats?.pendingCount ?? 0;
            const totalLeaves = emp.totalLeaves ?? 12;
            const remaining = totalLeaves - takenDays;
            const hasPending = pendingCount > 0;

            return (
              <TableRow key={emp.id} className="group">
                <TableCell size="lg">
                  <TableAvatar name={emp.fullName} subtitle={emp.email} />
                </TableCell>
                <TableCell size="lg" className="hidden md:table-cell">
                  <span className="text-body-sm font-body-sm text-on-surface-variant font-mono">{emp.empId}</span>
                </TableCell>
                <TableCell size="lg" className="hidden sm:table-cell">
                  <span className="text-body-sm font-body-sm text-on-surface capitalize">{emp.department}</span>
                </TableCell>
                <TableCell size="lg" className="hidden lg:table-cell">
                  <span className="text-body-sm font-body-sm text-on-surface-variant">{emp.dateOfJoining || '—'}</span>
                </TableCell>
                <TableCell size="lg">
                  <TableBadge
                    variant={STATUS_VARIANT[emp.status]}
                    label={emp.status}
                    className="capitalize"
                  />
                </TableCell>
                <TableCell size="lg" className="hidden xl:table-cell">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-label-sm font-label-sm font-bold ${remaining <= 3 ? 'text-error' : 'text-on-surface'}`}>
                        {takenDays} / {totalLeaves}
                      </span>
                      <span className="text-label-sm font-label-sm text-on-surface-variant">used</span>
                    </div>
                    <div className="w-24 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${remaining <= 3 ? 'bg-error' : 'bg-primary'}`}
                        style={{ width: `${Math.min(100, (takenDays / totalLeaves) * 100)}%` }}
                      />
                    </div>
                    {hasPending && (
                      <span className="text-label-sm font-label-sm text-[#F59E0B]">
                        {pendingCount} pending
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell size="lg" align="right">
                  <div className="inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`/employee-management/${emp.id}/edit`} title="Edit employee">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={(e) => onOpenModal(e, emp.id, emp.fullName)}
                      title="Request Leave"
                    >
                      <span className="material-symbols-outlined text-[20px]">event_note</span>
                    </Button>
                    {hasPending && (
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={(e) => onCancelLeave(e, emp.id)}
                        className="text-[#F59E0B] bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20"
                        title="Cancel Pending Leave"
                      >
                        <span className="material-symbols-outlined text-[20px]">event_busy</span>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(emp.id)}
                      className="hover:text-error hover:bg-error/10"
                      title="Delete employee"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
