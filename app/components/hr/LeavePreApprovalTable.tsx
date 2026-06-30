import { useState, useMemo } from 'react';
import type { LeaveRequestWithEmployee, LeaveRequest } from '../../services/Api';
import { Button } from '../ui/Button';
import {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
  TableAvatar,
  TableBadge,
} from '../ui/DataTable';
import { computeLeaveDays } from '../../services/Api';
import LeaveDetailModal from './LeaveDetailModal';

type FilterTab = 'all' | 'urgent';

interface LeavePreApprovalTableProps {
  filteredRequests: LeaveRequestWithEmployee[];
  allLeaves: LeaveRequest[];
  filterTab: FilterTab;
  onFilterChange: (tab: FilterTab) => void;
  onApprove: (id: string | number) => void;
  onReject: (id: string | number) => void;
}

export default function LeavePreApprovalTable({
  filteredRequests,
  allLeaves,
  filterTab,
  onFilterChange,
  onApprove,
  onReject,
}: LeavePreApprovalTableProps) {
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequestWithEmployee | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const takenDaysByEmployee = useMemo(() => {
    const map = new Map<string | number, number>();
    for (const r of allLeaves) {
      if (!r.employeeId || r.status !== 'approved') continue;
      map.set(r.employeeId, (map.get(r.employeeId) ?? 0) + computeLeaveDays(r.startDate, r.endDate));
    }
    return map;
  }, [allLeaves]);

  const handleRowClick = (req: LeaveRequestWithEmployee) => {
    setSelectedRequest(req);
    setIsModalOpen(true);
  };

  const selectedTaken = selectedRequest
    ? takenDaysByEmployee.get(selectedRequest.employee.id) ?? 0
    : 0;

  return (
    <TableContainer variant="elevated" className="p-4 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-headline-md font-headline-md text-on-surface">Leave Pre-Approval</h3>
        <div className="flex gap-2">
          {(['all', 'urgent'] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => onFilterChange(tab)}
              className={`text-label-sm font-label-sm px-3 py-1 rounded-full border transition-colors ${
                filterTab === tab
                  ? 'border-primary/20 bg-primary/10 text-primary'
                  : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {tab === 'all' ? 'All Requests' : 'Urgent'}
            </button>
          ))}
        </div>
      </div>

      <Table>
        <TableHeader>
          <tr>
            <TableHead size="sm" className="rounded-tl-lg">Employee</TableHead>
            <TableHead size="sm">Leave Type</TableHead>
            <TableHead size="sm">Duration</TableHead>
            <TableHead size="sm" align="right" className="rounded-tr-lg">Actions</TableHead>
          </tr>
        </TableHeader>
        <TableBody className="text-body-md font-body-md">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((req) => {
              return (
                <TableRow
                  key={req.id}
                  variant="clickable"
                  className="group"
                  onClick={() => handleRowClick(req)}
                >
                  <TableCell size="sm">
                    <TableAvatar
                      name={req.employee.fullName}
                      subtitle={req.employee.department}
                      size="sm"
                    />
                  </TableCell>
                  <TableCell size="sm" className="text-on-surface-variant">
                    <TableBadge
                      variant={req.type === 'Immediate Leave' ? 'error' : 'secondary'}
                      size="sm"
                      label={req.type}
                      icon={req.type === 'Immediate Leave' ? 'priority_high' : 'schedule'}
                      className="whitespace-nowrap"
                    />
                  </TableCell>
                  <TableCell size="sm" className="text-on-surface-variant whitespace-nowrap">{req.duration}</TableCell>
                  <TableCell size="sm" align="right">
                    <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <Button variant="danger" size="sm" onClick={() => onReject(req.id)}>
                        Reject
                      </Button>
                      <Button size="sm" onClick={() => onApprove(req.id)}>
                        Approve
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableEmpty
              colSpan={4}
              icon="task_alt"
              message="No pending leave requests to review."
              description="All caught up! New requests will appear here."
            />
          )}
        </TableBody>
      </Table>

      <LeaveDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        leaveRequest={selectedRequest}
        leavesTaken={selectedTaken}
        totalLeaves={selectedRequest?.employee.totalLeaves ?? 24}
        onApprove={onApprove}
        onReject={onReject}
      />
    </TableContainer>
  );
}
