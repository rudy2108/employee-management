import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { employeeAPI } from '../../services/Api'
import type { Employee } from '../../services/Api'

type RoleField = 'department' | 'designation'

const getUniqueValues = (values: string[]) => Array.from(new Set(values)).sort()

type EditedEmployees = Record<string, { department: string; designation: string }>

interface ModalRolesProps {
  isOpen: boolean
  onClose: () => void
  employees: Employee[]
}

export default function ModalRoles({ isOpen, onClose, employees }: ModalRolesProps) {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [editedEmployees, setEditedEmployees] = useState<EditedEmployees>({})
  const [saveError, setSaveError] = useState('')
  const [wasOpen, setWasOpen] = useState(false)

  const updateMutation = useMutation({
    mutationFn: async (updates: Employee[]) => {
      await Promise.all(
        updates.map((employee) =>
          employeeAPI.update(employee.id, {
            fullName: employee.fullName,
            empId: employee.empId,
            email: employee.email,
            phone: employee.phone,
            department: employee.department,
            designation: employee.designation,
            dateOfJoining: employee.dateOfJoining,
            status: employee.status,
          })
        )
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    }
  })

  const EMPLOYEES_PER_PAGE = 8

  // Initialize editable state once when the modal transitions to open, during render.
  if (isOpen && !wasOpen) {
    setWasOpen(true)
    setSearchTerm('')
    setCurrentPage(1)
    setEditedEmployees(
      Object.fromEntries(
        employees.map((employee) => [
          String(employee.id),
          { department: employee.department, designation: employee.designation },
        ])
      )
    )
    setSaveError('')
  } else if (!isOpen && wasOpen) {
    setWasOpen(false)
  }

  const handleClose = () => {
    setSaveError('')
    onClose()
  }

  const handleRoleFieldChange = (id: string | number, field: RoleField, value: string) => {
    setEditedEmployees((current) => ({
      ...current,
      [String(id)]: {
        ...current[String(id)],
        [field]: value,
      },
    }))
  }

  const employeesWithChanges = employees.map((employee) => {
    const edited = editedEmployees[String(employee.id)]

    return {
      ...employee,
      department: edited?.department ?? employee.department,
      designation: edited?.designation ?? employee.designation,
      hasChanges:
        !!edited &&
        (edited.department !== employee.department || edited.designation !== employee.designation),
    }
  })

  const departmentOptions = useMemo(
    () => getUniqueValues(employees.map((employee) => employee.department)),
    [employees]
  )

  const roleOptions = useMemo(
    () => getUniqueValues(employees.map((employee) => employee.designation)),
    [employees]
  )

  const allFilteredEmployees = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) {
      return employeesWithChanges
    }

    return employeesWithChanges.filter((employee) => {
      return (
        employee.fullName.toLowerCase().includes(query) ||
        String(employee.empId).toLowerCase().includes(query)
      )
    })
  }, [employeesWithChanges, searchTerm])

  const totalPages = Math.ceil(allFilteredEmployees.length / EMPLOYEES_PER_PAGE)
  const startIndex = (currentPage - 1) * EMPLOYEES_PER_PAGE
  const endIndex = startIndex + EMPLOYEES_PER_PAGE

  const filteredEmployeeRows = useMemo(
    () => allFilteredEmployees.slice(startIndex, endIndex),
    [allFilteredEmployees, startIndex, endIndex]
  )

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handleGoToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleSaveChanges = async () => {
    setSaveError('')

    try {
      const updates = employeesWithChanges.filter((employee) => employee.hasChanges)
      await updateMutation.mutateAsync(updates)

      onClose()
    } catch {
      setSaveError('Unable to save changes. Please try again.')
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-6xl overflow-hidden rounded-[30px] border border-surface-container-highest bg-surface-container-lowest shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-3 p-4 border-b border-surface-container-highest lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
            </div>
            <div>
              <h3 className="text-headline-md font-headline-md text-on-surface">Manage Roles</h3>
              <p className="text-body-sm font-body-sm text-on-surface-variant">
                Reassign employee roles and departments from a single dashboard.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleSaveChanges}
              disabled={updateMutation.isPending}
              className="inline-flex items-center justify-center rounded-2xl bg-primary px-3 py-2 text-on-primary text-label-sm font-label-sm hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex items-center justify-center rounded-2xl border border-outline-variant bg-surface-container px-3 py-2 text-label-sm font-label-sm text-on-surface hover:bg-surface-container-high transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or ID..."
                className="w-full rounded-2xl border border-outline-variant bg-surface-container px-12 py-2 text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl border border-outline-variant bg-surface-container px-3 py-2 text-label-sm font-label-sm text-on-surface hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined">filter_list</span>
              Filter
            </button>
          </div>

          <div className="max-h-[50vh] overflow-y-auto">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant text-label-sm font-label-sm uppercase tracking-wider">
                  <th className="p-3 rounded-tl-3xl">Employee</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Current Role</th>
                  <th className="p-3 rounded-tr-3xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-highest text-body-sm font-body-sm text-on-surface">
                {filteredEmployeeRows.map((employee) => (
                  <tr key={employee.id} className="hover:bg-surface-container-low/60 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-label-sm">
                          {employee.fullName?.charAt(0).toUpperCase() ?? '?'}
                        </div>
                        <div>
                          <p className="font-medium text-on-surface">{employee.fullName}</p>
                          <p className="text-label-sm font-label-sm text-on-surface-variant">ID: {employee.empId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <select
                        value={employee.department}
                        onChange={(e) => handleRoleFieldChange(employee.id, 'department', e.target.value)}
                        className="w-full rounded-2xl border border-outline-variant bg-surface-container px-3 py-1.5 text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      >
                        {departmentOptions.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept.charAt(0).toUpperCase() + dept.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3">
                      <select
                        value={employee.designation}
                        onChange={(e) => handleRoleFieldChange(employee.id, 'designation', e.target.value)}
                        className="w-full rounded-2xl border border-outline-variant bg-surface-container px-3 py-1.5 text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      >
                        {roleOptions.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3">
                      {employee.hasChanges ? (
                        <span className="inline-flex rounded-full bg-[#E2E8F0] px-3 py-1 text-label-sm font-label-sm text-[#0F172A]">
                          Pending Update
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-surface-container-highest px-3 py-1 text-label-sm font-label-sm text-on-surface-variant">
                          No changes
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredEmployeeRows.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-on-surface-variant">
                      No employees match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-2.5 items-start justify-between rounded-3xl border border-surface-container-highest bg-surface-container p-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-label-sm font-label-sm text-on-surface-variant">
                Showing {startIndex + 1} to {Math.min(endIndex, allFilteredEmployees.length)} of {allFilteredEmployees.length} entries
              </p>
            </div>
            <div className="inline-flex items-center gap-2">
              <button
                type="button"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="rounded-full border border-outline-variant bg-surface-container px-3 py-2 text-label-sm font-label-sm text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => handleGoToPage(page)}
                  className={`rounded-full border px-3 py-2 text-label-sm font-label-sm transition-colors ${
                    currentPage === page
                      ? 'border-primary bg-primary text-on-primary'
                      : 'border-outline-variant bg-surface-container text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="rounded-full border border-outline-variant bg-surface-container px-3 py-2 text-label-sm font-label-sm text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>

          {saveError && (
            <div className="rounded-2xl bg-error/10 px-4 py-3 text-error text-label-sm font-label-sm">
              {saveError}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
