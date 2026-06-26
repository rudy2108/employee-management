import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useCallback, useState } from 'react'
import HolidaysModal from '../components/hr/HolidaysModal'
import ModalRoles from '../components/hr/ModalRoles'
import PoliciesModal from '../components/hr/PoliciesModal'

import AdminToolsCard from '../components/hr/AdminToolsCard'
import JobApplicationsTable from '../components/hr/JobApplicationsTable'
import LeavePreApprovalTable from '../components/hr/LeavePreApprovalTable'
import { PageHeader } from '../components/ui/PageHeader'
import { StatCard, StatCardContent } from '../components/ui/StatCard'
import { employeeAPI, jobApplicationAPI, leaveAPI, pageConfigAPI, pageStatAPI, type Employee } from '../services/Api'

type FilterTab = 'all' | 'urgent'

export default function HRAdministrationPage() {
  const queryClient = useQueryClient()
  const { data: leaveRequests = [] } = useQuery({ queryKey: ['leaves'], queryFn: leaveAPI.fetchAll })
  const { data: employees = [] } = useQuery({ queryKey: ['employees'], queryFn: employeeAPI.fetchAll })
  const { data: applications = [] } = useQuery({ queryKey: ['jobApplications'], queryFn: jobApplicationAPI.fetchAll })
  const { data: pageConfigs = [] } = useQuery({ queryKey: ['pageConfigs', 'hrAdmin'], queryFn: () => pageConfigAPI.fetchByPage('hrAdmin') })
  const { data: statCards = [] } = useQuery({ queryKey: ['pageStats', 'hrAdmin'], queryFn: () => pageStatAPI.fetchByPage('hrAdmin') })
  const pageConfig = pageConfigs[0]

  const updateLeaveStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string | number; status: 'hr_approved' | 'hr_rejected' }) =>
      leaveAPI.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leaves'] }),
  })

  const approveAppMutation = useMutation({
    mutationFn: async ({ id, newEmployee }: { id: string | number; newEmployee: Omit<Employee, 'id'> }) => {
      await jobApplicationAPI.update(id, { status: 'approved' })
      await employeeAPI.add(newEmployee)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobApplications'] })
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })

  const rejectAppMutation = useMutation({
    mutationFn: (id: string | number) => jobApplicationAPI.update(id, { status: 'rejected' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jobApplications'] }),
  })

  const bulkApproveMutation = useMutation({
    mutationFn: async (items: Array<{ id: string | number; newEmployee: Omit<Employee, 'id'> }>) => {
      await Promise.all(
        items.map(async ({ id, newEmployee }) => {
          await jobApplicationAPI.update(id, { status: 'approved' })
          await employeeAPI.add(newEmployee)
        })
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobApplications'] })
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })

  const actionLoading =
    updateLeaveStatusMutation.isPending ||
    approveAppMutation.isPending ||
    rejectAppMutation.isPending ||
    bulkApproveMutation.isPending

  const [filterTab, setFilterTab] = useState<FilterTab>('all')
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false)
  const [isPoliciesModalOpen, setIsPoliciesModalOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set())

  const employeeById = useMemo(
    () => new Map(employees.map((e) => [e.id, e])),
    [employees]
  )

  const pendingRequests = useMemo(
    () =>
      leaveRequests
        .filter((r) => r.status === 'pending')
        .map((leave) => {
          const employee = employeeById.get(leave.employeeId)
          return employee ? { ...leave, employee } : null
        })
        .filter((x): x is NonNullable<typeof x> => x !== null),
    [leaveRequests, employeeById]
  )

  const filteredRequests = useMemo(
    () =>
      filterTab === 'urgent'
        ? pendingRequests.filter((r) => r.type === 'Immediate Leave')
        : pendingRequests,
    [pendingRequests, filterTab]
  )

  const pendingApps = useMemo(
    () => applications.filter((a) => a.status === 'pending'),
    [applications]
  )

  const uniqueDepartments = useMemo(
    () => new Set(employees.map((e) => e.department)).size,
    [employees]
  )

  const buildNewEmployee = useCallback((app: (typeof applications)[number], empOffset: number) => ({
    fullName: app.fullName,
    email: app.email,
    phone: app.phone,
    designation: app.position,
    department: app.department,
    dateOfJoining: new Date().toISOString().split('T')[0],
    status: 'probation',
    empId: String(employees.length + empOffset).padStart(4, '0'),
    totalLeaves: 12,
  }), [employees.length])

  const handleApprove = useCallback((id: string | number) => {
    const app = applications.find((a) => a.id === id)
    if (!app) return
    approveAppMutation.mutate({ id, newEmployee: buildNewEmployee(app, 1) })
    setSelectedIds((prev) => { const next = new Set(prev); next.delete(id); return next })
  }, [applications, approveAppMutation, buildNewEmployee])

  const handleReject = useCallback((id: string | number) => {
    rejectAppMutation.mutate(id)
    setSelectedIds((prev) => { const next = new Set(prev); next.delete(id); return next })
  }, [rejectAppMutation])

  const toggleSelect = useCallback((id: string | number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) =>
      prev.size === pendingApps.length ? new Set() : new Set(pendingApps.map((a) => a.id))
    )
  }, [pendingApps])

  const handleBulkApprove = useCallback(() => {
    const items = pendingApps
      .filter((a) => selectedIds.has(a.id))
      .map((app, i) => ({ id: app.id, newEmployee: buildNewEmployee(app, i + 1) }))
    bulkApproveMutation.mutate(items)
    setSelectedIds(new Set())
  }, [pendingApps, selectedIds, buildNewEmployee, bulkApproveMutation])

  return (
    <>
      <main className="flex-1 p-4 md:p-4 space-y-4">
        <PageHeader title={pageConfig?.title ?? ''} subtitle={pageConfig?.subtitle ?? ''} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {statCards.map((card) => {
            const valuesMap: Record<string, number> = {
              totalDepartments: uniqueDepartments,
              pendingApprovals: pendingRequests.length,
              recentJobApplications: applications.length,
              totalEmployees: employees.length,
            }
            return (
              <StatCard key={card.id} variant="hr">
                <StatCardContent card={card} value={valuesMap[card.key] ?? 0} />
              </StatCard>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2 flex flex-col gap-3">
            <LeavePreApprovalTable
              filteredRequests={filteredRequests}
              allLeaves={leaveRequests}
              filterTab={filterTab}
              onFilterChange={setFilterTab}
              onApprove={(id) => updateLeaveStatusMutation.mutate({ id, status: 'hr_approved' })}
              onReject={(id) => updateLeaveStatusMutation.mutate({ id, status: 'hr_rejected' })}
            />
          </div>

          <div className="lg:col-span-1 flex flex-col gap-3">
            <AdminToolsCard
              leaveRequests={leaveRequests}
              onOpenRoles={() => setIsRoleModalOpen(true)}
              onOpenHolidays={() => setIsHolidayModalOpen(true)}
              onOpenPolicies={() => setIsPoliciesModalOpen(true)}
            />
          </div>

          <div className="lg:col-span-3">
            <JobApplicationsTable
              applications={applications}
              pendingApps={pendingApps}
              selectedIds={selectedIds}
              actionLoading={actionLoading}
              onToggleSelect={toggleSelect}
              onToggleSelectAll={toggleSelectAll}
              onApprove={handleApprove}
              onReject={handleReject}
              onBulkApprove={handleBulkApprove}
            />
          </div>
        </div>
      </main>

      <HolidaysModal isOpen={isHolidayModalOpen} onClose={() => setIsHolidayModalOpen(false)} />
      <ModalRoles isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} employees={employees} />
      <PoliciesModal isOpen={isPoliciesModalOpen} onClose={() => setIsPoliciesModalOpen(false)} />
    </>
  )
}
