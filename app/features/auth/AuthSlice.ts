import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const JSON_SERVER_URL = 'http://localhost:3000'

export interface Admin {
  id: number
  username: string
  email: string
  role: string
  name: string
  token?: string
  refreshToken?: string
  image?: string
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
      // 1. Try to fetch from local JSON server for Admin login
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
      // Ignore and fallback to dummyjson for employee login
      console.warn('JSON server check failed, falling back to dummyjson:', err)
    }

    // 2. Fallback to dummyjson API for Employee login
    try {
      const { data } = await axios.post('https://dummyjson.com/auth/login', {
        username: credentials.username,
        password: credentials.password,
        expiresInMins: 30,
      }, {
        headers: { 'Content-Type': 'application/json' }
      })

      const employee: Admin = {
        id: data.id,
        username: data.username,
        email: data.email,
        role: 'employee',
        name: `${data.firstName} ${data.lastName}`,
        token: data.accessToken || data.token,
        refreshToken: data.refreshToken,
        image: data.image
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('admin', JSON.stringify(employee))
      }
      return employee
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
