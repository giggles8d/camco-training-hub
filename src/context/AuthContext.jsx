import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('camco_hub_user')
    return saved ? JSON.parse(saved) : null
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      localStorage.setItem('camco_hub_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('camco_hub_user')
    }
  }, [user])

  const signup = async ({ name, email, department, employeeId, password }) => {
    setLoading(true)
    try {
      // Check if email already exists
      const { data: existing } = await supabase
        .from('hub_employees')
        .select('id, status')
        .eq('email', email)
        .single()

      if (existing) {
        if (existing.status === 'pending') {
          return { error: 'Your account is pending approval. Please check back soon.' }
        }
        if (existing.status === 'active') {
          return { error: 'An account with this email already exists. Please log in instead.' }
        }
      }

      const { error } = await supabase
        .from('hub_employees')
        .insert({
          name,
          email,
          department,
          employee_id: employeeId,
          password_hash: password,
          status: 'pending',
          created_at: new Date().toISOString()
        })

      if (error) throw error
      return { error: null, pending: true }
    } catch (err) {
      return { error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const login = async ({ email, password }) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('hub_employees')
        .select('*')
        .eq('email', email)
        .eq('password_hash', password)
        .single()

      if (error || !data) {
        return { error: 'Invalid email or password.' }
      }

      if (data.status === 'pending') {
        return { error: 'Your account is pending approval. You will be notified when access is granted.' }
      }

      if (data.status === 'inactive') {
        return { error: 'Your account has been deactivated. Please contact your administrator.' }
      }

      // Load assigned programs
      const { data: assignments } = await supabase
        .from('hub_program_assignments')
        .select('program_id, hub_programs(id, name, slug, description, icon, color, url)')
        .eq('employee_id', data.id)

      const programs = assignments?.map(a => a.hub_programs).filter(Boolean) || []

      setUser({ ...data, programs, role: 'employee' })
      return { error: null }
    } catch (err) {
      return { error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const adminLogin = async ({ password }) => {
    const adminPassword = 'Camco2024!'
    if (password !== adminPassword) {
      return { error: 'Invalid admin password.' }
    }
    setUser({ name: 'Admin', role: 'admin' })
    return { error: null }
  }

  const logout = () => setUser(null)

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, adminLogin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
