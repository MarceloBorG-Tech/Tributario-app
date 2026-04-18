export function validarRut(rut) {
  if (!rut) return true // opcional
  const r = rut.replace(/\./g, '').replace(/-/g, '')
  if (r.length < 8) return false
  const cuerpo = r.slice(0, -1)
  const dv = r.slice(-1).toUpperCase()
  let suma = 0, mul = 2
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i]) * mul
    mul = mul === 7 ? 2 : mul + 1
  }
  const res = 11 - (suma % 11)
  const dvCalc = res === 11 ? '0' : res === 10 ? 'K' : String(res)
  return dv === dvCalc
}

export function formatearRut(valor) {
  let v = valor.replace(/[^0-9kK]/g, '')
  if (v.length < 2) return v
  const dv = v.slice(-1)
  let cuerpo = v.slice(0, -1)
  cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return cuerpo + '-' + dv
}
