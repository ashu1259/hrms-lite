import { useEffect, useState } from 'react'
import { CalendarCheck, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { getAttendance, getEmployees, markAttendance, deleteAttendance } from '../api'

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function MarkModal({ onClose, onMarked }) {
  const [employees, setEmployees] = useState([])
  const [form, setForm] = useState({ employee_id: '', date: todayStr(), status: 'Present' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getEmployees().then(r => setEmployees(r.data))
  }, [])

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.employee_id) return toast.error('Please select an employee')
    setLoading(true)
    try {
      await markAttendance(form)
      toast.success('Attendance marked successfully')
      onMarked()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to mark attendance')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Mark Attendance</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Employee</label>
              <select value={form.employee_id} onChange={set('employee_id')}>
                <option value="">Select an employee</option>
                {employees.map(e => (
                  <option key={e.employee_id} value={e.employee_id}>
                    {e.full_name} ({e.employee_id})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={form.date} onChange={set('date')} />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={form.status} onChange={set('status')}>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
          </div>
          <div className="form-actions" style={{ marginTop: 20 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Mark Attendance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Attendance() {
  const [records, setRecords] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filterEmployee, setFilterEmployee] = useState('')
  const [filterDate, setFilterDate] = useState('')

  const load = () => {
    setLoading(true)
    const params = {}
    if (filterEmployee) params.employee_id = filterEmployee
    if (filterDate) params.date = filterDate
    getAttendance(params)
      .then(r => setRecords(r.data))
      .catch(() => toast.error('Failed to load attendance records'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { getEmployees().then(r => setEmployees(r.data)) }, [])
  useEffect(() => { load() }, [filterEmployee, filterDate])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this attendance record?')) return
    try {
      await deleteAttendance(id)
      toast.success('Record deleted')
      load()
    } catch {
      toast.error('Failed to delete record')
    }
  }

  const clearFilters = () => {
    setFilterEmployee('')
    setFilterDate('')
  }

  return (
    <>
      <div className="page-header">
        <h2>Attendance</h2>
        <p>Track and manage daily attendance records</p>
      </div>
      <div className="page-body">
        <div className="filter-bar">
          <label>Filter:</label>
          <select value={filterEmployee} onChange={e => setFilterEmployee(e.target.value)}>
            <option value="">All Employees</option>
            {employees.map(e => (
              <option key={e.employee_id} value={e.employee_id}>{e.full_name}</option>
            ))}
          </select>
          <input
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
          />
          {(filterEmployee || filterDate) && (
            <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>

        <div className="card">
          <div className="section-header">
            <h3>Attendance Records ({records.length})</h3>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus /> Mark Attendance
            </button>
          </div>

          {loading ? (
            <div className="loading-state"><div className="spinner" /><span>Loading records...</span></div>
          ) : records.length === 0 ? (
            <div className="empty-state">
              <CalendarCheck />
              <h4>No attendance records found</h4>
              <p>{filterEmployee || filterDate ? 'Try clearing the filters' : 'Start marking attendance for your employees'}</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>ID</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(rec => (
                    <tr key={rec.id}>
                      <td>
                        <div className="avatar-row">
                          <div className="avatar">{(rec.employee_name || rec.employee_id)[0].toUpperCase()}</div>
                          <span style={{ fontWeight: 500 }}>{rec.employee_name || rec.employee_id}</span>
                        </div>
                      </td>
                      <td><span className="emp-id">{rec.employee_id}</span></td>
                      <td style={{ fontFamily: 'DM Mono, monospace', fontSize: 13 }}>{rec.date}</td>
                      <td>
                        <span className={`badge badge-${rec.status === 'Present' ? 'present' : 'absent'}`}>
                          {rec.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(rec.id)}>
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
        <MarkModal onClose={() => setShowModal(false)} onMarked={load} />
      )}
    </>
  )
}
