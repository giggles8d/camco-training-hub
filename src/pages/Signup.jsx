import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const DEPARTMENTS = [
  'Quality',
  'Production / Machining',
  'Engineering',
  'Purchasing',
  'Inspection',
  'Shipping / Receiving',
  'Management',
  'Administration',
  'Other'
]

export default function Signup() {
  const { signup, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', department: '', employeeId: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    const result = await signup({
      name: form.name,
      email: form.email,
      department: form.department,
      employeeId: form.employeeId,
      password: form.password
    })

    if (result.error) {
      setError(result.error)
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <div className="auth-logo-wrap">
            <img src="/camco-logo.webp" alt="CAMCO Manufacturing" className="auth-logo" />
          </div>
          <div className="auth-success">
            <div className="auth-success-icon">✓</div>
            <h2>REQUEST SUBMITTED</h2>
            <p>Your access request has been received. An administrator will review and approve your account shortly.</p>
            <p className="auth-success-note">You will be able to log in once your account is approved.</p>
            <Link to="/login" className="auth-btn" style={{ display: 'block', textAlign: 'center', marginTop: 24, textDecoration: 'none' }}>
              BACK TO LOGIN
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-shell">
      <div className="auth-card auth-card--wide">
        <div className="auth-logo-wrap">
          <img src="/camco-logo.webp" alt="CAMCO Manufacturing" className="auth-logo" />
        </div>

        <div className="auth-header">
          <h1>REQUEST ACCESS</h1>
          <p>Submit your information to request a training account</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label>FULL NAME</label>
              <input type="text" value={form.name} onChange={set('name')} placeholder="Jane Smith" required />
            </div>
            <div className="form-group">
              <label>EMPLOYEE ID</label>
              <input type="text" value={form.employeeId} onChange={set('employeeId')} placeholder="EMP-001" />
            </div>
          </div>

          <div className="form-group">
            <label>EMAIL ADDRESS</label>
            <input type="email" value={form.email} onChange={set('email')} placeholder="your.name@camcomfg.com" required />
          </div>

          <div className="form-group">
            <label>DEPARTMENT</label>
            <select value={form.department} onChange={set('department')} required>
              <option value="">Select your department...</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>CREATE PASSWORD</label>
              <input type="password" value={form.password} onChange={set('password')} placeholder="Min. 6 characters" required />
            </div>
            <div className="form-group">
              <label>CONFIRM PASSWORD</label>
              <input type="password" value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Repeat password" required />
            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'SUBMITTING...' : 'SUBMIT ACCESS REQUEST'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Sign In</Link></p>
        </div>
      </div>
      <div className="auth-bg-text">CAMCO MANUFACTURING</div>
    </div>
  )
}
