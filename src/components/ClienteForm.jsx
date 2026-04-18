import React from 'react'
import { User, CreditCard, Wallet, Users, Home, TrendingDown } from 'lucide-react'
import { fmt } from '../utils/calculos'
import { formatearRut, validarRut } from '../utils/rut'

const Field = ({ label, children }) => (
  <div className="field">
    <label>{label}</label>
    {children}
  </div>
)

const MoneyInput = ({ label, name, value, onChange }) => {
  const handleChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '')
    onChange(prev => ({ ...prev, [name]: raw ? parseInt(raw, 10) : 0 }))
  }
  return (
    <Field label={label}>
      <input
        type="text"
        value={value > 0 ? value.toLocaleString('es-CL') : ''}
        onChange={handleChange}
        placeholder="0"
      />
    </Field>
  )
}

export default function ClienteForm({ datos, onChange }) {
  const set = (key, val) => onChange(prev => ({ ...prev, [key]: val }))

  const handleRut = (e) => {
    const formateado = formatearRut(e.target.value)
    set('rut', formateado)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Datos personales */}
      <div className="card">
        <div className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <User size={14} /> Datos del Cliente
        </div>
        <div className="grid-2">
          <Field label="Nombre completo">
            <input
              type="text"
              value={datos.nombre}
              onChange={e => set('nombre', e.target.value)}
              placeholder="Ej: Marcelo Borgeaud"
            />
          </Field>
          <Field label="RUT">
            <input
              type="text"
              value={datos.rut}
              onChange={handleRut}
              placeholder="12.345.678-9"
              style={{ borderColor: datos.rut && !validarRut(datos.rut) ? 'var(--c-danger)' : undefined }}
            />
          </Field>
        </div>
      </div>

      {/* Ingresos */}
      <div className="card">
        <div className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Wallet size={14} /> Ingresos Anuales
        </div>
        <div className="grid-2">
          <MoneyInput label="Sueldo / Remuneraciones" name="sueldo" value={datos.sueldo} onChange={onChange} />
          <MoneyInput label="Retiros / Honorarios" name="retiro" value={datos.retiro} onChange={onChange} />
          <MoneyInput label="Cotizaciones previsionales" name="cotizaciones" value={datos.cotizaciones} onChange={onChange} />
          <MoneyInput label="Otras rentas" name="otras" value={datos.otras} onChange={onChange} />
        </div>
      </div>

      {/* APV */}
      <div className="card">
        <div className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <TrendingDown size={14} /> APV
        </div>
        <div className="grid-2">
          <MoneyInput label="Monto APV anual" name="apv" value={datos.apv} onChange={onChange} />
          <Field label="Régimen APV">
            <select value={datos.apvRegimen} onChange={e => set('apvRegimen', e.target.value)}>
              <option value="B">Régimen B — Descuento base imponible</option>
              <option value="A">Régimen A — Crédito fiscal 15%</option>
            </select>
          </Field>
        </div>
      </div>

      {/* Créditos y deducciones */}
      <div className="card">
        <div className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Home size={14} /> Créditos y Deducciones
        </div>
        <div className="grid-2">
          <MoneyInput label="Intereses hipotecarios" name="intereses" value={datos.intereses} onChange={onChange} />
          <MoneyInput label="Contribuciones B. Raíces" name="contribuciones" value={datos.contribuciones} onChange={onChange} />
          <MoneyInput label="Crédito empresa (integración)" name="creditoEmpresa" value={datos.creditoEmpresa} onChange={onChange} />
          <Field label="Número de hijos con carga">
            <input
              type="number"
              min={0}
              max={20}
              value={datos.hijos}
              onChange={e => set('hijos', parseInt(e.target.value) || 0)}
            />
          </Field>
        </div>
        <div style={{ marginTop: '12px' }}>
          <div className="toggle-row">
            <label className="toggle">
              <input type="checkbox" checked={datos.dfl2} onChange={e => set('dfl2', e.target.checked)} />
              <span className="toggle-sw" />
            </label>
            <label>Propiedad DFL-2 (exenta de impuesto por arriendos)</label>
          </div>
        </div>
        {datos.dfl2 && (
          <div style={{ marginTop: '8px' }}>
            <MoneyInput label="Arriendo anual recibido" name="arriendo" value={datos.arriendo} onChange={onChange} />
          </div>
        )}
      </div>

      {/* Pagos provisionales */}
      <div className="card">
        <div className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CreditCard size={14} /> Pagos y Retenciones
        </div>
        <div className="grid-2">
          <MoneyInput label="PPM pagados en el año" name="ppm" value={datos.ppm} onChange={onChange} />
          <MoneyInput label="Retenciones de honorarios" name="retenciones" value={datos.retenciones} onChange={onChange} />
        </div>
      </div>

    </div>
  )
}
