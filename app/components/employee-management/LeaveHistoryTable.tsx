import { Button } from "../ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableLoading,
  TableRow,
  TableToolbar,
  TableEmpty,
} from "../ui/DataTable";
import { getLeaveDotColor, getLeaveStatusColor } from "../../lib/Utils";

interface Leave {
  id: string | number;
  type: string;
  duration: string;
  appliedDate: string;
  status: string;
}

interface LeaveHistoryTableProps {
  leaves: Leave[];
  isLoading: boolean;
}

export default function LeaveHistoryTable({
  leaves,
  isLoading,
}: LeaveHistoryTableProps) {
  return (
    <TableContainer className="h-full">
      <TableToolbar title="Leave History" count={leaves.length} />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Leave Type</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Applied On</TableHead>
            <TableHead>Status</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableLoading colSpan={5} />
          ) : leaves.length === 0 ? (
            <TableEmpty
              colSpan={5}
              icon="event_note"
              message="No leave history found"
              description="You haven't requested any leaves yet"
            />
          ) : (
            leaves.map((leave) => {
              const statusColor = getLeaveStatusColor(leave.status);
              const dotColor = getLeaveDotColor(leave.type);

              return (
                <TableRow key={leave.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${dotColor}`}></div>
                      <span className="font-label-md">{leave.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-label-md">{leave.duration}</span>
                  </TableCell>
                  <TableCell className="text-on-surface-variant">
                    {leave.appliedDate}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-semibold ${statusColor}`}
                    >
                      {leave.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-on-surface-variant hover:text-primary"
                    >
                      <span className="material-symbols-outlined">
                        more_vert
                      </span>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
