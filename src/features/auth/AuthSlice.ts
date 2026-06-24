import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const JSON_SERVER_URL = 'http://localhost:3000'

export interface Admin {
  id: number
  username: string
  email: string
  role: string
  name: string
}

interface AuthState {
  admin: Admin | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

const storedAdmin = localStorage.getItem('admin')

const initialState: AuthState = {
  admin: storedAdmin ? JSON.parse(storedAdmin) : null,
  isAuthenticated: !!storedAdmin,
  loading: false,
  error: null,
}

export const loginAdmin = createAsyncThunk(
  'auth/loginAdmin',
  async (
    credentials: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await axios.get(`${JSON_SERVER_URL}/admins`, {
        params: { email: credentials.email },
      })

      if (!data || data.length === 0) {
        return rejectWithValue('No admin found with this email.')
      }

      const admin = data[0]

      if (admin.password !== credentials.password) {
        return rejectWithValue('Invalid password.')
      }

      // Exclude the password from what we store
      const { password: _password, ...safeAdmin } = admin
      localStorage.setItem('admin', JSON.stringify(safeAdmin))
      return safeAdmin as Admin
    } catch {
      return rejectWithValue('Failed to connect to the server. Make sure JSON Server is running.')
    }
  }
)

export const logoutAdmin = createAsyncThunk(
  'auth/logoutAdmin',
  async () => {
    localStorage.removeItem('admin')
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
      localStorage.removeItem('admin')
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
