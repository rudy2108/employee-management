import type { JobApplication } from '../../services/Api';
import { Button } from "../ui/Button";
import {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
  TableBadge,
} from "../ui/DataTable";

const AVATAR_COLORS = [
  'bg-primary/10 text-primary',
  'bg-secondary/10 text-secondary',
  'bg-tertiary-container/20 text-tertiary',
];

function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .map((w) => w[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('');
}

function getAvatarColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

const STATUS_VARIANT: Record<string, "warning" | "primary" | "error"> = {
  pending: 'warning',
  approved: 'primary',
  rejected: 'error',
};

interface JobApplicationsTableProps {
  applications: JobApplication[];
  pendingApps: JobApplication[];
  selectedIds: Set<string | number>;
  actionLoading: boolean;
  onToggleSelect: (id: string | number) => void;
  onToggleSelectAll: () => void;
  onApprove: (id: string | number) => void;
  onReject: (id: string | number) => void;
  onBulkApprove: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

export default function JobApplicationsTable({
  applications,
  pendingApps,
  selectedIds,
  actionLoading,
  onToggleSelect,
  onToggleSelectAll,
  onApprove,
  onReject,
  onBulkApprove,
}: JobApplicationsTableProps) {
  return (
    <TableContainer variant="elevated" className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-headline-md font-headline-md text-on-surface">Recent Job Applications</h3>
        <Button
          variant="secondary"
          size="sm"
          onClick={onBulkApprove}
          disabled={selectedIds.size === 0 || actionLoading}
        >
          <span className="material-symbols-outlined">done_all</span>
          Bulk Approve
        </Button>
      </div>

      <Table>
        <TableHeader>
          <tr>
            <TableHead className="rounded-tl-lg w-12">
              <input
                type="checkbox"
                className="rounded border-outline-variant text-primary focus:ring-primary"
                checked={selectedIds.size === pendingApps.length && pendingApps.length > 0}
                onChange={onToggleSelectAll}
              />
            </TableHead>
            <TableHead>Candidate</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Department</TableHead>
            <TableHead align="center">Applied Date</TableHead>
            <TableHead align="center">Status</TableHead>
            <TableHead align="right" className="rounded-tr-lg">Actions</TableHead>
          </tr>
        </TableHeader>
        <TableBody className="text-body-md font-body-md">
          {applications.length === 0 ? (
            <TableEmpty colSpan={7} message="No job applications found." />
          ) : (
            applications.map((app, index) => (
              <TableRow key={app.id} className="group">
                <TableCell>
                  <input
                    type="checkbox"
                    className="rounded border-outline-variant text-primary focus:ring-primary"
                    checked={selectedIds.has(app.id)}
                    disabled={app.status !== 'pending'}
                    onChange={() => onToggleSelect(app.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-label-sm shrink-0 ${getAvatarColor(index)}`}>
                      {getInitials(app.fullName)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-on-surface">{app.fullName}</span>
                      <span className="text-label-sm font-label-sm text-on-surface-variant truncate">{app.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-on-surface-variant">{app.position}</TableCell>
                <TableCell className="text-on-surface-variant capitalize">{app.department}</TableCell>
                <TableCell align="center" className="text-on-surface-variant">{app.appliedDate}</TableCell>
                <TableCell align="center">
                  <TableBadge
                    variant={STATUS_VARIANT[app.status]}
                    label={STATUS_LABELS[app.status] ?? app.status}
                  />
                </TableCell>
                <TableCell align="right">
                  {app.status === 'pending' ? (
                    <div className="flex justify-end gap-2">
                      <Button variant="danger" size="sm" onClick={() => onReject(app.id)} disabled={actionLoading}>
                        Reject
                      </Button>
                      <Button size="sm" onClick={() => onApprove(app.id)} disabled={actionLoading}>
                        Approve
                      </Button>
                    </div>
                  ) : (
                    <span className="text-label-sm font-label-sm text-on-surface-variant italic">Decided</span>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
