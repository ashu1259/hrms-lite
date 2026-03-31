import { useEffect, useState } from 'react'
import { Plus, Trash2, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { getEmployees, createEmployee, deleteEmployee } from '../api'

const DEPARTMENTS = [
  'Engineering', 'Marketing', 'Sales', 'HR',
  'Finance', 'Operations', 'Design', 'Product',
]

function AddEmployeeModal({ onClose, onAdded }) {
  const [form, setForm] = useState({ employee_id: '', full_name: '', email: '', department: '' })
  const [loading, setLoading] = useState(false)

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.employee_id || !form.full_name || !form.email || !form.department)
      return toast.error('All fields are required')
    setLoading(true)
    try {
      await createEmployee(form)
      toast.success('Employee added successfully')
      onAdded()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add employee')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add New Employee</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Employee ID</label>
              <input placeholder="e.g. EMP001" value={form.employee_id} onChange={set('employee_id')} />
            </div>
            <div className="form-group">
              <label>Full Name</label>
              <input placeholder="Jane Doe" value={form.full_name} onChange={set('full_name')} />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="jane@company.com" value={form.email} onChange={set('email')} />
            </div>
            <div className="form-group">
              <label>Department</label>
              <select value={form.department} onChange={set('department')}>
                <option value="">Select department</option>
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="form-actions" style={{ marginTop: 20 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const load = () => {
    setLoading(true)
    getEmployees()
      .then(r => setEmployees(r.data))
      .catch(() => toast.error('Failed to load employees'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This also removes all their attendance records.`)) return
    try {
      await deleteEmployee(id)
      toast.success('Employee deleted')
      load()
    } catch {
      toast.error('Failed to delete employee')
    }
  }

  return (
    <>
      <div className="page-header">
        <h2>Employees</h2>
        <p>Manage your organization's workforce</p>
      </div>
      <div className="page-body">
        <div className="card">
          <div className="section-header">
            <h3>All Employees ({employees.length})</h3>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus /> Add Employee
            </button>
          </div>

          {loading ? (
            <div className="loading-state"><div className="spinner" /><span>Loading employees...</span></div>
          ) : employees.length === 0 ? (
            <div className="empty-state">
              <Users />
              <h4>No employees yet</h4>
              <p>Add your first employee to get started</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>ID</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Present Days</th>
                    <th>Absent Days</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => (
                    <tr key={emp.employee_id}>
                      <td>
                        <div className="avatar-row">
                          <div className="avatar">{emp.full_name[0]}</div>
                          <span style={{ fontWeight: 500 }}>{emp.full_name}</span>
                        </div>
                      </td>
                      <td><span className="emp-id">{emp.employee_id}</span></td>
                      <td style={{ color: 'var(--text-muted)' }}>{emp.email}</td>
                      <td><span className="badge badge-blue">{emp.department}</span></td>
                      <td style={{ color: 'var(--success)', fontFamily: 'DM Mono, monospace' }}>{emp.total_present}</td>
                      <td style={{ color: 'var(--danger)', fontFamily: 'DM Mono, monospace' }}>{emp.total_absent}</td>
                      <td>
                        <button className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(emp.employee_id, emp.full_name)}>
                          <Trash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <AddEmployeeModal onClose={() => setShowModal(false)} onAdded={load} />
      )}
    </>
  )
}
