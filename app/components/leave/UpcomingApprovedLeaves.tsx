import type { LeaveRequestWithEmployee } from '../../services/Api';

interface UpcomingApprovedLeavesProps {
  upcomingLeaves: LeaveRequestWithEmployee[];
}

export default function UpcomingApprovedLeaves({ upcomingLeaves }: UpcomingApprovedLeavesProps) {
  return (
    <div className="xl:col-span-1 bg-surface-container-lowest border border-surface-variant rounded-xl p-4 h-fit">
      <div className="flex justify-between items-center mb-4 border-b border-surface-variant pb-3">
        <h3 className="text-headline-md font-headline-md text-on-surface">Upcoming Approved</h3>
        <button className="text-primary hover:text-primary/70 transition-colors">
          <span className="material-symbols-outlined">calendar_month</span>
        </button>
      </div>
      <div className="space-y-3">
        <h4 className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">
          Approved Leaves
        </h4>
        {upcomingLeaves.length > 0 ? (
          <ul className="space-y-3">
            {upcomingLeaves.map((leave) => (
              <li key={leave.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-label-md font-label-md text-primary font-bold">
                    {leave.employee.fullName?.charAt(0)?.toUpperCase() ?? "?"}
                  </span>
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-label-md font-label-md text-on-surface truncate">
                    {leave.employee.fullName}
                  </span>
                  <span className="text-label-sm font-label-sm text-on-surface-variant truncate">
                    {leave.type} • {leave.appliedDate}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-body-sm font-body-sm text-on-surface-variant text-center py-4">
            No approved leaves yet
          </p>
        )}
        <button className="w-full bg-surface-container-low text-on-surface py-2 rounded-lg text-label-md font-label-md hover:bg-surface-container-high transition-colors mt-4">
          View Full Calendar
        </button>
      </div>
    </div>
  );
}
