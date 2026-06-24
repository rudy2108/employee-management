import { useState } from 'react';
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
  TableFooter,
  TableAvatar,
  TableBadge,
} from "../ui/DataTable";
import LeaveRequestDetailModal from './LeaveRequestDetailModal';

type LeaveStatus = "pending" | "hr_approved" | "hr_rejected" | "approved" | "rejected";

const STATUS_VARIANT: Record<LeaveStatus, "secondary" | "info" | "error" | "primary"> = {
  pending: "secondary",
  hr_approved: "info",
  hr_rejected: "error",
  approved: "primary",
  rejected: "error",
};

const STATUS_LABELS: Record<LeaveStatus, string> = {
  pending: "Pending",
  hr_approved: "HR Approved",
  hr_rejected: "HR Rejected",
  approved: "Approved",
  rejected: "Rejected",
};

interface Employee {
  id: string | number;
  fullName: string;
  department: string;
}

interface LeaveRequestWithEmployee {
  id: string | number;
  type: string;
  reason?: string;
  appliedDate: string;
  status: string;
  employee: Employee;
}

interface LeaveRequestsTableProps {
  filtered: LeaveRequestWithEmployee[];
  selected: Set<string | number>;
  totalLeaveRequests: number;
  search: string;
  onSearchChange: (value: string) => void;
  onToggleSelect: (id: string | number) => void;
  onToggleAll: () => void;
  onUpdateStatus: (id: string | number, status: LeaveStatus) => void;
  onDelete: (id: string | number) => void;
}

export default function LeaveRequestsTable({
  filtered,
  selected,
  totalLeaveRequests,
  search,
  onSearchChange,
  onToggleSelect,
  onToggleAll,
  onUpdateStatus,
  onDelete,
}: LeaveRequestsTableProps) {
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequestWithEmployee | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRowClick = (req: LeaveRequestWithEmployee) => {
    setSelectedRequest(req);
    setIsModalOpen(true);
  };

  return (
    <TableContainer className="xl:col-span-2 border-surface-variant">
      <TableToolbar title="Leave Requests" className="border-surface-variant">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">
              search
            </span>
            <input
              className="w-full pl-8 pr-3 py-1.5 bg-surface-container-low border border-outline-variant rounded-lg text-body-sm font-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              placeholder="Search employee..."
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm">
            <span className="material-symbols-outlined text-[16px]">filter_list</span>
            Filter
          </Button>
        </div>
      </TableToolbar>

      <Table>
        <TableHeader>
          <tr>
            <TableHead className="font-semibold w-10" align="center">
              <input
                type="checkbox"
                className="rounded border-outline-variant text-primary focus:ring-primary"
                checked={selected.size === filtered.length && filtered.length > 0}
                onChange={onToggleAll}
              />
            </TableHead>
            <TableHead className="font-semibold">Employee</TableHead>
            <TableHead className="font-semibold">Type</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold" align="right">Actions</TableHead>
          </tr>
        </TableHeader>
        <TableBody className="divide-surface-variant text-on-surface">
          {filtered.length > 0 ? (
            filtered.map((req) => {
              const status = req.status as LeaveStatus;
              return (
                <TableRow
                  key={req.id}
                  variant="clickable"
                  onClick={() => handleRowClick(req)}
                >
                  <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="rounded border-outline-variant text-primary focus:ring-primary"
                      checked={selected.has(req.id)}
                      onChange={() => onToggleSelect(req.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <TableAvatar
                      name={req.employee.fullName}
                      subtitle={req.employee.department}
                      size="sm"
                    />
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{req.type}</TableCell>
                  <TableCell>
                    <TableBadge
                      variant={STATUS_VARIANT[status]}
                      label={STATUS_LABELS[status]}
                    />
                  </TableCell>
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    {req.status === "hr_approved" ? (
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Approve"
                          onClick={() => onUpdateStatus(req.id, "approved")}
                          className="text-primary bg-primary/10 hover:bg-primary/20"
                        >
                          <span className="material-symbols-outlined text-[16px]">check</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Reject"
                          onClick={() => onUpdateStatus(req.id, "rejected")}
                          className="text-error bg-error/10 hover:bg-error/20"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Remove"
                        onClick={() => onDelete(req.id)}
                        className="hover:text-error hover:bg-error/10"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableEmpty
              colSpan={5}
              message={
                totalLeaveRequests === 0
                  ? "No leave requests yet. Request leave from Employee Management."
                  : "No leave requests awaiting admin review."
              }
            />
          )}
        </TableBody>
      </Table>

      <TableFooter showing={filtered.length} total={totalLeaveRequests} label="leave requests" />

      <LeaveRequestDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        leaveRequest={selectedRequest}
        onUpdateStatus={onUpdateStatus}
        onDelete={onDelete}
      />
    </TableContainer>
  );
}
