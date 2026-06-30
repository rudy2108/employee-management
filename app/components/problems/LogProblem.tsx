import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { optionsAPI, problemAPI } from '../../services/Api'
import type { EmployeeProblem, Employee } from '../../services/Api'
import { Button } from '../ui/Button'

interface LogProblemProps {
  isOpen: boolean
  onClose: () => void
  employees: Employee[]
  defaultEmployeeId?: string | number
}

export default function LogProblem({ isOpen, onClose, employees, defaultEmployeeId }: LogProblemProps) {
  const queryClient = useQueryClient()
  const { data: problemCategories = [] } = useQuery({ queryKey: ['problemCategories'], queryFn: optionsAPI.fetchProblemCategories })
  const { data: problemPriorities = [] } = useQuery({ queryKey: ['problemPriorities'], queryFn: optionsAPI.fetchProblemPriorities })
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('high')
  const [formData, setFormData] = useState({
    employeeId: defaultEmployeeId ? String(defaultEmployeeId) : '',
    category: '',
    incidentDate: '',
    description: '',
  })

  useEffect(() => {
    if (defaultEmployeeId != null && defaultEmployeeId !== '') {
      setFormData((prev) => ({ ...prev, employeeId: prev.employeeId || String(defaultEmployeeId) }))
    }
  }, [defaultEmployeeId])

  const createMutation = useMutation({
    mutationFn: (data: Omit<EmployeeProblem, 'id'>) => problemAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problems'] })
      setFormData({
        employeeId: '',
        category: '',
        incidentDate: '',
        description: '',
      })
      setSelectedPriority('high')
      onClose()
    },
  })

  if (!isOpen) return null

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const generateTicketId = () => {
    return `TKT-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0')}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.employeeId || !formData.category || !formData.incidentDate) {
      alert('Please fill in all required fields')
      return
    }

    const mappedPriority = selectedPriority === 'critical' ? 'high' : (selectedPriority as 'low' | 'medium' | 'high')
    const newProblem: Omit<EmployeeProblem, 'id'> = {
      ticketId: generateTicketId(),
      employeeId: formData.employeeId,
      category: formData.category,
      status: 'open',
      priority: mappedPriority,
      filedDate: new Date().toISOString().split('T')[0],
      description: formData.description,
    }

    createMutation.mutate(newProblem)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm bg-black/40">
      <div className="bg-surface-container-lowest w-full max-w-[640px] rounded-xl shadow-2xl border border-outline-variant overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="px-5 py-4 border-b border-outline-variant flex justify-between items-center gap-4 bg-surface-bright">
          <div>
            <h2 className="font-headline-md text-on-surface">Log New Problem</h2>
            <p className="text-body-sm text-on-surface-variant mt-1">Submit a formal record for a new workplace issue or grievance.</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} type="button" className="rounded-full flex-shrink-0">
            <span className="material-symbols-outlined">close</span>
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 custom-scrollbar max-h-[70vh] overflow-y-auto">
          {createMutation.isError && <div className="p-3 bg-error-container text-on-error-container rounded-lg text-body-sm">Failed to create problem</div>}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-label-md text-on-surface-variant">Employee Name *</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary">
                  person_search
                </span>
                <select
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  disabled={Boolean(defaultEmployeeId)}
                  className="w-full h-10 pl-10 pr-4 bg-surface-container-lowest border border-outline-variant rounded-xl focus:border-primary focus:ring-2 focus:ring-primary transition-all text-body-md outline-none appearance-none disabled:opacity-70 disabled:cursor-not-allowed"
                  required
                >
                  <option value="">Select employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-label-md text-on-surface-variant">Problem Category *</label>
              <div className="relative">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full h-10 px-4 bg-surface-container-lowest border border-outline-variant rounded-xl focus:border-primary focus:ring-2 focus:ring-primary transition-all text-body-md appearance-none outline-none"
                  required
                >
                  <option value="">Select category</option>
                  {problemCategories.map((category) => (
                    <option key={category.id} value={category.value}>{category.label}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline-variant">
                  expand_more
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-label-md text-on-surface-variant">Date of Incident *</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary">
                  calendar_today
                </span>
                <input
                  type="date"
                  name="incidentDate"
                  value={formData.incidentDate}
                  onChange={handleInputChange}
                  className="w-full h-10 pl-10 pr-4 bg-surface-container-lowest border border-outline-variant rounded-xl focus:border-primary focus:ring-2 focus:ring-primary transition-all text-body-md outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-label-md text-on-surface-variant">Priority Level *</label>
              <div className="flex p-1 bg-surface-container-high rounded-xl border border-outline-variant h-10 gap-1">
                {problemPriorities.map((priority) => (
                  <button
                    key={priority.id}
                    type="button"
                    onClick={() => setSelectedPriority(priority.value as 'low' | 'medium' | 'high' | 'critical')}
                    className={`flex-1 rounded-lg text-label-sm transition-all capitalize ${
                      selectedPriority === priority.value
                        ? 'bg-surface-container-lowest text-primary font-bold shadow-sm border border-outline-variant/30'
                        : 'text-on-surface-variant hover:bg-surface-container-lowest'
                    }`}
                  >
                    {priority.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-label-md text-on-surface-variant">Problem Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-3 bg-surface-container-lowest border border-outline-variant rounded-xl focus:border-primary focus:ring-2 focus:ring-primary transition-all text-body-md outline-none resize-none"
              placeholder="Provide detailed information regarding the incident, involved parties, and any immediate actions taken..."
              rows={4}
              required
            />
          </div>
        </form>

        <div className="px-5 py-4 bg-surface-bright border-t border-outline-variant flex items-center justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            type="button"
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            type="submit"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <>
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                Registering...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">check_circle</span>
                Register Problem
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
