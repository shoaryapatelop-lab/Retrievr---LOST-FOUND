import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react'
import { api } from '../services/api'

export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  role: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  loading: boolean
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  role: string
  rollNumber?: string
  employeeId?: string
  department?: string
  contact?: string
}

const USER_KEY = 'retrievr_user'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function readCachedUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readCachedUser)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  const persistUser = useCallback((next: User | null) => {
    setUser(next)
    if (next) localStorage.setItem(USER_KEY, JSON.stringify(next))
    else localStorage.removeItem(USER_KEY)
  }, [])

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token')
      if (!storedToken) {
        setLoading(false)
        return
      }
      try {
        const response = await api.get('/auth/profile')
        persistUser(response.data)
      } catch (error: any) {
        // Token invalid or backend unreachable: keep cached user if we have one,
        // otherwise clear the session.
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          localStorage.removeItem('token')
          setToken(null)
          persistUser(null)
        }
      } finally {
        setLoading(false)
      }
    }
    initAuth()
  }, [persistUser])

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password })
    const { token: newToken, ...newUser } = response.data
    localStorage.setItem('token', newToken)
    setToken(newToken)
    persistUser(newUser as User)
  }

  const register = async (data: RegisterData) => {
    const response = await api.post('/auth/register', data)
    const { token: newToken, ...newUser } = response.data
    localStorage.setItem('token', newToken)
    setToken(newToken)
    persistUser(newUser as User)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    persistUser(null)
  }

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/profile')
      persistUser(response.data)
    } catch {
      /* keep current user on transient failure */
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, refreshUser, loading }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}