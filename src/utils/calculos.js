import { TRAMOS, CREDITO_HIJO, APV_A_TOPE_UF, APV_A_CREDITO_PCT, UF_REF } from '../data/tramos'

/**
 * Calcula el impuesto Global Complementario según la tabla de tramos
 */
export function calcularGlobal(base) {
  if (base <= 0) return 0
  for (const t of TRAMOS) {
    if (base <= t.limite) return Math.max(0, base * t.tasa - t.rebaja)
  }
  const ultimo = TRAMOS[TRAMOS.length - 1]
  return Math.max(0, base * ultimo.tasa - ultimo.rebaja)
}

/**
 * Retorna la información del tramo actual según la base imponible
 */
export function tramoInfo(base) {
  for (let i = 0; i < TRAMOS.length; i++) {
    if (base <= TRAMOS[i].limite) return { idx: i, tasa: TRAMOS[i].tasa, rebaja: TRAMOS[i].rebaja }
  }
  const lastIdx = TRAMOS.length - 1
  return { idx: lastIdx, tasa: TRAMOS[lastIdx].tasa, rebaja: TRAMOS[lastIdx].rebaja }
}

/**
 * Realiza el cálculo completo de un escenario tributario
 */
export function calcularEscenario(datos, conAPV = false) {
  // Aseguramos valores por defecto para evitar errores de undefined
  const {
    sueldo = 0, cotizaciones = 0, apv = 0, apvRegimen = 'B',
    intereses = 0, hijos = 0, arriendo = 0, dfl2 = false,
    ppm = 0, retenciones = 0, retiro = 0, otras = 0,
    creditoEmpresa = 0, contribuciones = 0
  } = datos

  // 1. Calcular Base Imponible
  let base = (Number(sueldo) || 0) + (Number(retiro) || 0) + (Number(otras) || 0) - (Number(cotizaciones) || 0)
  
  if (!dfl2) base += (Number(arriendo) || 0)
  base -= (Number(intereses) || 0)
  
  // Deducción APV Régimen B (Directo a la base)
  if (conAPV && apvRegimen === 'B') {
    const topeB = 600 * UF_REF
    base -= Math.min(Number(apv), topeB)
  }
  
  base = Math.max(0, base)

  // 2. Impuesto Bruto
  const impuestoBruto = calcularGlobal(base)

  // 3. Créditos (Descuentos al impuesto)
  
  // Crédito APV Régimen A (15% del ahorro)
  let creditoAPV = 0
  if (conAPV && apvRegimen === 'A') {
    const topePesos = APV_A_TOPE_UF * UF_REF
    const apvEfectivo = Math.min(Number(apv), topePesos)
    creditoAPV = apvEfectivo * APV_A_CREDITO_PCT
  }

  // Crédito por Hijos (Art. 55 bis) — sin tope de ingreso en Global Complementario
  const creditoHijos = (Number(hijos) || 0) * CREDITO_HIJO

  // 4. Cálculo de Impuesto Neto (donde entran las contribuciones)
  // Primero restamos créditos por hijos, APV A y crédito empresa
  const impuestoParcial = Math.max(0, impuestoBruto - creditoHijos - creditoAPV - (Number(creditoEmpresa) || 0))
  
  // Las contribuciones de bienes raíces se descuentan del impuesto, pero no pueden dar excedente
  const creditoContribucionesReal = Math.min(Number(contribuciones) || 0, impuestoParcial)
  
  const impuestoNeto = impuestoParcial - creditoContribucionesReal

  // 5. Resultado Final (Comparación con pagos ya realizados)
  const creditosTotales = (Number(ppm) || 0) + (Number(retenciones) || 0)
  const resultado = creditosTotales - impuestoNeto
  
  const tasaEfectiva = base > 0 ? (impuestoNeto / base) * 100 : 0

  return { 
    base, 
    impuestoBruto, 
    creditoAPV, 
    creditoHijos, 
    creditoEmpresa, 
    contribuciones: creditoContribucionesReal, 
    impuestoNeto, 
    creditosTotales, 
    resultado, 
    tasaEfectiva 
  }
}

/**
 * Sugiere el monto de APV ideal para maximizar el ahorro
 */
export function optimizarAPV(datos) {
  const sin = calcularEscenario(datos, false)
  if (sin.impuestoNeto <= 0) return { posible: false, mensaje: 'Tu impuesto neto actual es $0, no hay margen para optimizar.' }

  const ti = tramoInfo(sin.base)
  const topeMaximoAPV = 600 * UF_REF
  const resultados = []

  // Estrategia 1: Bajar de tramo (Régimen B)
  const tramoObjetivo = TRAMOS[ti.idx - 1] || TRAMOS[0]
  const gap = Math.max(0, sin.base - tramoObjetivo.limite)
  const apvNecesarioB = Math.min(Math.ceil(gap + 1), topeMaximoAPV)
  
  if (apvNecesarioB > 0) {
    const conB = calcularEscenario({ ...datos, apv: apvNecesarioB, apvRegimen: 'B' }, true)
    const ahorroB = Math.max(0, sin.impuestoNeto - conB.impuestoNeto)
    if (ahorroB > 0) {
      resultados.push({
        label: `Regimen B (Bajar al tramo ${(tramoObjetivo.tasa * 100).toFixed(1)}%)`,
        apvNecesario: apvNecesarioB,
        ahorro: ahorroB,
        roi: (ahorroB / apvNecesarioB) * 100
      })
    }
  }

  // Estrategia 2: Crédito Fiscal (Régimen A)
  // El régimen A conviene cuando el ahorro por crédito (15%) es mayor que el ahorro por tasa
  const apvNecesarioA = Math.min(Math.ceil(sin.impuestoNeto / APV_A_CREDITO_PCT), topeMaximoAPV)
  const conA = calcularEscenario({ ...datos, apv: apvNecesarioA, apvRegimen: 'A' }, true)
  const ahorroA = Math.max(0, sin.impuestoNeto - conA.impuestoNeto)
  
  if (ahorroA > 0) {
    resultados.push({
      label: `Regimen A (Bonificación del 15%)`,
      apvNecesario: apvNecesarioA,
      ahorro: ahorroA,
      roi: 15
    })
  }

  // Ordenar por mayor ahorro
  resultados.sort((a, b) => b.ahorro - a.ahorro)

  return { 
    posible: resultados.length > 0, 
    resultados, 
    sinPlan: sin, 
    tramoActual: ti 
  }
}

// Formateadores de utilidad
export const fmt = n => '$' + Math.round(n || 0).toLocaleString('es-CL')
export const fmtPct = n => (n || 0).toFixed(1) + '%'