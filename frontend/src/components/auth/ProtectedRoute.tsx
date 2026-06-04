import React, { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'

// Intercept window.fetch once globally to attach JWT bearer token to API calls
let fetchIntercepted = false
const setupFetchInterceptor = () => {
  if (fetchIntercepted) return
  fetchIntercepted = true
  
  const originalFetch = window.fetch
  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
    const token = useAuthStore.getState().token
    
    if (token && (url.includes('http://localhost:8000/api') || url.startsWith('/api'))) {
      init = init || {}
      const headers = new Headers(init.headers)
      if (!headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      init.headers = headers
    }
    
    return originalFetch(input, init)
  }
}

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = useAuthStore((state) => state.token)
  
  useEffect(() => {
    setupFetchInterceptor()
  }, [])
  
  if (!token) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}
