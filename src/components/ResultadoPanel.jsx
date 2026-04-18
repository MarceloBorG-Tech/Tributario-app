import { calcularComparativa, fmt, fmtPct, tramoInfo } from '../utils/calculos'
import { AÑO_TRIBUTARIO } from '../data/tramos'
import { CheckCircle, AlertCircle, Info } from 'lucide-react'

export default function ResultadoPanel({ datos }) {
  const { actual, optimizado, tipoOptimo, labelOptimo, recomendacion, ahorro, tieneAPV } = calcularComparativa(datos)
  const ti = tramoInfo(optimizado.base)

  // Icono y color según tipo de recomendación
  const esOptimo = (tipoOptimo === 'apv_a' && datos.apvRegimen === 'A' && tieneAPV) ||
                   (tipoOptimo === 'apv_b' && datos.apvRegimen === 'B' && tieneAPV)
  const esSinAPV = tipoOptimo === 'sin_apv'

  const alertClass = esOptimo ? 'alert-success' : esSinAPV ? 'alert-warn' : 'alert-info'
  const AlertIcon = esOptimo ? CheckCircle : esSinAPV ? AlertCircle : Info

  const rows = [
    {
      label: 'Base imponible',
      act: actual.base,
      opt: optimizado.base,
    },
    {
      label: 'Impuesto global bruto',
      act: actual.impuestoBruto,
      opt: optimizado.impuestoBruto,
    },
    {
      label: 'APV Régimen A (crédito 15%)',
      act: actual.apvRegimen === 'A' ? actual.creditoAPV : 0,
      opt: optimizado.apvRegimen === 'A' ? optimizado.creditoAPV : 0,
    },
    {
      label: 'APV Régimen B (reducción base)',
      act: actual.apvRegimen === 'B' && tieneAPV ? Math.max(0, calcularComparativa(datos).actual.impuestoBruto - actual.impuestoBruto) : 0,
      opt: optimizado.apvRegimen === 'B' && tipoOptimo !== 'sin_apv' ? Math.max(0, actual.impuestoBruto - optimizado.impuestoBruto) : 0,
    },
    {
      label: 'Crédito hijos (Art. 55 ter)',
      act: actual.creditoHijos,
      opt: optimizado.creditoHijos,
    },
    {
      label: 'Contribuciones B. Raíces',
      act: actual.contribuciones,
      opt: optimizado.contribuciones,
    },
    {
      label: 'Crédito empresa (integración)',
      act: actual.creditoEmpresa || 0,
      opt: optimizado.creditoEmpresa || 0,
    },
    {
      label: 'Impuesto neto determinado',
      act: actual.impuestoNeto,
      opt: optimizado.impuestoNeto,
      bold: true,
    },
    {
      label: 'PPM + Retenciones pagadas',
      act: actual.creditosTotales,
      opt: optimizado.creditosTotales,
    },
    {
      label: 'Resultado (Dev. / Pago)',
      act: actual.resultado,
      opt: optimizado.resultado,
      bold: true,
      resultado: true,
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* KPIs */}
      <div className="grid-3">
        <div className="metric green">
          <div className="m-label">Ahorro con plan óptimo</div>
          <div className="m-value">{fmt(ahorro)}</div>
          <div className="m-sub">{labelOptimo}</div>
        </div>
        <div className={`metric ${optimizado.resultado >= 0 ? 'blue' : 'red'}`}>
          <div className="m-label">{optimizado.resultado >= 0 ? 'Devolución estimada' : 'Pago estimado'}</div>
          <div className="m-value">{fmt(Math.abs(optimizado.resultado))}</div>
          <div className="m-sub">Con plan optimizado</div>
        </div>
        <div className="metric">
          <div className="m-label">Tramo marginal</div>
          <div className="m-value">{fmtPct(ti.tasa * 100)}</div>
          <div className="m-sub">Con optimización</div>
        </div>
      </div>

      {/* Recomendación */}
      <div className={`alert ${alertClass}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <AlertIcon size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
        <span style={{ fontSize: '13px', lineHeight: '1.5' }}><strong>Recomendación:</strong> {recomendacion}</span>
      </div>

      {/* Tabla comparativa */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--c-border)',
          fontSize: '13px', fontWeight: '500',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span>Comparativa AT{AÑO_TRIBUTARIO}</span>
          <span style={{ fontSize: '11px', color: 'var(--c-text-3)' }}>
            Situación actual vs. {labelOptimo}
          </span>
        </div>
        <div className="scroll-x">
          <table className="data-table">
            <thead>
              <tr>
                <th>Concepto</th>
                <th style={{ textAlign: 'right' }}>
                  {tieneAPV ? `Situación actual (APV Rég. ${datos.apvRegimen})` : 'Situación actual (Sin APV)'}
                </th>
                <th style={{ textAlign: 'right', color: 'var(--c-accent)' }}>
                  Plan óptimo ({labelOptimo})
                </th>
                <th style={{ textAlign: 'right' }}>Diferencia</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const diff = r.opt - r.act
                const isBold = r.bold
                const isResultado = r.resultado

                let diffColor = 'var(--c-text-3)'
                if (isResultado) {
                  diffColor = diff > 0 ? 'var(--c-accent)' : diff < 0 ? 'var(--c-danger)' : 'var(--c-text-3)'
                } else {
                  // Para impuestos, menos es mejor (color verde si baja)
                  diffColor = diff < 0 ? 'var(--c-accent)' : diff > 0 ? 'var(--c-danger)' : 'var(--c-text-3)'
                }

                const resultadoColorAct = isResultado
                  ? r.act >= 0 ? 'var(--c-accent)' : 'var(--c-danger)'
                  : undefined
                const resultadoColorOpt = isResultado
                  ? r.opt >= 0 ? 'var(--c-accent)' : 'var(--c-danger)'
                  : 'var(--c-accent)'

                return (
                  <tr key={i} style={{ background: isBold ? 'var(--c-bg)' : undefined }}>
                    <td style={{ fontWeight: isBold ? '600' : undefined }}>{r.label}</td>
                    <td style={{ textAlign: 'right', color: resultadoColorAct, fontWeight: isBold ? '600' : undefined }}>
                      {fmt(r.act)}
                    </td>
                    <td style={{ textAlign: 'right', color: resultadoColorOpt, fontWeight: isBold ? '600' : undefined }}>
                      {fmt(r.opt)}
                    </td>
                    <td style={{ textAlign: 'right', color: diffColor, fontWeight: '500' }}>
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
        Tasa efectiva situación actual: <strong>{fmtPct(actual.tasaEfectiva)}</strong> →
        con plan óptimo: <strong>{fmtPct(optimizado.tasaEfectiva)}</strong>
      </div>

    </div>
  )
}
