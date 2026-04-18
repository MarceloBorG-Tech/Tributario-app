import { TRAMOS, CREDITO_HIJO, APV_A_TOPE_UF, APV_A_CREDITO_PCT, UF_REF } from '../data/tramos'

export function calcularGlobal(base) {
  if (base <= 0) return 0
  for (const t of TRAMOS) {
    if (base <= t.limite) return Math.max(0, base * t.tasa - t.rebaja)
  }
  const ultimo = TRAMOS[TRAMOS.length - 1]
  return Math.max(0, base * ultimo.tasa - ultimo.rebaja)
}

export function tramoInfo(base) {
  for (let i = 0; i < TRAMOS.length; i++) {
    if (base <= TRAMOS[i].limite) return { idx: i, tasa: TRAMOS[i].tasa, rebaja: TRAMOS[i].rebaja }
  }
  const lastIdx = TRAMOS.length - 1
  return { idx: lastIdx, tasa: TRAMOS[lastIdx].tasa, rebaja: TRAMOS[lastIdx].rebaja }
}

export function calcularEscenario(datos, conAPV = false, apvOverride = null) {
  const {
    sueldo = 0, cotizaciones = 0, apv = 0, apvRegimen = 'B',
    intereses = 0, hijos = 0, arriendo = 0, dfl2 = false,
    ppm = 0, retenciones = 0, retiro = 0, otras = 0,
    creditoEmpresa = 0, contribuciones = 0
  } = datos

  const apvMonto = apvOverride ? apvOverride.monto : Number(apv)
  const apvReg   = apvOverride ? apvOverride.regimen : apvRegimen

  let base = (Number(sueldo) || 0) + (Number(retiro) || 0) + (Number(otras) || 0) - (Number(cotizaciones) || 0)
  if (!dfl2) base += (Number(arriendo) || 0)
  base -= (Number(intereses) || 0)

  if (conAPV && apvReg === 'B') {
    const topeB = 600 * UF_REF
    base -= Math.min(apvMonto, topeB)
  }
  base = Math.max(0, base)

  const impuestoBruto = calcularGlobal(base)

  let creditoAPV = 0
  if (conAPV && apvReg === 'A') {
    const topePesos = APV_A_TOPE_UF * UF_REF
    const apvEfectivo = Math.min(apvMonto, topePesos)
    creditoAPV = apvEfectivo * APV_A_CREDITO_PCT
  }

  const TOPE_INGRESO_HIJOS = 792 * UF_REF
  const creditoHijos = base <= TOPE_INGRESO_HIJOS ? (Number(hijos) || 0) * CREDITO_HIJO : 0

  const impuestoParcial = Math.max(0, impuestoBruto - creditoHijos - creditoAPV - (Number(creditoEmpresa) || 0))
  const creditoContribucionesReal = Math.min(Number(contribuciones) || 0, impuestoParcial)
  const impuestoNeto = impuestoParcial - creditoContribucionesReal

  const creditosTotales = (Number(ppm) || 0) + (Number(retenciones) || 0)
  const resultado = creditosTotales - impuestoNeto
  const tasaEfectiva = base > 0 ? (impuestoNeto / base) * 100 : 0

  return {
    base, impuestoBruto, creditoAPV, creditoHijos, creditoEmpresa,
    contribuciones: creditoContribucionesReal, impuestoNeto,
    creditosTotales, resultado, tasaEfectiva,
    apvMonto: conAPV ? apvMonto : 0,
    apvRegimen: apvReg,
  }
}

export function calcularComparativa(datos) {
  const tieneAPV = Number(datos.apv) > 0

  // Situación actual — exactamente lo que ingresó el usuario
  const actual = calcularEscenario(datos, tieneAPV)

  // Evaluar las 3 opciones posibles
  const sinAPV = calcularEscenario(datos, false)
  const conA = tieneAPV
    ? calcularEscenario(datos, true, { monto: Number(datos.apv), regimen: 'A' })
    : sinAPV
  const conB = tieneAPV
    ? calcularEscenario(datos, true, { monto: Number(datos.apv), regimen: 'B' })
    : sinAPV

  const opciones = [
    { escenario: sinAPV, tipo: 'sin_apv', label: 'Sin APV' },
    { escenario: conA,   tipo: 'apv_a',   label: 'APV Régimen A' },
    { escenario: conB,   tipo: 'apv_b',   label: 'APV Régimen B' },
  ]

  // Elegir la de menor impuesto neto
  opciones.sort((a, b) => a.escenario.impuestoNeto - b.escenario.impuestoNeto)
  const mejor = opciones[0]

  let recomendacion = ''
  if (mejor.tipo === 'sin_apv') {
    recomendacion = tieneAPV
      ? 'El APV que pagas no genera ahorro tributario en tu situación. Recomendamos no aportar APV este año y destinar esos fondos a otro instrumento.'
      : 'No necesitas APV — tu impuesto ya es mínimo con los beneficios actuales.'
  } else if (mejor.tipo === 'apv_a') {
    if (tieneAPV && datos.apvRegimen === 'A') {
      recomendacion = 'Tu elección de APV Régimen A es óptima. Mantén el plan actual.'
    } else {
      recomendacion = 'Recomendamos cambiar a APV Régimen A — el crédito fiscal del 15% es más conveniente para tu tramo.'
    }
  } else {
    if (tieneAPV && datos.apvRegimen === 'B') {
      recomendacion = 'Tu elección de APV Régimen B es óptima. Mantén el plan actual.'
    } else {
      recomendacion = 'Recomendamos cambiar a APV Régimen B — reducir tu base imponible genera mayor ahorro.'
    }
  }

  const ahorro = Math.max(0, actual.impuestoNeto - mejor.escenario.impuestoNeto)

  return {
    actual,
    optimizado: mejor.escenario,
    tipoOptimo: mejor.tipo,
    labelOptimo: mejor.label,
    recomendacion,
    ahorro,
    tieneAPV,
  }
}

export function optimizarAPV(datos) {
  const sin = calcularEscenario(datos, false)
  if (sin.impuestoNeto <= 0) return { posible: false, mensaje: 'Tu impuesto neto actual es $0, no hay margen para optimizar.' }

  const ti = tramoInfo(sin.base)
  const topeMaximoAPV = 600 * UF_REF
  const resultados = []

  const tramoObjetivo = TRAMOS[ti.idx - 1] || TRAMOS[0]
  const gap = Math.max(0, sin.base - tramoObjetivo.limite)
  const apvNecesarioB = Math.min(Math.ceil(gap + 1), topeMaximoAPV)

  if (apvNecesarioB > 0) {
    const conB = calcularEscenario({ ...datos, apv: apvNecesarioB, apvRegimen: 'B' }, true)
    const ahorroB = Math.max(0, sin.impuestoNeto - conB.impuestoNeto)
    if (ahorroB > 0) {
      resultados.push({
        label: `Régimen B — Bajar al tramo ${(tramoObjetivo.tasa * 100).toFixed(1)}%`,
        apvNecesario: apvNecesarioB,
        ahorro: ahorroB,
        roi: (ahorroB / apvNecesarioB) * 100,
      })
    }
  }

  const apvNecesarioA = Math.min(Math.ceil(sin.impuestoNeto / APV_A_CREDITO_PCT), topeMaximoAPV)
  const conA = calcularEscenario({ ...datos, apv: apvNecesarioA, apvRegimen: 'A' }, true)
  const ahorroA = Math.max(0, sin.impuestoNeto - conA.impuestoNeto)

  if (ahorroA > 0) {
    resultados.push({
      label: `Régimen A — Bonificación fiscal del 15%`,
      apvNecesario: apvNecesarioA,
      ahorro: ahorroA,
      roi: 15,
    })
  }

  resultados.sort((a, b) => b.ahorro - a.ahorro)

  return {
    posible: resultados.length > 0,
    resultados,
    sinPlan: sin,
    tramoActual: ti,
  }
}

export const fmt = n => '$' + Math.round(n || 0).toLocaleString('es-CL')
export const fmtPct = n => (n || 0).toFixed(1) + '%'
