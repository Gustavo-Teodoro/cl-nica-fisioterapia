import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/api'

export default function Login() {
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha]     = useState('')
  const [erro, setErro]       = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      const data = await login(usuario, senha)
      if (data.success) {
        localStorage.setItem('auth', JSON.stringify({ usuario: data.usuario, nome: data.nome, perfil: data.perfil }))
        navigate('/pacientes') // ✅ CORRIGIDO: era '/dashboard' (rota inexistente)
      }
    } catch (err) {
      setErro(err.message || 'Usuário ou senha incorretos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center mb-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2"/>
            </svg>
          </div>
          <h1 className="font-serif text-2xl text-text">Clínica</h1>
          <p className="text-text-3 text-sm mt-0.5">Fisioterapia & Pilates</p>
        </div>

        {/* Card */}
        <div className="card">
          <h2 className="text-base font-semibold text-text mb-1">Acesse sua conta</h2>
          <p className="text-sm text-text-3 mb-5">Digite suas credenciais para entrar</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="label">Usuário</label>
              <input
                className="input"
                type="text"
                placeholder="admin"
                value={usuario}
                onChange={e => setUsuario(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <label className="label">Senha</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={e => setSenha(e.target.value)}
              />
            </div>

            {erro && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
                {erro}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary justify-center py-2.5 mt-1">
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
