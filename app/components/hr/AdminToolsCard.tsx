import type { LeaveRequest } from '../../services/Api';
import { Button } from "../ui/Button";

interface AdminToolsCardProps {
  leaveRequests: LeaveRequest[];
  onOpenRoles: () => void;
  onOpenHolidays: () => void;
  onOpenPolicies: () => void;
}

export default function AdminToolsCard({
  leaveRequests,
  onOpenRoles,
  onOpenHolidays,
  onOpenPolicies,
}: AdminToolsCardProps) {
  const tools = [
    { label: 'Manage Roles', icon: 'vpn_key', onClick: onOpenRoles },
    { label: 'Holidays', icon: 'celebration', onClick: onOpenHolidays },
    { label: 'Policies', icon: 'policy', onClick: onOpenPolicies },
  ];

  const summaryItems = [
    { color: 'bg-[#F59E0B]', label: 'Pending', status: 'pending' },
    { color: 'bg-[#0EA5E9]', label: 'HR Approved', status: 'hr_approved' },
    { color: 'bg-[#EF4444]', label: 'HR Rejected', status: 'hr_rejected' },
    { color: 'bg-primary', label: 'Fully Approved', status: 'approved' },
  ];

  return (
    <div
      className="bg-surface-container-lowest rounded-xl border border-surface-container-highest p-4 h-full"
      style={{ boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)' }}
    >
      <h3 className="text-headline-md font-headline-md text-on-surface mb-4">Admin Tools</h3>
      <div className="grid grid-cols-2 gap-3">
        {tools.map(({ label, icon, onClick }) => (
          <Button
            key={label}
            variant="ghost"
            onClick={onClick}
            className="flex flex-col items-center justify-center p-3 h-auto bg-surface-container hover:bg-surface-container-high rounded-xl border border-transparent hover:border-primary/20 group"
          >
            <div className="bg-surface-container-lowest p-2.5 rounded-full shadow-sm mb-2.5 group-hover:text-primary text-on-surface-variant transition-colors">
              <span className="material-symbols-outlined">{icon}</span>
            </div>
            <span className="text-label-sm font-label-sm text-center text-on-surface">{label}</span>
          </Button>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-surface-container-highest">
        <h4 className="text-label-md font-label-md text-on-surface mb-3">Approval Summary</h4>
        <div className="space-y-3">
          {summaryItems.map(({ color, label, status }) => (
            <div key={status} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${color}`} />
                <span className="text-label-sm font-label-sm text-on-surface-variant">{label}</span>
              </div>
              <span className="text-label-md font-label-md text-on-surface">
                {leaveRequests.filter((r) => r.status === status).length}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
