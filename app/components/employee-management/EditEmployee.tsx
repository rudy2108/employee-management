import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useSelector } from 'react-redux'
import type { RootState } from '../../Store'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { employeeAPI, optionsAPI } from '../../services/Api'
import Header from '../layout/Header'
import { Button } from '../ui/Button'
import { PageHeader } from '../ui/PageHeader'

interface FormFields {
  fullName: string
  empId: string
  email: string
  phone: string
  department: string
  designation: string
  dateOfJoining: string
  status: string
  totalLeaves: string
}

const EMPTY_FORM: FormFields = {
  fullName: '',
  empId: '',
  email: '',
  phone: '',
  department: '',
  designation: '',
  dateOfJoining: '',
  status: 'full-time',
  totalLeaves: '12',
}

export default function EditEmployeePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const authUser = useSelector((s: RootState) => s.auth.admin)
  const isEmployee = authUser?.role === 'employee'
  const isAuthorizedToEdit = !isEmployee || String(authUser?.id) === String(id)
  const queryClient = useQueryClient()
  const { data: employees = [], isLoading: loading } = useQuery({ queryKey: ['employees'], queryFn: employeeAPI.fetchAll })
  const { data: departments = [] } = useQuery({ queryKey: ['departments'], queryFn: optionsAPI.fetchDepartments })
  const { data: employmentStatuses = [] } = useQuery({ queryKey: ['employmentStatuses'], queryFn: optionsAPI.fetchEmploymentStatuses })
  const [form, setForm] = useState<FormFields>(EMPTY_FORM)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [populatedId, setPopulatedId] = useState<string | null>(null)

  const employee = useMemo(() => {
    if (!id) return undefined
    return employees.find((emp) => String(emp.id) === id)
  }, [employees, id])

  const cancelPath = isEmployee ? '/employee-profile' : '/employee-management'

  const unauthorized = isEmployee && String(authUser?.id) !== String(id)

  // Populate the form once per employee, during render, instead of in an effect.
  if (employee && populatedId !== String(employee.id)) {
    setPopulatedId(String(employee.id))
    setForm({
      fullName: employee.fullName,
      empId: employee.empId,
      email: employee.email,
      phone: employee.phone,
      department: employee.department,
      designation: employee.designation,
      dateOfJoining: employee.dateOfJoining,
      status: employee.status,
      totalLeaves: String(employee.totalLeaves ?? 12),
    })
  }

  const updateMutation = useMutation({
    mutationFn: (data: FormFields) => employeeAPI.update(id!, { ...data, totalLeaves: Number(data.totalLeaves) || 12 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      const redirectPath = isEmployee ? '/employee-profile' : '/employee-management'
      navigate(redirectPath)
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    try {
      setSubmitError(null)
      await updateMutation.mutateAsync(form)
    } catch {
      setSubmitError('Unable to update employee. Please try again.')
    }
  }

  return (
    <>
      <Header />

      <main className="flex-1 p-4 md:p-6 space-y-6">
        <PageHeader title="Edit Employee" subtitle="Update employee profile and employment details.">
          <Button variant="secondary" asChild>
            <Link to={cancelPath}>
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back
            </Link>
          </Button>
        </PageHeader>

          {(updateMutation.isError || submitError) && (
            <div className="flex items-center gap-3 px-4 py-3 bg-error/10 text-error rounded-lg border border-error/20">
              <span className="material-symbols-outlined">error</span>
              <p className="text-body-sm font-body-sm">{submitError ?? 'Unable to update employee.'}</p>
            </div>
          )}

          {!loading && unauthorized && (
            <div className="bg-surface-container-lowest rounded-xl p-8 border border-surface-container-highest text-center">
              <p className="text-body-lg font-body-lg text-on-surface">You are not authorized to edit this profile.</p>
              <Button asChild>
                <Link to={cancelPath}>
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  Back
                </Link>
              </Button>
            </div>
          )}

          {!loading && !employee && !unauthorized && (
            <div className="bg-surface-container-lowest rounded-xl p-8 border border-surface-container-highest text-center">
              <p className="text-body-lg font-body-lg text-on-surface">Employee not found.</p>
              <Button asChild>
                <Link to="/employee-management">
                  <span className="material-symbols-outlined text-[18px]">groups</span>
                  Return to List
                </Link>
              </Button>
            </div>
          )}

          {(loading || (employee && !unauthorized)) && (
            <div className="bg-surface-container-lowest rounded-xl ambient-shadow-surface-1 border border-surface-container-highest p-6 md:p-8">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-6">
                  <label htmlFor="fullName" className="block mb-2 text-label-md font-label-md text-on-surface-variant">Full Name</label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={form.fullName}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="md:col-span-6">
                  <label htmlFor="empId" className="block mb-2 text-label-md font-label-md text-on-surface-variant">Employee ID</label>
                  <input
                    id="empId"
                    name="empId"
                    type="text"
                    required
                    value={form.empId}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="md:col-span-6">
                  <label htmlFor="email" className="block mb-2 text-label-md font-label-md text-on-surface-variant">Email Address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="md:col-span-6">
                  <label htmlFor="phone" className="block mb-2 text-label-md font-label-md text-on-surface-variant">Phone Number</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="md:col-span-6">
                  <label htmlFor="department" className="block mb-2 text-label-md font-label-md text-on-surface-variant">Department</label>
                  <select
                    id="department"
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="" disabled>Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.value}>{dept.label}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-6">
                  <label htmlFor="designation" className="block mb-2 text-label-md font-label-md text-on-surface-variant">Designation</label>
                  <input
                    id="designation"
                    name="designation"
                    type="text"
                    value={form.designation}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="md:col-span-6">
                  <label htmlFor="dateOfJoining" className="block mb-2 text-label-md font-label-md text-on-surface-variant">Date of Joining</label>
                  <input
                    id="dateOfJoining"
                    name="dateOfJoining"
                    type="date"
                    value={form.dateOfJoining}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="md:col-span-6">
                  <label htmlFor="status" className="block mb-2 text-label-md font-label-md text-on-surface-variant">Employment Status</label>
                  <select
                    id="status"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-on-surface focus:outline-none focus:border-primary"
                  >
                    {employmentStatuses.map((status) => (
                      <option key={status.id} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-12 pt-4 border-t border-outline-variant/30 flex flex-col sm:flex-row gap-3 sm:justify-end">
                  <Button variant="secondary" asChild>
                    <Link to={cancelPath}>Cancel</Link>
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateMutation.isPending || loading || !employee}
                  >
                    {updateMutation.isPending ? (
                      <>
                        <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                        Updating...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">save</span>
                        Update Employee
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </main>
    </>
  )
}
