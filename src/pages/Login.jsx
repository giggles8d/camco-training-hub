import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, adminLogin, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (isAdmin) {
      const result = await adminLogin({ password })
      if (result.error) { setError(result.error); return }
      navigate('/admin')
    } else {
      const result = await login({ email, password })
      if (result.error) { setError(result.error); return }
      navigate('/')
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-logo-wrap">
          <img src="/camco-logo.webp" alt="CAMCO Manufacturing" className="auth-logo" />
        </div>

        <div className="auth-header">
          <h1>CAMCO TRAINING HUB</h1>
          <p>Employee Learning & Development Portal</p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${!isAdmin ? 'auth-tab--active' : ''}`}
            onClick={() => { setIsAdmin(false); setError('') }}
          >
            EMPLOYEE LOGIN
          </button>
          <button
            className={`auth-tab ${isAdmin ? 'auth-tab--active' : ''}`}
            onClick={() => { setIsAdmin(true); setError('') }}
          >
            ADMIN
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isAdmin && (
            <div className="form-group">
              <label>EMAIL ADDRESS</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your.name@camcomfg.com"
                required
              />
            </div>
          )}
          <div className="form-group">
            <label>{isAdmin ? 'ADMIN PASSWORD' : 'PASSWORD'}</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </form>

        {!isAdmin && (
          <div className="auth-footer">
            <p>Don't have an account? <Link to="/signup">Request Access</Link></p>
          </div>
        )}
      </div>

      <div className="auth-bg-text">CAMCO MANUFACTURING</div>
    </div>
  )
}
