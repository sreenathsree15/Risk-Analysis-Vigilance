import { create } from 'zustand'

export interface AuthUser {
  username: string
  name: string
  role: string
}

export interface AuthState {
  token: string | null
  user: AuthUser | null
  rememberMe: boolean
  login: (token: string, user: AuthUser, rememberMe: boolean) => void
  updateSession: (token: string, user: AuthUser, rememberMe: boolean) => void
  logout: () => void
}

// Retrieve initial state from storage
const getInitialAuth = () => {
  try {
    const remember = localStorage.getItem('auth_remember') === 'true'
    const storage = remember ? localStorage : sessionStorage
    const token = storage.getItem('auth_token')
    const userJson = storage.getItem('auth_user')
    const user = userJson ? JSON.parse(userJson) : null
    
    return { token, user, rememberMe: remember }
  } catch (e) {
    return { token: null, user: null, rememberMe: false }
  }
}

const initialAuth = getInitialAuth()

export const useAuthStore = create<AuthState>((set) => ({
  token: initialAuth.token,
  user: initialAuth.user,
  rememberMe: initialAuth.rememberMe,
  
  login: (token, user, rememberMe) => {
    try {
      localStorage.setItem('auth_remember', rememberMe ? 'true' : 'false')
      const storage = rememberMe ? localStorage : sessionStorage
      storage.setItem('auth_token', token)
      storage.setItem('auth_user', JSON.stringify(user))
    } catch (e) {
      console.error('Storage write error:', e)
    }
    
    set({ token, user, rememberMe })
  },

  updateSession: (token, user, rememberMe) => {
    try {
      const storage = rememberMe ? localStorage : sessionStorage
      const other = rememberMe ? sessionStorage : localStorage
      storage.setItem('auth_token', token)
      storage.setItem('auth_user', JSON.stringify(user))
      other.removeItem('auth_token')
      other.removeItem('auth_user')
    } catch (e) {
      console.error('Storage write error:', e)
    }
    set({ token, user })
  },
  
  logout: () => {
    try {
      localStorage.removeItem('auth_remember')
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      sessionStorage.removeItem('auth_token')
      sessionStorage.removeItem('auth_user')
    } catch (e) {
      console.error('Storage clear error:', e)
    }
    
    set({ token: null, user: null, rememberMe: false })
  }
}))
