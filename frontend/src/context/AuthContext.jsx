import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored && token) {
      try { setUser(JSON.parse(stored)) } catch { logout() }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password })
    const { token: t, ...userData } = res.data.data
    localStorage.setItem('token', t)
    localStorage.setItem('user', JSON.stringify(userData))
    setToken(t)
    setUser(userData)
    return userData
  }

  const register = async (formData) => {
    const res = await authAPI.register(formData)
    const { token: t, ...userData } = res.data.data
    localStorage.setItem('token', t)
    localStorage.setItem('user', JSON.stringify(userData))
    setToken(t)
    setUser(userData)
    return userData
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  const isAdmin       = () => user?.role === 'ADMIN'
  const isStudent     = () => user?.role === 'STUDENT'
  const isRecruiter   = () => user?.role === 'RECRUITER'
  const isCoordinator = () => user?.role === 'COORDINATOR'

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout,
                                   isAdmin, isStudent, isRecruiter, isCoordinator }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
