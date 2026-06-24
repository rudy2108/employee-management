import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { employeeAPI, leaveAPI, problemAPI, jobApplicationAPI } from "../../services/Api";
import { cap, timeAgo, CARD_SHADOW } from "../../lib/Utils";

type ActivityItem = {
  key: string;
  date: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  sub: string;
};

export default function RecentActivityCard() {
  const { data: employees = [] } = useQuery({ queryKey: ['employees'], queryFn: employeeAPI.fetchAll });
  const { data: leaveRequests = [] } = useQuery({ queryKey: ['leaves'], queryFn: leaveAPI.fetchAll });
  const { data: problems = [] } = useQuery({ queryKey: ['problems'], queryFn: problemAPI.fetchAll });
  const { data: applications = [] } = useQuery({ queryKey: ['jobApplications'], queryFn: jobApplicationAPI.fetchAll });

  const activities: ActivityItem[] = useMemo(() => [
    ...employees
      .slice()
      .sort((a, b) => b.dateOfJoining.localeCompare(a.dateOfJoining))
      .slice(0, 3)
      .map((e) => ({
        key: `join-${e.id}`,
        date: e.dateOfJoining,
        icon: "person_add",
        iconBg: "bg-primary/10",
        iconColor: "text-primary",
        title: `${e.fullName} joined`,
        sub: cap(e.department),
      })),
    ...leaveRequests
      .slice()
      .sort((a, b) => b.appliedDate.localeCompare(a.appliedDate))
      .slice(0, 2)
      .map((l) => ({
        key: `leave-${l.id}`,
        date: l.appliedDate,
        icon: "flight_takeoff",
        iconBg: "bg-[#F59E0B]/10",
        iconColor: "text-[#F59E0B]",
        title: `Leave: ${l.type}`,
        sub: `Applied ${l.appliedDate}`,
      })),
    ...problems
      .slice()
      .sort((a, b) => b.filedDate.localeCompare(a.filedDate))
      .slice(0, 2)
      .map((p) => ({
        key: `prob-${p.id}`,
        date: p.filedDate,
        icon: "report_problem",
        iconBg: "bg-error/10",
        iconColor: "text-error",
        title: `Problem: ${p.category}`,
        sub: `${p.ticketId} · ${p.priority} priority`,
      })),
    ...applications
      .slice()
      .sort((a, b) => b.appliedDate.localeCompare(a.appliedDate))
      .slice(0, 2)
      .map((a) => ({
        key: `app-${a.id}`,
        date: a.appliedDate,
        icon: "work",
        iconBg: "bg-secondary/10",
        iconColor: "text-secondary",
        title: `${a.fullName} applied`,
        sub: `${a.position} · ${cap(a.department)}`,
      })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5), [employees, leaveRequests, problems, applications]);

  return (
    <div
      className="bg-surface-container-lowest rounded-xl border border-surface-container-highest overflow-hidden"
      style={CARD_SHADOW}
    >
      <div className="p-3 border-b border-surface-container-highest">
        <h3 className="text-headline-md font-headline-md text-on-surface">Recent Activity</h3>
      </div>
      <div className="p-3">
        <ul className="space-y-2.5">
          {activities.map((item, idx) => (
            <li key={item.key} className="flex gap-3 relative">
              {idx < activities.length - 1 && (
                <div className="absolute left-4 top-8 bottom-[-10px] w-px bg-surface-container-highest" />
              )}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ring-4 ring-surface-container-lowest ${item.iconBg} ${item.iconColor}`}
              >
                <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
              </div>
              <div>
                <p className="text-body-sm font-body-sm text-on-surface font-medium">{item.title}</p>
                <p className="text-label-sm font-label-sm text-on-surface-variant">{item.sub}</p>
                <p className="text-label-sm font-label-sm text-on-surface-variant/60 mt-0.5">
                  {timeAgo(item.date)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
