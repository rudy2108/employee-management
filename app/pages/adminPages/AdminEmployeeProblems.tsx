import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useCallback, useState } from "react";
import ProblemsFiltersBar from "../../components/problems/ProblemsFiltersBar";
import ProblemsTable from "../../components/problems/ProblemsTable";
import ViewProblemModal from "../../components/problems/ViewProblemModal";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatCard, StatCardContent } from "../../components/ui/StatCard";
import type { Employee, EmployeeProblem } from "../../services/Api";
import { employeeAPI, pageConfigAPI, pageStatAPI, problemAPI } from "../../services/Api";

type ProblemStatus = "open" | "in_progress" | "resolved";

export default function EmployeeProblemsPage() {
  const queryClient = useQueryClient();
  const { data: employees = [], isLoading: empLoading } = useQuery({ queryKey: ['employees'], queryFn: employeeAPI.fetchAll });
  const { data: problems = [], isLoading: probLoading } = useQuery({ queryKey: ['problems'], queryFn: problemAPI.fetchAll });
  const { data: pageConfigs = [] } = useQuery({ queryKey: ['pageConfigs', 'problems'], queryFn: () => pageConfigAPI.fetchByPage('problems') });
  const { data: statCards = [] } = useQuery({ queryKey: ['pageStats', 'problems'], queryFn: () => pageStatAPI.fetchByPage('problems') });
  const pageConfig = pageConfigs[0];

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string | number; status: ProblemStatus }) =>
      problemAPI.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['problems'] }),
  });
  const deleteProblemMutation = useMutation({
    mutationFn: (id: string | number) => problemAPI.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['problems'] }),
  });

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProblem, setSelectedProblem] = useState<(EmployeeProblem & { employee: Employee }) | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const employeeById = useMemo(
    () => new Map(employees.map((e) => [e.id, e])),
    [employees]
  );

  const problemsWithEmployees = useMemo(
    () =>
      problems
        .map((problem) => {
          const employee = employeeById.get(problem.employeeId);
          return employee ? { ...problem, employee } : null;
        })
        .filter((x): x is NonNullable<typeof x> => x !== null),
    [problems, employeeById]
  );

  const filtered = useMemo(
    () =>
      problemsWithEmployees.filter((p) => {
        const matchesSearch =
          p.employee.fullName.toLowerCase().includes(search.toLowerCase()) ||
          p.ticketId.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
        const matchesStatus = statusFilter === "all" || p.status === statusFilter;
        return matchesSearch && matchesCategory && matchesStatus;
      }),
    [problemsWithEmployees, search, categoryFilter, statusFilter]
  );

  const { openCount, inProgressCount, resolvedCount, highPriorityCount } = useMemo(() => {
    let open = 0, inProgress = 0, resolved = 0, highPriority = 0;
    for (const p of problems) {
      if (p.status === "open") open++;
      else if (p.status === "in_progress") inProgress++;
      else if (p.status === "resolved") resolved++;
      if (p.priority === "high") highPriority++;
    }
    return { openCount: open, inProgressCount: inProgress, resolvedCount: resolved, highPriorityCount: highPriority };
  }, [problems]);

  const handleUpdateStatus = useCallback(
    (id: string | number, status: ProblemStatus) => updateStatusMutation.mutate({ id, status }),
    [updateStatusMutation]
  );
  const handleDelete = useCallback(
    (id: string | number) => deleteProblemMutation.mutate(id),
    [deleteProblemMutation]
  );
  const handleView = useCallback(
    (problem: EmployeeProblem & { employee: Employee }) => { setSelectedProblem(problem); setIsViewModalOpen(true); },
    []
  );

  return (
    <>
      <main className="flex-1 p-4 md:p-4 space-y-4">
          <PageHeader title={pageConfig?.title ?? ''} subtitle={pageConfig?.subtitle ?? ''} />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {statCards.map((card) => {
              const valuesMap: Record<string, number> = {
                openIssues: openCount,
                pendingInvestigation: inProgressCount,
                resolvedThisMonth: resolvedCount,
                highPriority: highPriorityCount,
              };
              return (
                <StatCard key={card.id} variant="hr">
                  <StatCardContent card={card} value={valuesMap[card.key] ?? 0} />
                </StatCard>
              );
            })}
          </div>

          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant custom-shadow overflow-hidden">
            <ProblemsFiltersBar
              search={search}
              categoryFilter={categoryFilter}
              statusFilter={statusFilter}
              filteredCount={filtered.length}
              totalCount={problems.length}
              onSearchChange={setSearch}
              onCategoryChange={setCategoryFilter}
              onStatusChange={setStatusFilter}
            />
            <ProblemsTable
              filtered={filtered}
              isLoading={empLoading || probLoading}
              totalCount={problems.length}
              onUpdateStatus={handleUpdateStatus}
              onDelete={handleDelete}
              onView={handleView}
            />
          </div>
        </main>

      <ViewProblemModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        problem={selectedProblem}
      />
    </>
  );
}
