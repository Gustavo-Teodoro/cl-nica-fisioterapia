import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { getUsuarios, criarUsuario, editarUsuario, excluirUsuario } from '../services/api'

const PERFIS = [
  { value: 'admin',    label: 'Administrador', desc: 'Acesso total ao sistema' },
  { value: 'clinica',  label: 'Clínica',       desc: 'Agenda e pacientes' },
  { value: 'contador', label: 'Contador',       desc: 'Somente financeiro' },
]

const VAZIO = { usuario: '', senha: '', nome: '', perfil: 'clinica', ativo: true }

export default function Configuracoes() {
  const authStr   = localStorage.getItem('auth')
  const authAtual = authStr ? JSON.parse(authStr) : {}

  const [usuarios,    setUsuarios]    = useState([])
  const [modal,       setModal]       = useState(false)
  const [form,        setForm]        = useState(VAZIO)
  const [editId,      setEditId]      = useState(null)
  const [salvando,    setSalvando]    = useState(false)
  const [erro,        setErro]        = useState('')
  const [modalSenha,  setModalSenha]  = useState(false)
  const [novaSenha,   setNovaSenha]   = useState('')
  const [senhaId,     setSenhaId]     = useState(null)

  const carregar = async () => {
    try { setUsuarios(await getUsuarios()) } catch(e) {}
  }
  useEffect(() => { carregar() }, [])

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const abrirNovo = () => {
    setForm(VAZIO); setEditId(null); setErro(''); setModal(true)
  }

  const abrirEditar = (u) => {
    setForm({ usuario: u.usuario, senha: '', nome: u.nome, perfil: u.perfil, ativo: u.ativo })
    setEditId(u.id); setErro(''); setModal(true)
  }

  const salvar = async () => {
    if (!form.usuario || !form.nome) { setErro('Usuário e nome são obrigatórios.'); return }
    if (!editId && !form.senha)      { setErro('Informe uma senha.'); return }
    setSalvando(true); setErro('')
    try {
      const payload = { ...form }
      if (editId && !payload.senha) delete payload.senha
      if (editId) await editarUsuario(editId, payload)
      else        await criarUsuario(payload)
      await carregar(); setModal(false)
    } catch(e) { setErro(e.message || 'Erro ao salvar.') }
    finally { setSalvando(false) }
  }

  const excluir = async (u) => {
    if (!confirm(`Excluir o usuário "${u.usuario}"?`)) return
    try { await excluirUsuario(u.id); await carregar() }
    catch(e) { alert(e.message) }
  }

  const salvarSenha = async () => {
    if (!novaSenha || novaSenha.length < 3) { alert('Senha deve ter pelo menos 3 caracteres.'); return }
    try {
      await editarUsuario(senhaId, { senha: novaSenha })
      setModalSenha(false); setNovaSenha('')
      alert('Senha alterada com sucesso!')
    } catch(e) { alert(e.message) }
  }

  const badgePerfil = (perfil) => {
    if (perfil === 'admin')    return 'tag tag-green'
    if (perfil === 'contador') return 'tag tag-amber'
    return 'tag tag-blue'
  }
  const labelPerfil = (perfil) => PERFIS.find(p => p.value === perfil)?.label || perfil

  return (
    <Layout title="Configurações">
      <div className="max-w-2xl mx-auto w-full">

        {/* ── USUÁRIOS ── */}
        <div className="card mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <div>
              <h2 className="font-semibold text-text">Usuários do sistema</h2>
              <p className="text-xs text-text-3 mt-0.5">Gerencie quem tem acesso ao sistema</p>
            </div>
            <button className="btn-primary btn-sm" onClick={abrirNovo}>+ Novo usuário</button>
          </div>

          <div className="flex flex-col gap-2">
            {usuarios.map(u => (
              <div key={u.id} className="flex flex-wrap items-center gap-3 px-4 py-3 border border-border rounded-xl bg-bg">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-accent-light flex items-center justify-center text-accent font-bold text-sm flex-shrink-0">
                  {u.nome.charAt(0).toUpperCase()}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text">{u.nome}</span>
                    <span className={badgePerfil(u.perfil)}>{labelPerfil(u.perfil)}</span>
                    {!u.ativo && <span className="tag tag-red">Inativo</span>}
                    {u.usuario === authAtual.usuario && (
                      <span className="text-[10px] text-text-3 font-medium">(você)</span>
                    )}
                  </div>
                  <div className="text-xs text-text-3 mt-0.5">@{u.usuario}</div>
                </div>
                {/* Ações */}
                <div className="flex flex-wrap gap-2 ml-auto">
                  <button
                    className="btn-outline btn-sm"
                    onClick={() => { setSenhaId(u.id); setNovaSenha(''); setModalSenha(true) }}
                  >
                    🔑 Senha
                  </button>
                  <button className="btn-outline btn-sm" onClick={() => abrirEditar(u)}>Editar</button>
                  {u.usuario !== authAtual.usuario && (
                    <button className="btn-danger btn-sm" onClick={() => excluir(u)}>Excluir</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── LEGENDA PERFIS ── */}
        <div className="card">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-text-3 mb-3">Permissões por perfil</h3>
          <div className="flex flex-col gap-3">
            {[
              { perfil: 'admin',    cor: 'tag-green', itens: ['Agenda e pacientes', 'Financeiro', 'Gerenciar usuários'] },
              { perfil: 'clinica',  cor: 'tag-blue',  itens: ['Agenda e pacientes'] },
              { perfil: 'contador', cor: 'tag-amber',  itens: ['Somente financeiro'] },
            ].map(({ perfil, cor, itens }) => (
              <div key={perfil} className="flex items-start gap-3">
                <span className={`tag ${cor} flex-shrink-0 mt-0.5`}>{labelPerfil(perfil)}</span>
                <span className="text-sm text-text-2">{itens.join(' · ')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MODAL NOVO/EDITAR USUÁRIO ── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setModal(false) }}>
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-sm mx-4">
            <div className="flex items-start justify-between p-6 pb-4">
              <div>
                <h2 className="text-lg font-semibold text-text">{editId ? 'Editar usuário' : 'Novo usuário'}</h2>
                <p className="text-sm text-text-3 mt-0.5">Preencha os dados de acesso</p>
              </div>
              <button onClick={() => setModal(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-text-3 hover:bg-bg">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="px-6 pb-4 flex flex-col gap-3">
              <div>
                <label className="label">Nome completo</label>
                <input className="input" value={form.nome} onChange={e => f('nome', e.target.value)} placeholder="Ex: Dra. Fernanda" />
              </div>
              <div>
                <label className="label">Usuário (login)</label>
                <input className="input" value={form.usuario} onChange={e => f('usuario', e.target.value.toLowerCase().replace(/\s/g, ''))} placeholder="Ex: fernanda" />
              </div>
              <div>
                <label className="label">{editId ? 'Nova senha (deixe em branco para manter)' : 'Senha'}</label>
                <input className="input" type="password" value={form.senha} onChange={e => f('senha', e.target.value)} placeholder="••••••••" />
              </div>
              <div>
                <label className="label">Perfil de acesso</label>
                <select className="input" value={form.perfil} onChange={e => f('perfil', e.target.value)}>
                  {PERFIS.map(p => <option key={p.value} value={p.value}>{p.label} — {p.desc}</option>)}
                </select>
              </div>
              {editId && (
                <label className="flex items-center gap-2 text-sm text-text-2 cursor-pointer">
                  <input type="checkbox" checked={form.ativo} onChange={e => f('ativo', e.target.checked)} className="w-4 h-4 accent-accent" />
                  Usuário ativo
                </label>
              )}
              {erro && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">{erro}</div>}
            </div>

            <div className="flex gap-2 justify-end px-6 py-4 border-t border-border bg-bg/40 rounded-b-2xl">
              <button className="btn-outline" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={salvar} disabled={salvando}>
                {salvando ? 'Salvando…' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL ALTERAR SENHA ── */}
      {modalSenha && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setModalSenha(false) }}>
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-xs mx-4">
            <div className="p-6 pb-4">
              <h2 className="text-lg font-semibold text-text">Alterar senha</h2>
              <p className="text-sm text-text-3 mt-0.5">Digite a nova senha do usuário</p>
            </div>
            <div className="px-6 pb-4">
              <label className="label">Nova senha</label>
              <input
                className="input" type="password" autoFocus
                value={novaSenha} onChange={e => setNovaSenha(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && salvarSenha()}
                placeholder="Mínimo 3 caracteres"
              />
            </div>
            <div className="flex gap-2 justify-end px-6 py-4 border-t border-border bg-bg/40 rounded-b-2xl">
              <button className="btn-outline" onClick={() => setModalSenha(false)}>Cancelar</button>
              <button className="btn-primary" onClick={salvarSenha}>Salvar senha</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
