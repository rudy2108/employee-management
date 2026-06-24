import { useCallback, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { employeeAPI, leaveAPI, pageConfigAPI, pageStatAPI } from '../services/Api'
import Header from '../components/layout/Header'
import { StatCard, StatCardContent } from '../components/ui/StatCard'
import { PageHeader } from '../components/ui/PageHeader'
import EmployeeTable from '../components/employee-management/EmployeeTable'
import LeaveRequestModal from '../components/employee-management/LeaveRequestModal'
import { Button } from '../components/ui/Button'

interface LeaveModalState {
  open: boolean
  employeeId: string | number | null
  employeeName: string
}

const EMPTY_FORM = {
  reason: '',
  urgency: 'regular' as 'immediate' | 'regular',
  startDate: '',
  endDate: '',
  singleDay: false,
}

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

  const deleteLeaveMutation = useMutation({
    mutationFn: (id: string | number) => leaveAPI.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leaves'] }),
  })

  const createLeaveMutation = useMutation({
    mutationFn: (data: Parameters<typeof leaveAPI.create>[0]) => leaveAPI.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leaves'] }),
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

  const [modal, setModal] = useState<LeaveModalState>({ open: false, employeeId: null, employeeName: '' })
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')

  const openModal = useCallback((e: React.MouseEvent, id: string | number, name: string) => {
    e.preventDefault()
    e.stopPropagation()
    setForm(EMPTY_FORM)
    setFormError('')
    setModal({ open: true, employeeId: id, employeeName: name })
  }, [])

  const closeModal = useCallback(() => setModal({ open: false, employeeId: null, employeeName: '' }), [])

  const handleCancelLeave = useCallback((e: React.MouseEvent, id: string | number) => {
    e.preventDefault()
    e.stopPropagation()
    const pending = leaveRequests.find((r) => r.employeeId === id && (r.status === 'pending' || r.status === 'hr_approved'))
    if (pending) deleteLeaveMutation.mutate(pending.id)
  }, [leaveRequests, deleteLeaveMutation])

  const handleDelete = useCallback((id: string | number) => deleteEmployeeMutation.mutate(id), [deleteEmployeeMutation])

  const handleFormChange = useCallback((updates: Partial<typeof EMPTY_FORM>) => setForm((f) => ({ ...f, ...updates })), [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.reason.trim()) { setFormError('Please provide a reason for leave.'); return }
    if (!form.startDate) { setFormError('Please select a start date.'); return }
    if (!form.singleDay && !form.endDate) { setFormError('Please select an end date.'); return }
    if (!form.singleDay && form.endDate < form.startDate) { setFormError('End date cannot be before start date.'); return }

    const endDate = form.singleDay ? form.startDate : form.endDate
    const duration = form.startDate === endDate ? '1 day' : `${form.startDate} to ${endDate}`

    createLeaveMutation.mutate({
      employeeId: modal.employeeId!,
      status: 'pending',
      type: form.urgency === 'immediate' ? 'Immediate Leave' : 'Regular Leave',
      duration,
      appliedDate: new Date().toISOString().split('T')[0],
      reason: form.reason.trim(),
      startDate: form.startDate,
      endDate,
    })
    closeModal()
  }

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
          onOpenModal={openModal}
          onCancelLeave={handleCancelLeave}
        />
      </main>

      {modal.open && (
        <LeaveRequestModal
          employeeName={modal.employeeName}
          form={form}
          formError={formError}
          onClose={closeModal}
          onFormChange={handleFormChange}
          onSubmit={handleSubmit}
        />
      )}
    </>
  )
}
