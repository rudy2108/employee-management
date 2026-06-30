import { useCallback, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { employeeAPI, leaveAPI, pageConfigAPI, pageStatAPI } from '../../services/Api'
import Header from '../../components/layout/Header'
import { StatCard, StatCardContent } from '../../components/ui/StatCard'
import { PageHeader } from '../../components/ui/PageHeader'
import EmployeeTable from '../../components/employee-management/EmployeeTable'
import { Button } from '../../components/ui/Button'

export default function EmployeeManagementPage() {
  const queryClient = useQueryClient()
  const { data: employees = [], isLoading: loading, error } = useQuery({ queryKey: ['employees'], queryFn: employeeAPI.fetchAll })
  const { data: leaveRequests = [] } = useQuery({ queryKey: ['leaves'], queryFn: leaveAPI.fetchAll })
  const { data: pageConfigs = [] } = useQuery({ queryKey: ['pageConfigs', 'employeeManagement'], queryFn: () => pageConfigAPI.fetchByPage('employeeManagement') })
  const { data: statCards = [] } = useQuery({ queryKey: ['pageStats', 'employeeManagement'], queryFn: () => pageStatAPI.fetchByPage('employeeManagement') })
  const pageConfig = pageConfigs[0]

  const deleteEmployeeMutation = useMutation({
    mutationFn: (id: string | number) => employeeAPI.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  })

  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('q')?.toLowerCase() ?? ''

  const filteredEmployees = useMemo(
    () =>
      searchQuery
        ? employees.filter(
            (emp) =>
              emp.fullName?.toLowerCase().includes(searchQuery) ||
              emp.email?.toLowerCase().includes(searchQuery) ||
              emp.department?.toLowerCase().includes(searchQuery) ||
              emp.empId?.toLowerCase().includes(searchQuery)
          )
        : employees,
    [employees, searchQuery]
  )

  const statValues = useMemo(() => {
    let fullTime = 0, contract = 0, probation = 0
    for (const e of filteredEmployees) {
      if (e.status === 'full-time') fullTime++
      else if (e.status === 'contract') contract++
      else if (e.status === 'probation') probation++
    }
    return {
      totalEmployees: filteredEmployees.length,
      fullTime,
      contract,
      probation,
    }
  }, [filteredEmployees])

  const handleDelete = useCallback((id: string | number) => deleteEmployeeMutation.mutate(id), [deleteEmployeeMutation])

  return (
    <>
      <Header />

      <main className="flex-1 p-4 space-y-4">
        <PageHeader title={pageConfig?.title ?? ''} subtitle={pageConfig?.subtitle ?? ''}>
          <Button asChild
          >
            <Link to="/employee-management/add">
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              Add Employee
            </Link>
          </Button>
        </PageHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {statCards.map((card) => (
              <StatCard key={card.id} variant="hr">
                <StatCardContent card={card} value={statValues[card.key as keyof typeof statValues] ?? 0} />
              </StatCard>
            ))}
        </div>

        <EmployeeTable
          filteredEmployees={filteredEmployees}
          leaveRequests={leaveRequests}
          loading={loading}
          error={error as Error | null}
          searchQuery={searchQuery}
          employees={employees}
          onDelete={handleDelete}
        />
      </main>
    </>
  )
}
