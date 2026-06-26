import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useCallback, useState } from "react";
import LeaveRequestsTable from "../../components/leave/LeaveRequestsTable";
import UpcomingApprovedLeaves from "../../components/leave/UpcomingApprovedLeaves";
import { Button } from "../../components/ui/Button";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatCard, StatCardContent } from "../../components/ui/StatCard";
import { employeeAPI, leaveAPI, pageConfigAPI, pageStatAPI } from "../../services/Api";

type LeaveStatus = "pending" | "hr_approved" | "hr_rejected" | "approved" | "rejected";

export default function LeavePage() {
  const queryClient = useQueryClient();
  const { data: leaveRequests = [] } = useQuery({ queryKey: ['leaves'], queryFn: leaveAPI.fetchAll });
  const { data: employees = [] } = useQuery({ queryKey: ['employees'], queryFn: employeeAPI.fetchAll });
  const { data: pageConfigs = [] } = useQuery({ queryKey: ['pageConfigs', 'leave'], queryFn: () => pageConfigAPI.fetchByPage('leave') });
  const { data: statCards = [] } = useQuery({ queryKey: ['pageStats', 'leave'], queryFn: () => pageStatAPI.fetchByPage('leave') });
  const pageConfig = pageConfigs[0];
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string | number>>(new Set());

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string | number; status: LeaveStatus }) =>
      leaveAPI.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leaves'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => leaveAPI.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leaves'] }),
  });

  const visibleRequests = useMemo(
    () => leaveRequests.filter(
      (r) => r.status === "hr_approved" || r.status === "approved" || r.status === "rejected"
    ),
    [leaveRequests]
  );

  const employeeById = useMemo(
    () => new Map(employees.map((e) => [e.id, e])),
    [employees]
  );

  const leaveRequestsWithEmployees = useMemo(
    () =>
      visibleRequests
        .map((leave) => {
          const employee = employeeById.get(leave.employeeId);
          return employee ? { ...leave, employee } : null;
        })
        .filter((x): x is NonNullable<typeof x> => x !== null),
    [visibleRequests, employeeById]
  );

  const filtered = useMemo(
    () =>
      leaveRequestsWithEmployees.filter(
        (r) =>
          r.employee.fullName.toLowerCase().includes(search.toLowerCase()) ||
          r.employee.department.toLowerCase().includes(search.toLowerCase())
      ),
    [leaveRequestsWithEmployees, search]
  );

  const toggleSelect = useCallback((id: string | number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    }), []);

  const toggleAll = useCallback(() =>
    setSelected((prev) => prev.size === filtered.length ? new Set() : new Set(filtered.map((r) => r.id))),
    [filtered]);

  const { approvedCount, hrApprovedCount } = useMemo(() => {
    let approved = 0, hrApproved = 0;
    for (const r of leaveRequests) {
      if (r.status === "approved") approved++;
      else if (r.status === "hr_approved") hrApproved++;
    }
    return { approvedCount: approved, hrApprovedCount: hrApproved };
  }, [leaveRequests]);

  const upcomingLeaves = useMemo(
    () =>
      leaveRequests
        .filter((r) => r.status === "approved")
        .slice(0, 3)
        .map((leave) => {
          const employee = employeeById.get(leave.employeeId);
          return employee ? { ...leave, employee } : null;
        })
        .filter((x): x is NonNullable<typeof x> => x !== null),
    [leaveRequests, employeeById]
  );

  const handleUpdateStatus = useCallback(
    (id: string | number, status: LeaveStatus) => updateStatusMutation.mutate({ id, status }),
    [updateStatusMutation]
  );
  const handleDelete = useCallback(
    (id: string | number) => deleteMutation.mutate(id),
    [deleteMutation]
  );

  return (
    <main className="flex-1 p-4 md:p-4 space-y-4">
      <PageHeader title={pageConfig?.title ?? ''} subtitle={pageConfig?.subtitle ?? ''}>
        <Button variant="outline">
          <span className="material-symbols-outlined text-[18px]">settings</span>
          Leave Configuration
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {statCards.map((card) => {
          const valuesMap: Record<string, number> = {
            totalLeaveRequests: leaveRequests.length,
            pendingAdminReview: hrApprovedCount,
            approvedRequests: approvedCount,
          };
          return (
            <StatCard key={card.id} variant="hr">
              <StatCardContent card={card} value={valuesMap[card.key] ?? 0} />
            </StatCard>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
        <UpcomingApprovedLeaves upcomingLeaves={upcomingLeaves} />
        <LeaveRequestsTable
          filtered={filtered}
          selected={selected}
          totalLeaveRequests={leaveRequests.length}
          search={search}
          onSearchChange={setSearch}
          onToggleSelect={toggleSelect}
          onToggleAll={toggleAll}
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleDelete}
        />
      </div>
    </main>
  );
}
