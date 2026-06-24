import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { employeeAPI, optionsAPI, pageConfigAPI } from '../../services/Api'
import { Button } from '../ui/Button'

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

export default function AddEmployeePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form, setForm] = useState<FormFields>(EMPTY_FORM)
  const { data: pageConfigs = [] } = useQuery({ queryKey: ['pageConfigs', 'addEmployee'], queryFn: () => pageConfigAPI.fetchByPage('addEmployee') })
  const { data: departments = [] } = useQuery({ queryKey: ['departments'], queryFn: optionsAPI.fetchDepartments })
  const { data: employmentStatuses = [] } = useQuery({ queryKey: ['employmentStatuses'], queryFn: optionsAPI.fetchEmploymentStatuses })
  const pageConfig = pageConfigs[0]

  const addMutation = useMutation({
    mutationFn: (data: FormFields) => employeeAPI.add({ ...data, totalLeaves: Number(data.totalLeaves) || 12 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      navigate('/employee-management')
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addMutation.mutate(form)
  }

  return (
    <div className="flex-1 p-4 md:p-xl bg-surface-container-low">
      <div className="mb-lg flex justify-between items-end">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-background mb-1">{pageConfig?.title ?? ''}</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">{pageConfig?.subtitle ?? ''}</p>
        </div>
      </div>

          {/* Error Banner */}
          {addMutation.isError && (
            <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-error-container text-on-error-container rounded-lg border border-error/20">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <p className="text-body-sm font-body-sm">Failed to add employee. Please try again.</p>
            </div>
          )}

          {/* Form Container */}
          <div className="bg-surface-container-lowest rounded-xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05),0_4px_6px_-2px_rgba(0,0,0,0.02)] p-4 md:p-6 border border-outline-variant/30">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
                {/* Photo Upload */}
                <div className="md:col-span-12 flex flex-col items-center md:items-start mb-2">
                  <label className="block mb-2 font-label-md text-label-md text-on-surface-variant w-full text-center md:text-left">
                    Employee Photo
                  </label>
                  <div className="flex items-center gap-6 mt-2">
                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-outline-variant bg-surface-container flex items-center justify-center overflow-hidden relative group cursor-pointer hover:border-primary transition-colors">
                      <span className="material-symbols-outlined text-outline group-hover:text-primary z-10 text-[32px] transition-colors">
                        add_a_photo
                      </span>
                    </div>
                    <div className="text-body-sm font-body-sm text-on-surface-variant max-w-[200px] text-center md:text-left">
                      <p>Allowed format: JPG, PNG.</p>
                      <p>Max size: 2MB.</p>
                    </div>
                  </div>
                </div>

                {/* Full Name */}
                <div className="md:col-span-6">
                  <label htmlFor="fullName" className="block mb-2 font-label-md text-label-md text-on-surface-variant">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Jane Doe"
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-on-surface font-body-md text-body-md transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_2px_theme(colors.primary)] placeholder:text-on-surface-variant/50"
                  />
                </div>

                {/* Employee ID */}
                <div className="md:col-span-6">
                  <label htmlFor="empId" className="block mb-2 font-label-md text-label-md text-on-surface-variant">
                    Employee ID
                  </label>
                  <input
                    id="empId"
                    name="empId"
                    type="text"
                    required
                    value={form.empId}
                    onChange={handleChange}
                    placeholder="e.g. EMP-2024-001"
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-on-surface font-body-md text-body-md transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_2px_theme(colors.primary)] placeholder:text-on-surface-variant/50"
                  />
                </div>

                {/* Email */}
                <div className="md:col-span-6">
                  <label htmlFor="email" className="block mb-2 font-label-md text-label-md text-on-surface-variant">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="jane.doe@company.com"
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-on-surface font-body-md text-body-md transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_2px_theme(colors.primary)] placeholder:text-on-surface-variant/50"
                  />
                </div>

                {/* Phone */}
                <div className="md:col-span-6">
                  <label htmlFor="phone" className="block mb-2 font-label-md text-label-md text-on-surface-variant">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-on-surface font-body-md text-body-md transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_2px_theme(colors.primary)] placeholder:text-on-surface-variant/50"
                  />
                </div>

                {/* Department */}
                <div className="md:col-span-6">
                  <label htmlFor="department" className="block mb-2 font-label-md text-label-md text-on-surface-variant">
                    Department
                  </label>
                  <div className="relative">
                    <select
                      id="department"
                      name="department"
                      value={form.department}
                      onChange={handleChange}
                      className="w-full appearance-none rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 pr-10 text-on-surface font-body-md text-body-md transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_2px_theme(colors.primary)] cursor-pointer"
                    >
                      <option value="" disabled>Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.value}>{dept.label}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                      arrow_drop_down
                    </span>
                  </div>
                </div>

                {/* Designation */}
                <div className="md:col-span-6">
                  <label htmlFor="designation" className="block mb-2 font-label-md text-label-md text-on-surface-variant">
                    Designation
                  </label>
                  <input
                    id="designation"
                    name="designation"
                    type="text"
                    value={form.designation}
                    onChange={handleChange}
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-on-surface font-body-md text-body-md transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_2px_theme(colors.primary)] placeholder:text-on-surface-variant/50"
                  />
                </div>

                {/* Date of Joining */}
                <div className="md:col-span-6">
                  <label htmlFor="dateOfJoining" className="block mb-2 font-label-md text-label-md text-on-surface-variant">
                    Date of Joining
                  </label>
                  <div className="relative">
                    <input
                      id="dateOfJoining"
                      name="dateOfJoining"
                      type="date"
                      value={form.dateOfJoining}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest pl-10 pr-4 py-3 text-on-surface font-body-md text-body-md transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_2px_theme(colors.primary)]"
                    />
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                      calendar_today
                    </span>
                  </div>
                </div>

                {/* Employment Status */}
                <div className="md:col-span-6">
                  <label htmlFor="status" className="block mb-2 font-label-md text-label-md text-on-surface-variant">
                    Employment Status
                  </label>
                  <div className="relative">
                    <select
                      id="status"
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="w-full appearance-none rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 pr-10 text-on-surface font-body-md text-body-md transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_2px_theme(colors.primary)] cursor-pointer"
                    >
                      {employmentStatuses.map((status) => (
                        <option key={status.id} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                      arrow_drop_down
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 pt-4 border-t border-outline-variant/30 flex flex-col md:flex-row items-center justify-end gap-4">
                <Button variant="secondary" asChild className="w-full md:w-auto">
                  <Link to="/employee-management">Cancel</Link>
                </Button>
                <Button
                  type="submit"
                  disabled={addMutation.isPending}
                  size="lg"
                  className="w-full md:w-auto"
                >
                  {addMutation.isPending ? (
                    <>
                      <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                      Saving…
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">save</span>
                      Save Employee
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
    </div>
  )
}
