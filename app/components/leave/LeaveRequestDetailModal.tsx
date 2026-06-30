import type { LeaveRequestWithEmployee } from '../../services/Api';
import { Button } from '../ui/Button';

type LeaveStatus = 'pending' | 'hr_approved' | 'hr_rejected' | 'approved' | 'rejected';

const statusConfig: Record<LeaveStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-secondary-container text-on-secondary-container' },
  hr_approved: { label: 'HR Approved', className: 'bg-[#0EA5E9]/10 text-[#0EA5E9]' },
  hr_rejected: { label: 'HR Rejected', className: 'bg-error/10 text-error' },
  approved: { label: 'Approved', className: 'bg-primary-container/20 text-on-primary-container' },
  rejected: { label: 'Rejected', className: 'bg-error-container/50 text-error' },
};

interface LeaveRequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaveRequest: LeaveRequestWithEmployee | null;
  onUpdateStatus: (id: string | number, status: LeaveStatus) => void;
  onDelete: (id: string | number) => void;
}

export default function LeaveRequestDetailModal({ isOpen, onClose, leaveRequest, onUpdateStatus, onDelete }: LeaveRequestDetailModalProps) {
  if (!isOpen || !leaveRequest) return null;

  const cfg = statusConfig[leaveRequest.status as LeaveStatus] || { label: leaveRequest.status, className: 'bg-gray-100 text-gray-700' };
  const isUrgent = leaveRequest.type === 'Immediate Leave';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm bg-black/40">
      <div className="absolute inset-0" onClick={onClose} />
      <div
        className="relative bg-surface-container-lowest w-full max-w-[540px] rounded-xl shadow-2xl border border-outline-variant overflow-hidden animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 py-6 border-b border-outline-variant flex justify-between items-center gap-4 bg-surface-bright">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-headline-md text-on-surface">Leave Request Details</h2>
            </div>
            <p className="text-body-sm text-on-surface-variant mt-2">
              Review the full details of this leave request.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} type="button" className="rounded-full flex-shrink-0">
            <span className="material-symbols-outlined">close</span>
          </Button>
        </div>

        <div className="p-8 space-y-6 custom-scrollbar max-h-[70vh] overflow-y-auto">
          <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/50">
            <h3 className="font-label-md text-on-surface-variant mb-3">Employee</h3>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
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

          <div className="grid grid-cols-2 gap-6">
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
              <span className="font-label-md text-on-surface-variant">Status</span>
              <div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${cfg.className}`}>
                  {cfg.label}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="font-label-md text-on-surface-variant">Applied Date</span>
              <p className="text-body-md text-on-surface font-medium">{leaveRequest.appliedDate}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-label-md text-on-surface-variant">Reason</span>
            <div className="w-full p-4 bg-surface-container-low border border-outline-variant rounded-xl text-body-md text-on-surface whitespace-pre-wrap min-h-[80px]">
              {leaveRequest.reason || 'No reason provided.'}
            </div>
          </div>
        </div>

        <div className="px-8 py-6 bg-surface-bright border-t border-outline-variant flex items-center justify-end gap-3">
          {leaveRequest.status === 'hr_approved' ? (
            <>
              <Button variant="danger" onClick={() => { onUpdateStatus(leaveRequest.id, 'rejected'); onClose(); }}>
                Reject
              </Button>
              <Button onClick={() => { onUpdateStatus(leaveRequest.id, 'approved'); onClose(); }}>
                Approve
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button variant="danger" onClick={() => { onDelete(leaveRequest.id); onClose(); }}>
                <span className="material-symbols-outlined text-[16px]">delete</span>
                Delete
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
