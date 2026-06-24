import { Button } from '../ui/Button';

interface Employee {
  id: string | number;
  fullName: string;
  department: string;
  totalLeaves: number;
}

export interface LeaveRequestWithEmployee {
  id: string | number;
  type: string;
  duration: string;
  appliedDate: string;
  reason?: string;
  employee: Employee;
}

interface LeaveDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaveRequest: LeaveRequestWithEmployee | null;
  leavesTaken: number;
  totalLeaves: number;
  onApprove: (id: string | number) => void;
  onReject: (id: string | number) => void;
}

export default function LeaveDetailModal({ isOpen, onClose, leaveRequest, leavesTaken, totalLeaves, onApprove, onReject }: LeaveDetailModalProps) {
  if (!isOpen || !leaveRequest) return null;

  const isUrgent = leaveRequest.type === 'Immediate Leave';
  const remaining = totalLeaves - leavesTaken;
  const usagePercent = Math.min(100, (leavesTaken / totalLeaves) * 100);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm bg-black/40">
      <div className="absolute inset-0" onClick={onClose} />
      <div
        className="relative bg-surface-container-lowest w-full max-w-[540px] rounded-xl shadow-2xl border border-outline-variant overflow-hidden animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-outline-variant flex justify-between items-center gap-3 bg-surface-bright">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-headline-md text-on-surface">Leave Request Details</h2>
            </div>
            <p className="text-body-sm text-on-surface-variant mt-1">
              Review the full details of this leave request.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} type="button" className="rounded-full flex-shrink-0">
            <span className="material-symbols-outlined">close</span>
          </Button>
        </div>

        <div className="p-5 space-y-4 custom-scrollbar max-h-[70vh] overflow-y-auto">
          <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/50">
            <h3 className="font-label-md text-on-surface-variant mb-2">Employee</h3>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-title-medium font-bold text-primary">
                  {leaveRequest.employee.fullName?.charAt(0)?.toUpperCase() ?? '?'}
                </span>
              </div>
              <div>
                <p className="font-title-medium text-on-surface font-bold">{leaveRequest.employee.fullName}</p>
                <p className="text-body-sm text-on-surface-variant capitalize">{leaveRequest.employee.department}</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/50">
            <h3 className="font-label-md text-on-surface-variant mb-2">Leave Balance</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-body-sm text-on-surface">
                <span className={`font-bold ${remaining <= 3 ? 'text-error' : 'text-on-surface'}`}>{leavesTaken}</span>
                {' / '}{totalLeaves} days used
              </span>
              <span className={`text-label-sm font-label-sm font-bold ${remaining <= 3 ? 'text-error' : 'text-primary'}`}>
                {remaining} remaining
              </span>
            </div>
            <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${remaining <= 3 ? 'bg-error' : 'bg-primary'}`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="font-label-md text-on-surface-variant">Leave Type</span>
              <div>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                    isUrgent ? 'bg-error/10 text-error' : 'bg-secondary/10 text-secondary'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {isUrgent ? 'priority_high' : 'schedule'}
                  </span>
                  {leaveRequest.type}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="font-label-md text-on-surface-variant">Duration</span>
              <p className="text-body-md text-on-surface font-medium">{leaveRequest.duration}</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="font-label-md text-on-surface-variant">Applied Date</span>
              <p className="text-body-md text-on-surface font-medium">{leaveRequest.appliedDate}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-label-md text-on-surface-variant">Reason</span>
            <div className="w-full p-3 bg-surface-container-low border border-outline-variant rounded-xl text-body-md text-on-surface whitespace-pre-wrap min-h-[70px]">
              {leaveRequest.reason || 'No reason provided.'}
            </div>
          </div>
        </div>

        <div className="px-5 py-4 bg-surface-bright border-t border-outline-variant flex items-center justify-end gap-3">
          <Button variant="danger" onClick={() => { onReject(leaveRequest.id); onClose(); }}>
            Reject
          </Button>
          <Button onClick={() => { onApprove(leaveRequest.id); onClose(); }}>
            Approve
          </Button>
        </div>
      </div>
    </div>
  );
}
