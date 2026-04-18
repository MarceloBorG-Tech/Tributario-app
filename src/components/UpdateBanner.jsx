import { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'

export default function UpdateBanner() {
  const [needRefresh, setNeedRefresh] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    const handleUpdate = (reg) => {
      if (reg.waiting) {
        setNeedRefresh(true)
      }
    }

    navigator.serviceWorker.getRegistration().then(reg => {
      if (!reg) return
      handleUpdate(reg)
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing
        if (!newWorker) return
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setNeedRefresh(true)
          }
        })
      })
    })
  }, [])

  const handleUpdate = () => {
    navigator.serviceWorker.getRegistration().then(reg => {
      if (reg?.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' })
      }
      window.location.reload()
    })
  }

  if (!needRefresh) return null

  return (
    <div style={{
      position: 'fixed',
      top: '60px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'var(--c-blue-light)',
      border: '1px solid var(--c-blue)',
      borderRadius: 'var(--radius-lg)',
      padding: '10px 16px',
      zIndex: 9998,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '13px',
      color: 'var(--c-blue)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      whiteSpace: 'nowrap',
    }}>
      <RefreshCw size={14} />
      <span>Nueva versión disponible</span>
      <button
        onClick={handleUpdate}
        style={{
          fontSize: '12px',
          padding: '4px 12px',
          background: 'var(--c-blue)',
          color: 'white',
          border: 'none',
          borderRadius: 'var(--radius)',
          cursor: 'pointer',
        }}
      >
        Actualizar
      </button>
    </div>
  )
}
