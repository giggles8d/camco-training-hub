import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function AdminDashboard() {
  const { logout } = useAuth()
  const [tab, setTab] = useState('pending')
  const [employees, setEmployees] = useState([])
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [assignModal, setAssignModal] = useState(false)
  const [selectedPrograms, setSelectedPrograms] = useState([])
  const [tempPassword, setTempPassword] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [toast, setToast] = useState('')

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [empRes, progRes] = await Promise.all([
      supabase.from('hub_employees').select('*').order('created_at', { ascending: false }),
      supabase.from('hub_programs').select('*').order('name')
    ])
    setEmployees(empRes.data || [])
    setPrograms(progRes.data || [])
    setLoading(false)
  }

  const openAssignModal = async (employee) => {
    setSelectedEmployee(employee)
    setTempPassword('')
    const { data } = await supabase
      .from('hub_program_assignments')
      .select('program_id')
      .eq('employee_id', employee.id)
    setSelectedPrograms(data?.map(a => a.program_id) || [])
    setAssignModal(true)
  }

  const approveEmployee = async () => {
    if (!tempPassword) { showToast('Please set a temporary password first.'); return }
    setActionLoading(true)
    const { error } = await supabase
      .from('hub_employees')
      .update({ status: 'active', password_hash: tempPassword })
      .eq('id', selectedEmployee.id)
    if (error) { showToast('Error approving employee.'); setActionLoading(false); return }

    // Save program assignments
    if (selectedPrograms.length > 0) {
      await supabase.from('hub_program_assignments').delete().eq('employee_id', selectedEmployee.id)
      await supabase.from('hub_program_assignments').insert(
        selectedPrograms.map(pid => ({ employee_id: selectedEmployee.id, program_id: pid }))
      )
    }

    showToast(`✓ ${selectedEmployee.name} approved and programs assigned.`)
    setAssignModal(false)
    setSelectedEmployee(null)
    loadData()
    setActionLoading(false)
  }

  const updateAssignments = async () => {
    setActionLoading(true)
    await supabase.from('hub_program_assignments').delete().eq('employee_id', selectedEmployee.id)
    if (selectedPrograms.length > 0) {
      await supabase.from('hub_program_assignments').insert(
        selectedPrograms.map(pid => ({ employee_id: selectedEmployee.id, program_id: pid }))
      )
    }
    if (tempPassword) {
      await supabase.from('hub_employees').update({ password_hash: tempPassword }).eq('id', selectedEmployee.id)
    }
    showToast(`✓ ${selectedEmployee.name} updated.`)
    setAssignModal(false)
    loadData()
    setActionLoading(false)
  }

  const deactivateEmployee = async (emp) => {
    if (!confirm(`Deactivate ${emp.name}?`)) return
    await supabase.from('hub_employees').update({ status: 'inactive' }).eq('id', emp.id)
    showToast(`${emp.name} deactivated.`)
    loadData()
  }

  const reactivateEmployee = async (emp) => {
    await supabase.from('hub_employees').update({ status: 'active' }).eq('id', emp.id)
    showToast(`${emp.name} reactivated.`)
    loadData()
  }

  const toggleProgram = (pid) => {
    setSelectedPrograms(prev =>
      prev.includes(pid) ? prev.filter(p => p !== pid) : [...prev, pid]
    )
  }

  const filtered = employees.filter(e => {
    if (tab === 'pending') return e.status === 'pending'
    if (tab === 'active') return e.status === 'active'
    if (tab === 'inactive') return e.status === 'inactive'
    return true
  })

  const counts = {
    pending: employees.filter(e => e.status === 'pending').length,
    active: employees.filter(e => e.status === 'active').length,
    inactive: employees.filter(e => e.status === 'inactive').length,
  }

  return (
    <div className="admin-shell">
      {toast && <div className="hub-toast">{toast}</div>}

      <header className="hub-header">
        <div className="hub-header-left">
          <img src="/camco-logo.webp" alt="CAMCO" className="hub-header-logo" />
          <div className="hub-header-divider" />
          <span className="hub-header-title">ADMIN — TRAINING HUB</span>
        </div>
        <div className="hub-header-right">
          <span className="hub-header-name">ADMINISTRATOR</span>
          <button onClick={logout} className="hub-signout-btn">Sign Out</button>
        </div>
      </header>

      <div className="hub-accent-rule" />

      <main className="admin-main">
        {/* Summary cards */}
        <div className="admin-summary">
          {[
            { label: 'PENDING APPROVAL', count: counts.pending, color: '#f59e0b' },
            { label: 'ACTIVE EMPLOYEES', count: counts.active, color: '#0e9f6e' },
            { label: 'TOTAL PROGRAMS', count: programs.length, color: '#3b82f6' },
            { label: 'INACTIVE', count: counts.inactive, color: '#94a3b8' },
          ].map(s => (
            <div key={s.label} className="admin-stat" style={{ '--stat-color': s.color }}>
              <div className="admin-stat-num">{s.count}</div>
              <div className="admin-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          {['pending', 'active', 'inactive', 'all'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`admin-tab-btn ${tab === t ? 'admin-tab-btn--active' : ''}`}
            >
              {t.toUpperCase()}
              {t !== 'all' && <span className="admin-tab-count">{counts[t] || 0}</span>}
            </button>
          ))}
        </div>

        {/* Employee table */}
        <div className="admin-table-wrap">
          {loading ? (
            <div className="admin-loading">Loading employees...</div>
          ) : filtered.length === 0 ? (
            <div className="admin-empty">No {tab} employees.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>NAME</th>
                  <th>EMAIL</th>
                  <th>DEPARTMENT</th>
                  <th>EMP ID</th>
                  <th>STATUS</th>
                  <th>REQUESTED</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(emp => (
                  <tr key={emp.id}>
                    <td className="admin-emp-name">{emp.name}</td>
                    <td>{emp.email}</td>
                    <td>{emp.department}</td>
                    <td>{emp.employee_id || '—'}</td>
                    <td>
                      <span className={`admin-status admin-status--${emp.status}`}>
                        {emp.status.toUpperCase()}
                      </span>
                    </td>
                    <td>{emp.created_at ? new Date(emp.created_at).toLocaleDateString() : '—'}</td>
                    <td>
                      <div className="admin-actions">
                        <button
                          onClick={() => openAssignModal(emp)}
                          className="admin-btn admin-btn--primary"
                        >
                          {emp.status === 'pending' ? 'Approve & Assign' : 'Edit Access'}
                        </button>
                        {emp.status === 'active' && (
                          <button onClick={() => deactivateEmployee(emp)} className="admin-btn admin-btn--danger">
                            Deactivate
                          </button>
                        )}
                        {emp.status === 'inactive' && (
                          <button onClick={() => reactivateEmployee(emp)} className="admin-btn admin-btn--success">
                            Reactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Assign Modal */}
      {assignModal && selectedEmployee && (
        <div className="modal-overlay" onClick={() => setAssignModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">{selectedEmployee.name}</div>
                <div className="modal-subtitle">{selectedEmployee.email} · {selectedEmployee.department}</div>
              </div>
              <button onClick={() => setAssignModal(false)} className="modal-close">✕</button>
            </div>

            <div className="modal-body">
              <div className="modal-section-label">ASSIGN TRAINING PROGRAMS</div>
              <div className="modal-programs">
                {programs.map(prog => (
                  <label key={prog.id} className={`modal-program ${selectedPrograms.includes(prog.id) ? 'modal-program--selected' : ''}`}>
                    <input
                      type="checkbox"
                      checked={selectedPrograms.includes(prog.id)}
                      onChange={() => toggleProgram(prog.id)}
                    />
                    <div className="modal-program-info">
                      <div className="modal-program-name">{prog.name}</div>
                      <div className="modal-program-desc">{prog.description}</div>
                    </div>
                  </label>
                ))}
                {programs.length === 0 && (
                  <div className="modal-empty">No programs configured yet. Add programs in Supabase.</div>
                )}
              </div>

              <div className="modal-section-label" style={{ marginTop: 20 }}>
                {selectedEmployee.status === 'pending' ? 'SET TEMPORARY PASSWORD' : 'RESET PASSWORD (OPTIONAL)'}
              </div>
              <input
                type="text"
                value={tempPassword}
                onChange={e => setTempPassword(e.target.value)}
                placeholder={selectedEmployee.status === 'pending' ? 'Set a temporary password...' : 'Leave blank to keep current password'}
                className="modal-input"
              />
              {selectedEmployee.status === 'pending' && (
                <p className="modal-hint">You'll share this password with the employee. They can change it later.</p>
              )}
            </div>

            <div className="modal-footer">
              <button onClick={() => setAssignModal(false)} className="admin-btn">Cancel</button>
              <button
                onClick={selectedEmployee.status === 'pending' ? approveEmployee : updateAssignments}
                className="admin-btn admin-btn--primary"
                disabled={actionLoading}
              >
                {actionLoading ? 'Saving...' : selectedEmployee.status === 'pending' ? 'Approve & Save' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
