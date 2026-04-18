import { useState, useEffect } from 'react'
import { Download, X, Smartphone } from 'lucide-react'

export default function InstallPWA() {
  const [prompt, setPrompt] = useState(null)
  const [visible, setVisible] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Detectar si ya está instalada
    if (window.matchMedia('(display-mode: standalone)').matches) return
    if (localStorage.getItem('pwa_dismissed')) return

    // iOS — no tiene beforeinstallprompt, mostrar instrucción manual
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream
    if (ios) {
      setIsIOS(true)
      setVisible(true)
      return
    }

    // Android / Chrome / Edge — capturar evento nativo
    const handler = (e) => {
      e.preventDefault()
      setPrompt(e)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setVisible(false)
    setPrompt(null)
  }

  const handleDismiss = () => {
    setVisible(false)
    setDismissed(true)
    localStorage.setItem('pwa_dismissed', '1')
  }

  if (!visible || dismissed) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: '1rem',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 2rem)',
      maxWidth: '480px',
      background: 'var(--c-surface)',
      border: '1px solid var(--c-border)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      padding: '1rem 1.25rem',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
    }}>
      <div style={{
        width: '40px', height: '40px', borderRadius: '10px',
        background: 'var(--c-accent-light)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Smartphone size={20} style={{ color: 'var(--c-accent)' }} />
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '3px' }}>
          Instalar TributarioCL
        </div>
        {isIOS ? (
          <div style={{ fontSize: '12px', color: 'var(--c-text-2)', lineHeight: 1.5 }}>
            Toca <strong>Compartir</strong> <span style={{ fontSize: '14px' }}>⎙</span> y luego{' '}
            <strong>"Agregar a pantalla de inicio"</strong> para instalar la app.
          </div>
        ) : (
          <div style={{ fontSize: '12px', color: 'var(--c-text-2)' }}>
            Instala la app en tu dispositivo para acceso offline y desde el inicio.
          </div>
        )}

        {!isIOS && (
          <button
            className="btn-primary"
            onClick={handleInstall}
            style={{ marginTop: '10px', fontSize: '13px', padding: '6px 16px' }}
          >
            <Download size={13} />
            Instalar app
          </button>
        )}
      </div>

      <button
        className="btn-ghost"
        onClick={handleDismiss}
        style={{ padding: '4px', flexShrink: 0 }}
        title="Cerrar"
      >
        <X size={16} />
      </button>
    </div>
  )
}
