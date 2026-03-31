import { useEffect, useState } from 'react'
import { Users, UserCheck, UserX, Building2 } from 'lucide-react'
import { getDashboard } from '../api'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getDashboard()
      .then(r => setData(r.data))
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Overview of your organization today</p>
      </div>
      <div className="page-body">
        {loading && (
          <div className="loading-state">
            <div className="spinner" />
            <span>Loading...</span>
          </div>
        )}
        {error && (
          <div className="empty-state">
            <p style={{ color: 'var(--danger)' }}>{error}</p>
          </div>
        )}
        {data && (
          <>
            <div className="stat-grid">
              <div className="stat-card">
                <div className="stat-icon blue"><Users /></div>
                <div className="stat-value">{data.total_employees}</div>
                <div className="stat-label">Total Employees</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon green"><UserCheck /></div>
                <div className="stat-value">{data.total_present_today}</div>
                <div className="stat-label">Present Today</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon red"><UserX /></div>
                <div className="stat-value">{data.total_absent_today}</div>
                <div className="stat-label">Absent Today</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon yellow"><Building2 /></div>
                <div className="stat-value">{data.departments.length}</div>
                <div className="stat-label">Departments</div>
              </div>
            </div>

            {data.departments.length > 0 && (
              <div className="card">
                <div className="section-header">
                  <h3>Employees by Department</h3>
                </div>
                <div className="dept-bar">
                  {data.departments.map(d => (
                    <div key={d.department} className="dept-pill">
                      <span className="name">{d.department}</span>
                      <span className="count">{d.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
