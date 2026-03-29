import { useEffect } from 'react'

export default function Modal({ aberto, onFechar, titulo, subtitulo, children, rodape }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onFechar() }
    if (aberto) {
      document.addEventListener('keydown', handler)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [aberto, onFechar])

  if (!aberto) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/35 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onFechar() }}>
      <div className="bg-surface rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md flex flex-col"
        style={{ maxHeight: '80dvh' }}>

        <div className="flex items-start justify-between p-4 md:p-6 pb-3 flex-shrink-0">
          <div>
            <h2 className="text-base md:text-lg font-semibold text-text">{titulo}</h2>
            {subtitulo && <p className="text-xs md:text-sm text-text-3 mt-0.5">{subtitulo}</p>}
          </div>
          <button onClick={onFechar}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-3 hover:bg-bg hover:text-text transition-colors ml-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="px-4 md:px-6 flex flex-col gap-3 overflow-y-auto flex-1 pb-2">
          {children}
        </div>

        {rodape && (
          <div className="flex items-center justify-between px-4 md:px-6 py-4 border-t border-border bg-bg/40 flex-shrink-0 mb-16 sm:mb-0">
            {rodape}
          </div>
        )}
      </div>
    </div>
  )
}

export function Campo({ label, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  )
}