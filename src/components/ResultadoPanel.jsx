import { calcularEscenario, fmt, fmtPct, tramoInfo } from '../utils/calculos'
import { AÑO_TRIBUTARIO } from '../data/tramos'

export default function ResultadoPanel({ datos }) {
  const sin = calcularEscenario(datos, false)
  const con = calcularEscenario(datos, true)
  const ahorro = sin.impuestoNeto - con.impuestoNeto
  const ti = tramoInfo(con.base)

  const rows = [
    { label: 'Base imponible',            sin: sin.base,           con: con.base },
    { label: 'Impuesto global bruto',     sin: sin.impuestoBruto,  con: con.impuestoBruto },
    { 
      label: `Ahorro APV (Rég. ${datos.apvRegimen || 'B'})`, 
      sin: 0, 
      con: datos.apvRegimen === 'A' ? con.creditoAPV : Math.max(0, sin.impuestoBruto - con.impuestoBruto)
    },
    { label: 'Crédito hijos',             sin: sin.creditoHijos,   con: con.creditoHijos },
    { label: 'Contribuciones B. Raíces',  sin: sin.contribuciones, con: con.contribuciones },
    { label: 'Crédito empresa',           sin: sin.creditoEmpresa || 0, con: con.creditoEmpresa || 0 },
    { label: 'Impuesto neto determinado', sin: sin.impuestoNeto,   con: con.impuestoNeto, bold: true },
    { label: 'PPM + Retenciones',         sin: sin.creditosTotales, con: con.creditosTotales },
    { label: 'Resultado (Dev. / Pago)',   sin: sin.resultado,       con: con.resultado, resultado: true },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* KPIs */}
      <div className="grid-3">
        <div className="metric green">
          <div className="m-label">Ahorro estimado</div>
          <div className="m-value">{fmt(ahorro)}</div>
          <div className="m-sub">Con plan de optimización</div>
        </div>
        <div className={`metric ${con.resultado >= 0 ? 'blue' : 'red'}`}>
          <div className="m-label">{con.resultado >= 0 ? 'Devolución estimada' : 'Pago estimado'}</div>
          <div className="m-value">{fmt(Math.abs(con.resultado))}</div>
          <div className="m-sub">Con plan optimizado</div>
        </div>
        <div className="metric">
          <div className="m-label">Tramo marginal</div>
          <div className="m-value">{fmtPct(ti.tasa * 100)}</div>
          <div className="m-sub">Con optimización</div>
        </div>
      </div>

      {/* Tabla comparativa */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--c-border)',
          fontSize: '13px', fontWeight: '500',
        }}>
          Comparativa AT{AÑO_TRIBUTARIO}
        </div>
        <div className="scroll-x">
          <table className="data-table">
            <thead>
              <tr>
                <th>Concepto</th>
                <th style={{ textAlign: 'right' }}>Sin plan</th>
                <th style={{ textAlign: 'right', color: 'var(--c-accent)' }}>Con optimización</th>
                <th style={{ textAlign: 'right' }}>Diferencia</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const diff = r.con - r.sin
                const isResultado = r.resultado
                const isBold = r.bold || isResultado

                const resultadoColor = (val) => {
                  if (!isResultado) return val < r.sin ? 'var(--c-accent)' : undefined
                  return val >= 0 ? 'var(--c-accent)' : 'var(--c-danger)'
                }

                return (
                  <tr key={i} style={{ background: isBold ? 'var(--c-bg)' : undefined }}>
                    <td style={{ fontWeight: isBold ? '600' : undefined }}>{r.label}</td>
                    <td style={{ textAlign: 'right' }}>{fmt(r.sin)}</td>
                    <td style={{ textAlign: 'right', color: 'var(--c-accent)', fontWeight: isBold ? '600' : undefined }}>
                      {fmt(r.con)}
                    </td>
                    <td style={{
                      textAlign: 'right',
                      color: diff < 0 ? 'var(--c-accent)' : diff > 0 ? 'var(--c-danger)' : 'var(--c-text-3)',
                      fontWeight: '500',
                    }}>
                      {diff !== 0 ? (diff > 0 ? '+' : '') + fmt(diff) : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tasa efectiva */}
      <div className="alert alert-info" style={{ fontSize: '12px' }}>
        Tasa efectiva sin plan: <strong>{fmtPct(sin.tasaEfectiva)}</strong> →
        con optimización: <strong>{fmtPct(con.tasaEfectiva)}</strong>
      </div>

    </div>
  )
}
