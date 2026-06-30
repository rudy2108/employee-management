import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../Store";
import LeaveHistoryTable from "../../components/employee-management/LeaveHistoryTable";
import LeaveRequestModal from "../../components/employee-management/LeaveRequestModal";
import MyScheduleCalendar from "../../components/leave/MyScheduleCalendar";
import { LeaveStatCardContent, StatCard } from "../../components/ui/StatCard";
import { buildLeaveStatCards, computeLeaveStats, findCurrentEmployee } from "../../lib/Utils";
import { employeeAPI, leaveAPI, leaveStatCardAPI } from "../../services/Api";

const EMPTY_FORM = {
  reason: "",
  urgency: "regular" as "immediate" | "regular",
  startDate: "",
  endDate: "",
  singleDay: false,
};

export default function EmployeeLeave() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const admin = useSelector((s: RootState) => s.auth.admin);

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: employeeAPI.fetchAll,
  });

  const user = findCurrentEmployee(employees, admin?.email);

  const { data: leaveRequests = [], isLoading } = useQuery({
    queryKey: ["leaves"],
    queryFn: leaveAPI.fetchAll,
  });

  const { data: leaveStatCardConfigs = [] } = useQuery({
    queryKey: ["leaveStatCards"],
    queryFn: leaveStatCardAPI.fetchAll,
  });

  const createLeaveMutation = useMutation({
    mutationFn: (data: Parameters<typeof leaveAPI.create>[0]) =>
      leaveAPI.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leaves"] }),
  });

  const userLeaves = user
    ? leaveRequests.filter((l) => String(l.employeeId) === String(user.id))
    : [];

  const { pendingLeaves, usedLeaves, annualBalance, sickLeaveUsed } =
    computeLeaveStats(userLeaves, user?.totalLeaves ?? 12);

  const leaveStatCards = buildLeaveStatCards(leaveStatCardConfigs, {
    pendingLeaves,
    usedLeaves,
    annualBalance,
    sickLeaveUsed,
  });

  const handleFormChange = (updates: Partial<typeof EMPTY_FORM>) =>
    setForm((f) => ({ ...f, ...updates }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.reason.trim()) {
      setFormError("Please provide a reason for leave.");
      return;
    }
    if (!form.startDate) {
      setFormError("Please select a start date.");
      return;
    }
    if (!form.singleDay && !form.endDate) {
      setFormError("Please select an end date.");
      return;
    }
    if (!form.singleDay && form.endDate < form.startDate) {
      setFormError("End date cannot be before start date.");
      return;
    }

    const endDate = form.singleDay ? form.startDate : form.endDate;
    const duration =
      form.startDate === endDate ? "1 day" : `${form.startDate} to ${endDate}`;

    createLeaveMutation.mutate({
      employeeId: user?.id!,
      status: "pending",
      type: form.urgency === "immediate" ? "Immediate Leave" : "Regular Leave",
      duration,
      appliedDate: new Date().toISOString().split("T")[0],
      reason: form.reason.trim(),
      startDate: form.startDate,
      endDate,
    });
    setForm(EMPTY_FORM);
    setFormError("");
    setIsModalOpen(false);
  };

  return (
    <>
      <main className="flex-1 flex flex-col relative overflow-y-auto">
        <div className="p-8 md:p-12 space-y-8 max-w-[1400px] mx-auto w-full">
          {/* Summary Bento Grid */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {leaveStatCards.map((card) => (
              <StatCard
                key={card.label}
                className="h-40 flex flex-col justify-between"
                variant="leave"
              >
                <LeaveStatCardContent
                  icon={card.icon}
                  iconBg={card.iconBg}
                  iconColor={card.iconColor}
                  label={card.label}
                  value={card.value}
                  unit={card.unit}
                  badge={card.badge}
                />
              </StatCard>
            ))}

            {/* Action Card */}
            <div
              className="border border-primary rounded-xl p-4 flex flex-col justify-between h-40 shadow-lg shadow-primary/20 group cursor-pointer hover:scale-[1.02] transition-transform bg-surface-container-lowest hover:bg-primary hover:text-white transition-colors duration-300"
              onClick={() => setIsModalOpen(true)}
            >
              <div className="flex justify-between items-start">
                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-white/20 group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">add_circle</span>
                </div>
                <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity text-primary group-hover:text-white">
                  arrow_forward
                </span>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant group-hover:text-white/80">
                  Plan Time Off
                </p>
                <h3 className="text-headline-md font-bold text-on-surface group-hover:text-white">
                  Request Leave
                </h3>
              </div>
            </div>
          </section>

          {/* Main Layout Grid: History vs Calendar */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* History Table (2/3 width) */}
            <div className="lg:col-span-2">
              <LeaveHistoryTable leaves={userLeaves} isLoading={isLoading} />
            </div>

            {/* Personal Calendar View (1/3 width) */}
            <MyScheduleCalendar />
          </section>
        </div>

        {/* Request Leave Modal */}
        {isModalOpen && (
          <LeaveRequestModal
            employeeName={user?.fullName || "Employee"}
            form={form}
            formError={formError}
            onClose={() => {
              setForm(EMPTY_FORM);
              setFormError("");
              setIsModalOpen(false);
            }}
            onFormChange={handleFormChange}
            onSubmit={handleSubmit}
          />
        )}
      </main>
    </>
  );
}
