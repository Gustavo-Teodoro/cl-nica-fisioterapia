import { useNavigate } from 'react-router-dom'

const IconAgenda = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const IconDash = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
)
const IconFinanceiro = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
)
const IconImportar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/>
    <line x1="9" y1="15" x2="15" y2="15"/>
  </svg>
)
const IconConfig = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
)

export default function Layout({ children, title }) {
  const navigate = useNavigate()
  const pagina   = window.location.pathname
  const auth     = localStorage.getItem('auth')
  const perfil   = auth ? JSON.parse(auth).perfil : ''
  const isAdmin    = perfil === 'admin'
  const isContador = perfil === 'contador'

  const logout = () => { localStorage.removeItem('auth'); navigate('/login') }

  const navItems = [
    { path: '/agenda',         label: 'Agenda',    icon: <IconAgenda />,     show: !isContador },
    { path: '/dashboard',      label: 'Dashboard', icon: <IconDash />,       show: true },
    { path: '/financeiro',     label: 'Financeiro',icon: <IconFinanceiro />, show: isAdmin || isContador },
    { path: '/importar-ficha', label: 'Importar',  icon: <IconImportar />,   show: isAdmin || !isContador },
    { path: '/configuracoes',  label: 'Config.',   icon: <IconConfig />,     show: isAdmin },
  ].filter(i => i.show)

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <header className="h-14 bg-sidebar flex items-center justify-between px-4 md:px-6 flex-shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden border border-white/20 flex-shrink-0">
            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="text-white text-xs md:text-sm font-medium leading-tight">Dra. Fernanda R. Teodoro</div>
            <div className="text-white/50 text-[10px] md:text-xs">Fisioterapia & Pilates</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/40 text-xs hidden md:block">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
          </span>
          <button onClick={logout} title="Sair"
            className="text-white/40 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-white/10">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </header>

      <main className="flex-1 p-3 md:p-5 pb-24">
        {title && (
          <h1 className="text-lg font-semibold text-text mb-4">{title}</h1>
        )}
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-sidebar border-t border-white/10 flex items-center justify-around px-2 z-50 h-16">
        {navItems.map(item => {
          const ativo = pagina === item.path
          return (
            <button key={item.path} onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl transition-all
                ${ativo ? 'text-white bg-white/10' : 'text-white/45 hover:text-white/80'}`}>
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
              <div className={`w-1 h-1 rounded-full transition-all ${ativo ? 'bg-indicator' : 'bg-transparent'}`} />
            </button>
          )
        })}
      </nav>
    </div>
  )
}
