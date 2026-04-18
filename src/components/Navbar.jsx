import { NavLink } from 'react-router-dom'
import { BarChart2, Users, Calendar, FileText, Calculator } from 'lucide-react'

const links = [
  { to: '/',           label: 'Simulador',  Icon: Calculator },
  { to: '/dashboard',  label: 'Cartera',    Icon: BarChart2 },
  { to: '/calendario', label: 'Calendario', Icon: Calendar },
]

export default function Navbar() {
  return (
    <nav style={{
      background: 'var(--c-surface)',
      borderBottom: '1px solid var(--c-border)',
      padding: '0 1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '2rem',
      height: '56px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '1rem' }}>
        <FileText size={18} style={{ color: 'var(--c-accent)' }} />
        <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: '17px', color: 'var(--c-text)' }}>
          TributarioCL
        </span>
      </div>

      {links.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: isActive ? '500' : '400',
            color: isActive ? 'var(--c-accent)' : 'var(--c-text-2)',
            textDecoration: 'none',
            padding: '4px 2px',
            borderBottom: isActive ? '2px solid var(--c-accent)' : '2px solid transparent',
            height: '56px',
            transition: 'color .15s',
          })}
        >
          <Icon size={15} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
