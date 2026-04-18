import { useState } from 'react'
import ClienteForm from '../components/ClienteForm'
import ResultadoPanel from '../components/ResultadoPanel'
import OptimizadorAPV from '../components/OptimizadorAPV'
import { useClientes } from '../hooks/useClientes'
import { generarPDF } from '../utils/pdf'
import { validarRut } from '../utils/rut'
import { Save, FileText, Zap, BarChart2 } from 'lucide-react'

const DATOS_INIT = {
  nombre: '', rut: '', sueldo: 0, cotizaciones: 0,
  apv: 0, apvRegimen: 'B', intereses: 0, hijos: 0, arriendo: 0,
  dfl2: false, ppm: 0, retenciones: 0, retiro: 0, otras: 0, creditoEmpresa: 0, contribuciones: 0
}

const TABS = [
  { id: 'datos',       label: 'Datos',       Icon: FileText },
  { id: 'resultado',   label: 'Resultado',   Icon: BarChart2 },
  { id: 'optimizador', label: 'Optimizador', Icon: Zap },
]

export default function Simulador() {
  const [datos, setDatos] = useState(DATOS_INIT)
  const [tab, setTab] = useState('datos')
  const [alerta, setAlerta] = useState(null)
  const { guardar, clientes } = useClientes()

  const mostrarAlerta = (tipo, msg) => {
    setAlerta({ tipo, msg })
    setTimeout(() => setAlerta(null), 3500)
  }

  const handleGuardar = () => {
    if (!datos.nombre) { mostrarAlerta('warn', 'Ingresa el nombre del cliente.'); return }
    if (datos.rut && !validarRut(datos.rut)) { mostrarAlerta('danger', 'RUT inválido.'); return }
    const accion = guardar(datos)
    mostrarAlerta('success', `Cliente ${accion === 'actualizado' ? 'actualizado' : 'guardado'} correctamente.`)
  }

  const handlePDF = () => {
    if (!datos.nombre) { mostrarAlerta('warn', 'Ingresa el nombre del cliente para el PDF.'); return }
    generarPDF(datos)
  }

  const cargarCliente = (c) => {
    setDatos(c)
    setTab('datos')
  }

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '1.5rem 1rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '26px', marginBottom: '4px' }}>Simulador Tributario</h1>
        <p style={{ fontSize: '13px', color: 'var(--c-text-3)' }}>Global Complementario — AT2025</p>
      </div>

      {/* Carga rápida de cliente guardado */}
      {clientes.length > 0 && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div className="section-label" style={{ marginBottom: '8px' }}>Cargar cliente guardado</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {clientes.map((c, i) => (
              <button key={i} onClick={() => cargarCliente(c)} style={{ fontSize: '12px', padding: '4px 12px' }}>
                {c.nombre}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--c-border)', marginBottom: '1.5rem' }}>
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: tab === id ? '2px solid var(--c-accent)' : '2px solid transparent',
              borderRadius: '0',
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: tab === id ? '500' : '400',
              color: tab === id ? 'var(--c-accent)' : 'var(--c-text-2)',
              display: 'flex', alignItems: 'center', gap: '6px',
              cursor: 'pointer',
            }}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Contenido tabs */}
      {tab === 'datos' && (
        <div>
          <ClienteForm datos={datos} onChange={setDatos} />
          <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={handleGuardar}><Save size={14} />Guardar cliente</button>
            <button onClick={handlePDF}><FileText size={14} />Exportar PDF</button>
            <button onClick={() => setTab('resultado')} style={{ marginLeft: 'auto' }}>
              Ver resultado →
            </button>
          </div>
          {alerta && (
            <div className={`alert alert-${alerta.tipo}`} style={{ marginTop: '12px' }}>
              {alerta.msg}
            </div>
          )}
        </div>
      )}

      {tab === 'resultado' && (
        <div>
          <ResultadoPanel datos={datos} />
          <div style={{ marginTop: '1rem', display: 'flex', gap: '10px' }}>
            <button onClick={handlePDF}><FileText size={14} />Exportar PDF</button>
            <button onClick={() => setTab('optimizador')}><Zap size={14} />Ver optimizador</button>
          </div>
        </div>
      )}

      {tab === 'optimizador' && (
        <div>
          <p style={{ fontSize: '13px', color: 'var(--c-text-2)', marginBottom: '1rem' }}>
            Calcula automáticamente el monto de APV óptimo para reducir tu carga tributaria.
          </p>
          <OptimizadorAPV datos={datos} />
        </div>
      )}
    </div>
  )
}
