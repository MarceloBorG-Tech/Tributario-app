import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { calcularEscenario, fmt, fmtPct, tramoInfo } from './calculos'
import { AÑO_TRIBUTARIO } from '../data/tramos'

export function generarPDF(datos) {
  const sin = calcularEscenario(datos, false)
  const con = calcularEscenario(datos, true)
  const ahorro = sin.impuestoNeto - con.impuestoNeto
  const ti = tramoInfo(con.base)
  const nombre = datos.nombre || 'Cliente'
  const rut = datos.rut || '—'
  const hoy = new Date().toLocaleDateString('es-CL')

  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = 210

  // FONDO OSCURO EN CABECERA
  doc.setFillColor(15, 23, 42) // Slate-900
  doc.rect(0, 0, W, 45, 'F')
  
  // LOGO Y TITULO
  doc.setTextColor(34, 197, 94) // Green-500
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('TRIBUTARIOCL', 15, 20)
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`INFORME DE ESTRATEGIA TRIBUTARIA — PROYECCIÓN AT${AÑO_TRIBUTARIO}`, 15, 28)

  // CUADRO INFO CLIENTE
  doc.setFillColor(30, 41, 59) // Slate-800
  doc.roundedRect(15, 55, 180, 25, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.text('CLIENTE:', 20, 62)
  doc.text('RUT:', 20, 68)
  doc.text('FECHA:', 20, 74)
  
  doc.setFont('helvetica', 'bold')
  doc.text(nombre.toUpperCase(), 45, 62)
  doc.text(rut, 45, 68)
  doc.text(hoy, 45, 74)

  // RESUMEN DE IMPACTO (KPIs)
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(11)
  doc.text('RESUMEN DE OPTIMIZACIÓN', 15, 95)
  
  // Caja de Ahorro
  doc.setFillColor(34, 197, 94)
  doc.roundedRect(15, 100, 85, 20, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.text('AHORRO ESTIMADO TOTAL', 20, 106)
  doc.setFontSize(14)
  doc.text(fmt(ahorro), 20, 114)

  // Caja de Resultado
  doc.setFillColor(15, 23, 42)
  doc.roundedRect(110, 100, 85, 20, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.text(con.resultado >= 0 ? 'DEVOLUCIÓN ESTIMADA' : 'PAGO ESTIMADO', 115, 106)
  doc.setFontSize(14)
  doc.text(fmt(Math.abs(con.resultado)), 115, 114)

  // TABLA COMPARATIVA
  doc.autoTable({
    startY: 130,
    head: [['DETALLE TRIBUTARIO', 'SITUACIÓN ACTUAL', 'PLAN OPTIMIZADO', 'DIFERENCIA']],
    body: [
      ['Base Imponible', fmt(sin.base), fmt(con.base), fmt(con.base - sin.base)],
      ['Impuesto Global Complementario', fmt(sin.impuestoBruto), fmt(con.impuestoBruto), '—'],
      [`Ahorro APV (Régimen ${datos.apvRegimen || 'B'})`, '$ 0', fmt(con.creditoAPV), fmt(con.creditoAPV)],
      ['Créditos (Hijos/Contribuciones)', fmt(sin.creditoHijos + sin.contribuciones), fmt(con.creditoHijos + con.contribuciones), '—'],
      ['Impuesto Neto Determinado', fmt(sin.impuestoNeto), fmt(con.impuestoNeto), fmt(ahorro)],
      ['Pagos Provisionales / Retenciones', fmt(sin.creditosTotales), fmt(con.creditosTotales), '0'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right', fontStyle: 'bold', textColor: [34, 197, 94] }
    }
  })

  // NOTAS TÉCNICAS
  const finalY = doc.lastAutoTable.finalY + 15
  doc.setTextColor(100, 116, 139)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'italic')
  doc.text(`Análisis basado en tramo marginal del ${fmtPct(ti.tasa * 100)}.`, 15, finalY)
  doc.text('Este documento es una proyección profesional y no sustituye la declaración oficial ante el SII.', 15, finalY + 5)

  doc.save(`Simulacion_Tributaria_${nombre.replace(/\s+/g, '_')}.pdf`)
}