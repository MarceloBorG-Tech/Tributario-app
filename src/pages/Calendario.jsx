import { CALENDARIO } from '../data/tramos'
import { Calendar, Clock, AlertTriangle, CheckCircle, Info } from 'lucide-react'

function diasRestantes(fecha) {
  const hoy = new Date()
  hoy.setHours(0,0,0,0)
  const d = new Date(fecha)
  d.setHours(0,0,0,0)
  return Math.ceil((d - hoy) / (1000 * 60 * 60 * 24))
}

function badgeTipo(tipo, dias) {
  if (dias < 0) return { cls: 'badge-gray', label: 'Vencido' }
  if (tipo === 'danger' || dias <= 7) return { cls: 'badge-red', label: `${dias}d` }
  if (tipo === 'warn' || dias <= 30) return { cls: 'badge-warn', label: `${dias}d` }
  if (tipo === 'success') return { cls: 'badge-green', label: `${dias}d` }
  return { cls: 'badge-blue', label: `${dias}d` }
}

function IconTipo({ tipo }) {
  if (tipo === 'danger') return <AlertTriangle size={15} style={{ color: 'var(--c-danger)' }} />
  if (tipo === 'warn') return <Clock size={15} style={{ color: 'var(--c-warn)' }} />
  if (tipo === 'success') return <CheckCircle size={15} style={{ color: 'var(--c-accent)' }} />
  return <Info size={15} style={{ color: 'var(--c-blue)' }} />
}

export default function Calendario() {
  const hoy = new Date()
  const eventos = CALENDARIO
    .map(e => ({ ...e, dias: diasRestantes(e.fecha) }))
    .sort((a, b) => a.dias - b.dias)

  const proximos = eventos.filter(e => e.dias >= 0)
  const pasados = eventos.filter(e => e.dias < 0)

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '26px', marginBottom: '4px' }}>Calendario tributario</h1>
        <p style={{ fontSize: '13px', color: 'var(--c-text-3)' }}>
          {hoy.toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Próximo vencimiento destacado */}
      {proximos.length > 0 && (
        <div className="card" style={{
          background: proximos[0].dias <= 7 ? 'var(--c-danger-light)' : proximos[0].dias <= 30 ? 'var(--c-warn-light)' : 'var(--c-accent-light)',
          border: `1px solid ${proximos[0].dias <= 7 ? 'var(--c-danger)' : proximos[0].dias <= 30 ? 'var(--c-warn)' : 'var(--c-accent-mid)'}`,
          marginBottom: '1.5rem',
        }}>
          <div style={{ fontSize: '11px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--c-text-3)', marginBottom: '6px' }}>
            Próximo vencimiento
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '500' }}>{proximos[0].titulo}</div>
              <div style={{ fontSize: '13px', color: 'var(--c-text-2)', marginTop: '2px' }}>{proximos[0].desc}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '24px', fontFamily: "'DM Serif Display', serif" }}>{proximos[0].dias}d</div>
              <div style={{ fontSize: '11px', color: 'var(--c-text-3)' }}>
                {new Date(proximos[0].fecha).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista próximos */}
      <div className="section-label">Próximos vencimientos</div>
      <div className="card" style={{ padding: 0, marginBottom: '1.5rem' }}>
        {proximos.map((e, i) => {
          const badge = badgeTipo(e.tipo, e.dias)
          return (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderBottom: i < proximos.length - 1 ? '1px solid var(--c-border)' : 'none',
            }}>
              <IconTipo tipo={e.tipo} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '500' }}>{e.titulo}</div>
                <div style={{ fontSize: '12px', color: 'var(--c-text-3)' }}>
                  {new Date(e.fecha).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
                  {' — '}{e.desc}
                </div>
              </div>
              <span className={`badge ${badge.cls}`}>{badge.label}</span>
            </div>
          )
        })}
      </div>

      {/* Pasados */}
      {pasados.length > 0 && (
        <>
          <div className="section-label">Vencidos</div>
          <div className="card" style={{ padding: 0 }}>
            {pasados.map((e, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 16px',
                borderBottom: i < pasados.length - 1 ? '1px solid var(--c-border)' : 'none',
                opacity: .5,
              }}>
                <Calendar size={14} style={{ color: 'var(--c-text-3)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px' }}>{e.titulo}</div>
                  <div style={{ fontSize: '11px', color: 'var(--c-text-3)' }}>
                    {new Date(e.fecha).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
                <span className="badge badge-gray">Vencido</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
