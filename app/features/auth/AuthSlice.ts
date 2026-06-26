import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const JSON_SERVER_URL = 'http://localhost:3000'

export interface Admin {
  id: number | string
  username: string
  email: string
  role: string
  name: string
  token?: string
  refreshToken?: string
  image?: string
  // Employee-specific fields (populated when role === 'employee')
  empId?: string
  phone?: string
  department?: string
  designation?: string
  dateOfJoining?: string
  status?: string
  totalLeaves?: number
}

interface AuthState {
  admin: Admin | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

const readStoredAdmin = () => {
  if (typeof window === 'undefined') return null

  return localStorage.getItem('admin')
}

const removeStoredAdmin = () => {
  if (typeof window === 'undefined') return

  localStorage.removeItem('admin')
}

const storedAdmin = readStoredAdmin()

const initialState: AuthState = {
  admin: storedAdmin ? JSON.parse(storedAdmin) : null,
  isAuthenticated: !!storedAdmin,
  loading: false,
  error: null,
}

export const loginAdmin = createAsyncThunk(
  'auth/loginAdmin',
  async (
    credentials: { username: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      // 1. Check local JSON server for Admin login
      const { data: adminData } = await axios.get(`${JSON_SERVER_URL}/admins`, {
        params: { username: credentials.username }
      })

      if (adminData && adminData.length > 0) {
        const adminRecord = adminData[0]
        if (adminRecord.password === credentials.password) {
          const admin: Admin = {
            id: adminRecord.id,
            username: adminRecord.username,
            email: adminRecord.email,
            role: 'admin',
            name: adminRecord.name,
            token: 'local-admin-token',
            refreshToken: 'local-admin-refresh-token'
          }
          if (typeof window !== 'undefined') {
            localStorage.setItem('admin', JSON.stringify(admin))
          }
          return admin
        } else {
          return rejectWithValue('Invalid password.')
        }
      }
    } catch (err) {
      console.warn('JSON server admin check failed:', err)
    }

    // 2. Check local JSON server for Employee login (db.json /employees)
    try {
      const { data: employeeData } = await axios.get(`${JSON_SERVER_URL}/employees`, {
        params: { username: credentials.username }
      })

      if (employeeData && employeeData.length > 0) {
        const empRecord = employeeData[0]
        if (empRecord.password === credentials.password) {
          const employee: Admin = {
            id: empRecord.id,
            username: empRecord.username,
            email: empRecord.email,
            role: 'employee',
            name: empRecord.fullName,
            token: 'local-employee-token',
            refreshToken: 'local-employee-refresh-token',
            // Store full employee profile in auth state
            empId: empRecord.empId,
            phone: empRecord.phone,
            department: empRecord.department,
            designation: empRecord.designation,
            dateOfJoining: empRecord.dateOfJoining,
            status: empRecord.status,
            totalLeaves: empRecord.totalLeaves,
          }
          if (typeof window !== 'undefined') {
            localStorage.setItem('admin', JSON.stringify(employee))
          }
          return employee
        } else {
          return rejectWithValue('Invalid password.')
        }
      }

      // Employee not found in local db either
      return rejectWithValue('Invalid credentials. User not found.')
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        return rejectWithValue(error.response.data.message)
      }
      return rejectWithValue('Invalid credentials or failed to connect.')
    }
  }
)

export const logoutAdmin = createAsyncThunk(
  'auth/logoutAdmin',
  async () => {
    removeStoredAdmin()
    return null
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.admin = null
      state.isAuthenticated = false
      state.error = null
      removeStoredAdmin()
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.admin = action.payload
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(logoutAdmin.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.loading = false
        state.admin = null
        state.isAuthenticated = false
      })
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
