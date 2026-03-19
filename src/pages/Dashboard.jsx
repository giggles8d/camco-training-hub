import { useAuth } from '../context/AuthContext'

const PROGRAM_ICONS = {
  quality: '🔧',
  safety: '🦺',
  operations: '⚙️',
  hr: '👥',
  default: '📚'
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const programs = user?.programs || []

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  return (
    <div className="hub-shell">
      {/* Header */}
      <header className="hub-header">
        <div className="hub-header-left">
          <img src="/camco-logo.webp" alt="CAMCO" className="hub-header-logo" />
          <div className="hub-header-divider" />
          <span className="hub-header-title">TRAINING HUB</span>
        </div>
        <div className="hub-header-right">
          <span className="hub-header-name">{user?.name?.toUpperCase()}</span>
          <span className="hub-header-dept">{user?.department}</span>
          <div className="hub-avatar" onClick={logout} title="Sign Out">{initials}</div>
        </div>
      </header>

      <div className="hub-accent-rule" />

      {/* Main */}
      <main className="hub-main">
        <div className="hub-welcome">
          <div className="hub-welcome-text">
            <h2>Welcome back, {user?.name?.split(' ')[0]}</h2>
            <p>Select a training program to continue your development.</p>
          </div>
          <div className="hub-welcome-meta">
            <span className="hub-dept-badge">{user?.department}</span>
            {user?.employee_id && <span className="hub-id-badge">ID: {user.employee_id}</span>}
          </div>
        </div>

        {programs.length === 0 ? (
          <div className="hub-empty">
            <div className="hub-empty-icon">📋</div>
            <h3>NO PROGRAMS ASSIGNED YET</h3>
            <p>Your account is active but no training programs have been assigned. Contact your administrator for access.</p>
          </div>
        ) : (
          <div className="hub-programs">
            {programs.map(program => (
              <a
                key={program.id}
                href={program.url}
                className="hub-program-card"
                style={{ '--program-color': program.color || '#3b82f6' }}
              >
                <div className="hub-program-icon">
                  {PROGRAM_ICONS[program.slug] || PROGRAM_ICONS.default}
                </div>
                <div className="hub-program-body">
                  <div className="hub-program-name">{program.name}</div>
                  <div className="hub-program-desc">{program.description}</div>
                </div>
                <div className="hub-program-arrow">→</div>
              </a>
            ))}
          </div>
        )}
      </main>

      <footer className="hub-footer">
        <span>CAMCO Manufacturing Training Hub</span>
        <button onClick={logout} className="hub-signout">Sign Out</button>
      </footer>
    </div>
  )
}
