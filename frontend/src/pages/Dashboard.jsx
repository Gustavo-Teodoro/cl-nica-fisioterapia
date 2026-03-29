import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { getDashboard } from '../services/api'

const fmt = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function Dashboard() {
  const navigate = useNavigate()
  const [dados, setDados] = useState(null)

  useEffect(() => {
    getDashboard().then(setDados).catch(console.error)
  }, [])

  if (!dados) return (
    <Layout title="Dashboard">
      <div className="flex items-center justify-center h-48 text-text-3">Carregando…</div>
    </Layout>
  )

  const { alertas = [], agendamentos_hoje = [] } = dados

  const urgentes = alertas.filter(a => a.nivel === 'urgente')
  const avisos   = alertas.filter(a => a.nivel === 'aviso')

  return (
    <Layout title="Dashboard">
      <div className="max-w-3xl mx-auto space-y-5">

        {/* Alertas urgentes */}
        {urgentes.length > 0 && (
          <div className="flex flex-col gap-2">
            {urgentes.map((a, i) => (
              <div key={i}
                onClick={() => a.paciente_id && navigate(`/pacientes/${a.paciente_id}`)}
                className={`bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3 ${a.paciente_id ? 'cursor-pointer hover:bg-red-100' : ''}`}>
                <span className="text-red-500 text-lg flex-shrink-0">🚨</span>
                <div>
                  <p className="text-sm font-medium text-red-800">{a.mensagem}</p>
                  {a.paciente_id && <p className="text-xs text-red-500 mt-0.5">Toque para ver a ficha</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Avisos */}
        {avisos.length > 0 && (
          <div className="flex flex-col gap-2">
            {avisos.map((a, i) => (
              <div key={i}
                onClick={() => a.paciente_id && navigate(`/pacientes/${a.paciente_id}`)}
                className={`bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3 ${a.paciente_id ? 'cursor-pointer hover:bg-amber-100' : ''}`}>
                <span className="text-amber-500 text-lg flex-shrink-0">⚠️</span>
                <div>
                  <p className="text-sm font-medium text-amber-800">{a.mensagem}</p>
                  {a.paciente_id && <p className="text-xs text-amber-500 mt-0.5">Toque para ver a ficha</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {alertas.length === 0 && (
          <div className="bg-accent-light/40 border border-accent/20 rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="text-lg">✅</span>
            <p className="text-sm text-accent font-medium">Tudo em ordem — nenhum alerta no momento.</p>
          </div>
        )}

        {/* Cards resumo do mês */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Pacientes',        val: dados.total_pacientes, cor: 'text-text',       fmt: v => v },
            { label: 'Atendimentos hoje',val: dados.consultas_hoje,  cor: 'text-accent',     fmt: v => v },
            { label: 'Receita do mês',   val: dados.receita_mes,     cor: 'text-accent',     fmt },
            { label: 'Saldo do mês',     val: dados.saldo_mes,       cor: dados.saldo_mes >= 0 ? 'text-accent' : 'text-red-600', fmt },
          ].map(({ label, val, cor, fmt: f }) => (
            <div key={label} className="bg-surface border border-border rounded-xl p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-text-3 mb-1">{label}</div>
              <div className={`text-lg font-semibold ${cor}`}>{f(val)}</div>
            </div>
          ))}
        </div>

        {/* Hoje por tipo */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-text-3 mb-1">Fisioterapia hoje</div>
            <div className="text-2xl font-semibold text-accent">{dados.fisio_hoje}</div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-text-3 mb-1">Pilates hoje</div>
            <div className="text-2xl font-semibold text-blue-600">{dados.pilates_hoje}</div>
          </div>
        </div>

        {/* Agenda de hoje */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-text-3">Agenda de hoje</h3>
            <button onClick={() => navigate('/agenda')} className="text-xs text-accent font-medium hover:underline">
              Ver agenda completa →
            </button>
          </div>
          {agendamentos_hoje.length === 0 ? (
            <p className="text-sm text-text-3">Nenhum agendamento para hoje.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {agendamentos_hoje.map(a => (
                <div key={a.id} className="flex items-center gap-3 px-3 py-2.5 border border-border rounded-xl">
                  <span className="text-sm font-semibold text-accent w-12 flex-shrink-0">{a.horario?.slice(0,5)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-text truncate">{a.paciente_nome}</div>
                    <div className="text-xs text-text-3">{a.tipo}</div>
                  </div>
                  <span className={`tag text-[10px] ${
                    a.status === 'Realizado'  ? 'tag-green' :
                    a.status === 'Confirmado' ? 'tag-blue'  :
                    a.status === 'Faltou'     ? 'tag-red'   :
                    a.status === 'Cancelado'  ? 'tag-red'   : 'tag-amber'
                  }`}>{a.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resumo financeiro */}
        <div className="card">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-text-3 mb-4">Financeiro do mês</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-2">Receitas</span>
              <span className="text-sm font-semibold text-accent">{fmt(dados.receita_mes)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-2">Despesas</span>
              <span className="text-sm font-semibold text-red-600">{fmt(dados.despesa_mes)}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-text">Saldo</span>
              <span className={`text-sm font-bold ${dados.saldo_mes >= 0 ? 'text-accent' : 'text-red-600'}`}>
                {fmt(dados.saldo_mes)}
              </span>
            </div>
            {dados.pendentes_fin > 0 && (
              <button onClick={() => navigate('/financeiro')}
                className="text-xs text-amber-600 font-medium mt-1 text-left hover:underline">
                ⚠️ {dados.pendentes_fin} pagamento(s) pendente(s) — ver financeiro
              </button>
            )}
          </div>
        </div>

      </div>
    </Layout>
  )
}
