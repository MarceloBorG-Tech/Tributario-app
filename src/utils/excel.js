import * as XLSX from 'xlsx'
import { calcularEscenario, tramoInfo, fmt } from './calculos'

export function exportarCarteraExcel(clientes) {
  if (!clientes.length) return

  const filas = clientes.map((c) => {
    const sin = calcularEscenario(c, false)
    const con = calcularEscenario(c, true)
    const ti = tramoInfo(con.base)
    const ahorro = sin.impuestoNeto - con.impuestoNeto
    
    return {
      'Cliente': c.nombre || 'Sin nombre',
      'RUT': c.rut || '',
      'Ingresos Anuales': c.sueldo || 0,
      'Retiros/Honorarios': (c.retiro || 0) + (c.otras || 0),
      'Intereses Hipotecarios': c.intereses || 0,
      'Base Imponible Actual': Math.round(sin.base),
      'Base Imponible con APV': Math.round(con.base),
      'Tramo Marginal %': (ti.tasa * 100) + '%',
      'Ahorro APV ($)': Math.round(con.creditoAPV),
      'Régimen': c.apvRegimen || 'B',
      'Crédito Hijos': Math.round(con.creditoHijos),
      'Contribuciones': Math.round(c.contribuciones || 0),
      'Impuesto Neto SIN PLAN': Math.round(sin.impuestoNeto),
      'Impuesto Neto CON PLAN': Math.round(con.impuestoNeto),
      'AHORRO REAL TOTAL': Math.round(ahorro),
      'PPM + Retenciones': Math.round(c.ppm + c.retenciones),
      'RESULTADO FINAL (CAJA)': Math.round(con.resultado),
      'Acción': con.resultado >= 0 ? 'Devolución' : 'Pago'
    }
  })

  const ws = XLSX.utils.json_to_sheet(filas)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Cartera de Clientes')

  // Ajustar anchos de columna automáticamente
  const wscols = Object.keys(filas[0]).map(() => ({ wch: 20 }))
  ws['!cols'] = wscols

  XLSX.writeFile(wb, `Cartera_Tributaria_Clientes.xlsx`)
}