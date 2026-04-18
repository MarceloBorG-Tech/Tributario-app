import { useState } from 'react'
import { useClientes } from '../hooks/useClientes'
import { calcularEscenario, fmt, fmtPct } from '../utils/calculos'
import { exportarCarteraExcel } from '../utils/excel'
import { generarPDF } from '../utils/pdf'
import { Download, FileText, Trash2, Search, Users, TrendingUp } from 'lucide-react'

export default function Dashboard() {
  const { clientes, eliminar, buscar } = useClientes()
  const [q, setQ] = useState('')
  const [confirmEliminar, setConfirmEliminar] = useState(null)

  const lista = buscar(q)

  // Cálculo del ahorro total de toda la cartera
  const totalAhorro = lista.reduce((acc, c) => {
    const sin = calcularEscenario(c, false)
    const con = calcularEscenario(c, true)
    return acc + (sin.impuestoNeto - con.impuestoNeto)
  }, 0)

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      
      {/* Resumen Superior */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '2rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: 'var(--c-text-3)' }}>CLIENTES EN CARTERA</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{lista.length}</div>
        </div>
        <div className="card" style={{ textAlign: 'center', borderLeft: '4px solid var(--c-accent)' }}>
          <div style={{ fontSize: '12px', color: 'var(--c-text-3)' }}>AHORRO TOTAL GESTIONADO</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--c-accent)' }}>{fmt(totalAhorro)}</div>
        </div>
      </div>

      {/* Buscador y Acciones */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', gap: '10px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-text-3)' }} />
          <input 
            placeholder="Buscar por nombre o RUT..." 
            style={{ paddingLeft: '35px', width: '100%' }}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <button onClick={() => exportarCarteraExcel(lista)}>
          <Download size={14} /> Excel
        </button>
      </div>

      {/* Tabla */}
      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead style={{ background: 'var(--c-bg-2)', textAlign: 'left' }}>
            <tr>
              <th style={{ padding: '12px' }}>Cliente</th>
              <th>Impuesto Neto</th>
              <th>Ahorro APV</th>
              <th>Resultado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lista.map(c => {
              const con = calcularEscenario(c, true)
              const sin = calcularEscenario(c, false)
              return (
                <tr key={c.rut} style={{ borderBottom: '1px solid var(--c-border)' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: '500' }}>{c.nombre}</div>
                    <div style={{ fontSize: '11px', color: 'var(--c-text-3)' }}>{c.rut}</div>
                  </td>
                  <td>{fmt(con.impuestoNeto)}</td>
                  <td style={{ color: 'var(--c-accent)', fontWeight: 'bold' }}>{fmt(sin.impuestoNeto - con.impuestoNeto)}</td>
                  <td>
                    <span className={`badge ${con.resultado >= 0 ? 'badge-green' : 'badge-red'}`}>
                      {con.resultado >= 0 ? 'Dev.' : 'Pago'} {fmt(Math.abs(con.resultado))}
                    </span>
                  </td>
                  <td>
                    <button className="btn-ghost" onClick={() => generarPDF(c)}><FileText size={14} /></button>
                    <button className="btn-ghost" onClick={() => eliminar(c.rut)} style={{ color: 'var(--c-danger)' }}><Trash2 size={14} /></button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}