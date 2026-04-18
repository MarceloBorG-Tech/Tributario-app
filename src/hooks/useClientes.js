import { useState, useEffect } from 'react'

const KEY = 'tributariocl_clientes_v2'

export function useClientes() {
  const [clientes, setClientes] = useState([])

  useEffect(() => {
    try {
      const data = localStorage.getItem(KEY)
      if (data) setClientes(JSON.parse(data))
    } catch { /* ignore */ }
  }, [])

  const persistir = (lista) => {
    setClientes(lista)
    localStorage.setItem(KEY, JSON.stringify(lista))
  }

  const guardar = (datos) => {
    const nuevo = { ...datos, updatedAt: new Date().toISOString() }
    const idx = clientes.findIndex(c => c.rut && c.rut === datos.rut)
    let lista
    if (idx >= 0) {
      lista = clientes.map((c, i) => i === idx ? nuevo : c)
    } else {
      lista = [...clientes, { ...nuevo, createdAt: new Date().toISOString() }]
    }
    persistir(lista)
    return idx >= 0 ? 'actualizado' : 'creado'
  }

  const eliminar = (rut) => {
    persistir(clientes.filter(c => c.rut !== rut))
  }

  const buscar = (q) => {
    if (!q) return clientes
    const qL = q.toLowerCase()
    return clientes.filter(c =>
      (c.nombre || '').toLowerCase().includes(qL) ||
      (c.rut || '').includes(q)
    )
  }

  return { clientes, guardar, eliminar, buscar }
}
