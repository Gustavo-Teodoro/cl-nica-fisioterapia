import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { getPaciente, criarEvolucao, excluirEvolucao } from '../services/api'

export default function Evolucoes() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [paciente, setPaciente] = useState(null)
  const [novaEv, setNovaEv] = useState({ data: '', descricao: '' })
  const [salvando, setSalvando] = useState(false)

  const carregar = () => getPaciente(id).then(setPaciente)
  useEffect(() => { carregar() }, [id])

  const salvar = async () => {
    if (!novaEv.data || !novaEv.descricao.trim()) {
      alert('Preencha a data e a descrição.')
      return
    }
    setSalvando(true)
    try {
      await criarEvolucao({ paciente: id, data: novaEv.data, descricao: novaEv.descricao })
      setNovaEv({ data: '', descricao: '' })
      await carregar()
    } catch(e) { alert(e.message) }
    finally { setSalvando(false) }
  }

  const excluir = async (evId) => {
    if (!confirm('Excluir esta evolução?')) return
    try { await excluirEvolucao(evId); await carregar() }
    catch(e) { alert(e.message) }
  }

  if (!paciente) return (
    <Layout title="Evoluções">
      <div className="flex items-center justify-center h-48 text-text-3">Carregando…</div>
    </Layout>
  )

  return (
    <Layout title="Evoluções">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate(`/pacientes/${id}`)} className="btn-outline btn-sm">
            ← Voltar
          </button>
          <div>
            <h1 className="font-semibold text-lg text-text">{paciente.nome}</h1>
            <p className="text-xs text-text-3 mt-0.5">Histórico de evoluções</p>
          </div>
        </div>

        {/* Formulário nova evolução */}
        <div className="card mb-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-text-3 mb-3">Nova evolução</h3>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-end">
            <div>
              <label className="label">Data</label>
              <input
                className="input"
                type="date"
                value={novaEv.data}
                onChange={e => setNovaEv(p => ({ ...p, data: e.target.value }))}
              />
            </div>
            <div className="flex-1">
              <label className="label">Descrição</label>
              <input
                className="input"
                placeholder="Descreva a evolução do paciente…"
                value={novaEv.descricao}
                onChange={e => setNovaEv(p => ({ ...p, descricao: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && salvar()}
              />
            </div>
            <button className="btn-primary whitespace-nowrap" onClick={salvar} disabled={salvando}>
              {salvando ? 'Salvando…' : '+ Adicionar'}
            </button>
          </div>
        </div>

        {/* Lista de evoluções */}
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg/50">
                <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-text-3 w-8">#</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-text-3 whitespace-nowrap">Data</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-text-3">Descrição</th>
                <th className="w-8"/>
              </tr>
            </thead>
            <tbody>
              {paciente.evolucoes?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-text-3 py-10">
                    Nenhuma evolução registrada ainda.
                  </td>
                </tr>
              ) : (
                [...(paciente.evolucoes || [])].reverse().map((ev, i, arr) => (
                  <tr key={ev.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-text-3">{arr.length - i}</td>
                    <td className="px-4 py-3 text-text-2 whitespace-nowrap">
                      {ev.data ? new Date(ev.data + 'T00:00').toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className="px-4 py-3">{ev.descricao}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => excluir(ev.id)}
                        className="text-text-3 hover:text-red-500 transition-colors"
                        title="Excluir"
                      >✕</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </Layout>
  )
}
