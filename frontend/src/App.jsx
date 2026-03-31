import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, CalendarCheck, Building2 } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import Attendance from './pages/Attendance'

const navItems = [
  { to: '/',           label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/employees',  label: 'Employees',  icon: Users },
  { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
]

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="logo-mark">H</div>
        <h1>HRMS Lite</h1>
        <p>Admin Portal</p>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-label">Menu</div>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon />
            {label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="avatar" style={{ background: 'var(--surface2)' }}>A</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Admin</div>
            <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>admin@hrms.io</div>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default function App() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/"           element={<Dashboard />} />
          <Route path="/employees"  element={<Employees />} />
          <Route path="/attendance" element={<Attendance />} />
        </Routes>
      </main>
    </div>
  )
}
