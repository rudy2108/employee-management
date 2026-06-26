import axios from 'axios'

export interface Employee {
  id: string | number
  fullName: string
  empId: string
  email: string
  phone: string
  department: string
  designation: string
  dateOfJoining: string
  status: string
  totalLeaves: number
  sickLeaves?: number
  personalLeaves?: number
}

const API_BASE_URL = 'http://localhost:3000' // json-server runs on port 3000

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to attach access token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const storedAdmin = localStorage.getItem('admin')
      if (storedAdmin) {
        const admin = JSON.parse(storedAdmin)
        if (admin.token) {
          config.headers.Authorization = `Bearer ${admin.token}`
        }
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      if (typeof window !== 'undefined') {
        const storedAdmin = localStorage.getItem('admin')
        if (storedAdmin) {
          const admin = JSON.parse(storedAdmin)

          if (admin.refreshToken) {
            try {
              const { data } = await axios.post('https://dummyjson.com/auth/refresh', {
                refreshToken: admin.refreshToken,
                expiresInMins: 1,
              })

              const updatedAdmin = {
                ...admin,
                token: data.accessToken || data.token,
                refreshToken: data.refreshToken,
              }
              localStorage.setItem('admin', JSON.stringify(updatedAdmin))

              originalRequest.headers.Authorization = `Bearer ${updatedAdmin.token}`
              return apiClient(originalRequest)
            } catch (refreshError) {
              // Refresh failed, clear session
              localStorage.removeItem('admin')
              window.location.href = '/' // Redirect to login
              return Promise.reject(refreshError)
            }
          }
        }
      }
    }

    return Promise.reject(error)
  }
)

export const employeeAPI = {
  fetchAll: async (): Promise<Employee[]> => {
    const response = await apiClient.get('/employees')
    return response.data
  },

  add: async (employee: Omit<Employee, 'id'>): Promise<Employee> => {
    const response = await apiClient.post('/employees', employee)
    return response.data
  },

  delete: async (id: string | number): Promise<void> => {
    await apiClient.delete(`/employees/${id}`)
  },

  update: async (id: string | number, employee: Omit<Employee, 'id'>): Promise<Employee> => {
    const response = await apiClient.put(`/employees/${id}`, employee)
    return response.data
  },
}

export interface LeaveRequest {
  id: string | number
  employeeId: string | number
  status: 'pending' | 'hr_approved' | 'hr_rejected' | 'approved' | 'rejected'
  type: string
  duration: string
  appliedDate: string
  reason?: string
  startDate?: string
  endDate?: string
}

export interface Holiday {
  id: string | number
  name: string
  date: string
  type: 'Public' | 'Optional'
}

export const leaveAPI = {
  fetchAll: async (): Promise<LeaveRequest[]> => {
    const response = await apiClient.get('/leaves')
    return response.data
  },

  create: async (leave: Omit<LeaveRequest, 'id'>): Promise<LeaveRequest> => {
    const response = await apiClient.post('/leaves', leave)
    return response.data
  },

  update: async (id: string | number, leave: Partial<LeaveRequest>): Promise<LeaveRequest> => {
    const response = await apiClient.patch(`/leaves/${id}`, leave)
    return response.data
  },

  delete: async (id: string | number): Promise<void> => {
    await apiClient.delete(`/leaves/${id}`)
  },
}

export const holidayAPI = {
  fetchAll: async (): Promise<Holiday[]> => {
    const response = await apiClient.get('/holidays')
    return response.data
  },

  add: async (holiday: Omit<Holiday, 'id'>): Promise<Holiday> => {
    const response = await apiClient.post('/holidays', holiday)
    return response.data
  },

  delete: async (id: string | number): Promise<void> => {
    await apiClient.delete(`/holidays/${id}`)
  },
}

export interface Policy {
  id: string | number
  name: string
  category: 'Operational' | 'General' | 'Legal'
  lastUpdated: string
  description?: string
  effectiveDate?: string
}

export const policyAPI = {
  fetchAll: async (): Promise<Policy[]> => {
    const response = await apiClient.get('/policies')
    return response.data
  },

  add: async (policy: Omit<Policy, 'id'>): Promise<Policy> => {
    const response = await apiClient.post('/policies', policy)
    return response.data
  },

  delete: async (id: string | number): Promise<void> => {
    await apiClient.delete(`/policies/${id}`)
  },

  update: async (id: string | number, policy: Partial<Policy>): Promise<Policy> => {
    const response = await apiClient.patch(`/policies/${id}`, policy)
    return response.data
  },
}

export interface JobApplication {
  id: string | number
  fullName: string
  email: string
  phone: string
  position: string
  department: string
  appliedDate: string
  status: 'pending' | 'approved' | 'rejected'
}

export const jobApplicationAPI = {
  fetchAll: async (): Promise<JobApplication[]> => {
    const response = await apiClient.get('/jobApplications')
    return response.data
  },

  update: async (id: string | number, data: Partial<JobApplication>): Promise<JobApplication> => {
    const response = await apiClient.patch(`/jobApplications/${id}`, data)
    return response.data
  },
}

export interface PageConfig {
  id: string
  page: string
  title: string
  subtitle: string
}

export interface PageStat {
  id: string
  page: string
  key: string
  title: string
  icon: string
  iconBg: string
  iconColor: string
}

export const pageConfigAPI = {
  fetchByPage: async (page: string): Promise<PageConfig[]> => {
    const response = await apiClient.get(`/pageConfigs?page=${page}`)
    return response.data
  },
}

export const pageStatAPI = {
  fetchByPage: async (page: string): Promise<PageStat[]> => {
    const response = await apiClient.get(`/pageStats?page=${page}`)
    return response.data
  },
}

export interface EmployeeProblem {
  id: string | number
  ticketId: string
  employeeId: string | number
  category: string
  status: 'open' | 'in_progress' | 'resolved'
  priority: 'low' | 'medium' | 'high'
  filedDate: string
  description?: string
}

export const problemAPI = {
  fetchAll: async (): Promise<EmployeeProblem[]> => {
    const response = await apiClient.get('/problems')
    return response.data
  },

  create: async (problem: Omit<EmployeeProblem, 'id'>): Promise<EmployeeProblem> => {
    const response = await apiClient.post('/problems', problem)
    return response.data
  },

  update: async (id: string | number, problem: Partial<EmployeeProblem>): Promise<EmployeeProblem> => {
    const response = await apiClient.patch(`/problems/${id}`, problem)
    return response.data
  },

  delete: async (id: string | number): Promise<void> => {
    await apiClient.delete(`/problems/${id}`)
  },
}

export interface Option {
  id: string | number
  value: string
  label: string
}

export const optionsAPI = {
  fetchDepartments: async (): Promise<Option[]> => {
    const response = await apiClient.get('/departments')
    return response.data
  },

  fetchEmploymentStatuses: async (): Promise<Option[]> => {
    const response = await apiClient.get('/employmentStatuses')
    return response.data
  },

  fetchPolicyCategories: async (): Promise<Option[]> => {
    const response = await apiClient.get('/policyCategories')
    return response.data
  },

  fetchHolidayTypes: async (): Promise<Option[]> => {
    const response = await apiClient.get('/holidayTypes')
    return response.data
  },

  fetchProblemCategories: async (): Promise<Option[]> => {
    const response = await apiClient.get('/problemCategories')
    return response.data
  },

  fetchProblemPriorities: async (): Promise<Option[]> => {
    const response = await apiClient.get('/problemPriorities')
    return response.data
  },
}

export function computeLeaveDays(startDate?: string, endDate?: string): number {
  if (!startDate || !endDate) return 1
  const start = new Date(startDate)
  const end = new Date(endDate)
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1)
}
