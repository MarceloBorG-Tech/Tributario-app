import { optimizarAPV, fmt, fmtPct } from '../utils/calculos'
import { TrendingDown, AlertCircle } from 'lucide-react'

export default function OptimizadorAPV({ datos }) {
  const resultado = optimizarAPV(datos)

  if (!resultado || !resultado.posible) {
    return (
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px' }}>
        <AlertCircle size={16} style={{ color: 'var(--c-text-3)' }} />
        <span style={{ fontSize: '13px', color: 'var(--c-text-2)' }}>
          {resultado?.mensaje || 'Sin optimización disponible.'}
        </span>
      </div>
    )
  }

  const { tramoActual, resultados } = resultado
  const mejorOpcion = resultados[0]
  const esRegimenB = mejorOpcion.label.includes('Reg. B')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* HEADER DE ESTRATEGIA RECOMENDADA */}
      <div className="card" style={{ background: 'var(--c-accent-light)', border: '1px solid var(--c-accent-mid)', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <TrendingDown size={18} style={{ color: 'var(--c-accent)' }} />
          <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--c-accent)', textTransform: 'uppercase' }}>
            Estrategia Sugerida: APV-{esRegimenB ? 'B' : 'A'}
          </span>
        </div>
        
        <p style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--c-text-2)', margin: 0 }}>
          Tu tramo marginal es <strong>{fmtPct(tramoActual.tasa * 100)}</strong>. 
          {esRegimenB 
            ? ` Recomendamos Régimen B para reducir tu base imponible de forma eficiente.`
            : ` Recomendamos Régimen A: obtienes el mismo ahorro fiscal invirtiendo menos capital.`
          }
        </p>
      </div>

      {/* LISTA DE OPCIONES */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {resultados.map((r, i) => (
          <div key={i} className="card" style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px',
            borderLeft: i === 0 ? '4px solid var(--c-accent)' : '1px solid var(--c-border)',
            opacity: i === 0 ? 1 : 0.8
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600' }}>{r.label}</span>
                {i === 0 && <span style={{ fontSize: '9px', background: 'var(--c-accent)', color: 'white', padding: '1px 6px', borderRadius: '10px' }}>MÁS RENTABLE</span>}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--c-text-3)', marginTop: '4px' }}>
                Inversión: <strong>{fmt(r.apvNecesario)}</strong> | ROI: <strong>{fmtPct(r.roi)}</strong>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '18px', fontFamily: "'DM Serif Display', serif", color: i === 0 ? 'var(--c-accent)' : 'var(--c-text-1)' }}>
                +{fmt(r.ahorro)}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--c-text-3)' }}>AHORRO FISCAL</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}