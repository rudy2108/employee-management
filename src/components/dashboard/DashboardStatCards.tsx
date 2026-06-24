import { useQuery } from "@tanstack/react-query";
import { employeeAPI, leaveAPI, problemAPI, jobApplicationAPI, pageStatAPI } from "../../services/Api";
import { StatCard, StatCardContent } from "../ui/StatCard";

export default function DashboardStatCards() {
  const { data: statCards = [] } = useQuery({ queryKey: ['pageStats', 'dashboard'], queryFn: () => pageStatAPI.fetchByPage('dashboard') });
  const { data: employees = [] } = useQuery({ queryKey: ['employees'], queryFn: employeeAPI.fetchAll });
  const { data: leaveRequests = [] } = useQuery({ queryKey: ['leaves'], queryFn: leaveAPI.fetchAll });
  const { data: problems = [] } = useQuery({ queryKey: ['problems'], queryFn: problemAPI.fetchAll });
  const { data: applications = [] } = useQuery({ queryKey: ['jobApplications'], queryFn: jobApplicationAPI.fetchAll });

  const valuesMap: Record<string, number> = {
    totalEmployees: employees.length,
    openProblems: problems.filter((p) => p.status === "open").length,
    pendingLeaves: leaveRequests.filter((l) => l.status === "pending").length,
    jobApplications: applications.length,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {statCards.map((card) => (
        <StatCard key={card.id} variant="hr">
          <StatCardContent card={card} value={valuesMap[card.key] ?? 0} />
        </StatCard>
      ))}
    </div>
  );
}
