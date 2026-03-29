import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import Modal, { Campo } from '../components/Modal'
import { getLancamentos, criarLancamento, editarLancamento, excluirLancamento, marcarPago, getPacientes } from '../services/api'

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const CATS_RECEITA = ['Fisioterapia','Pilates','Outros']
const CATS_DESPESA = ['Infraestrutura','Suprimentos','Salário','Outros']
const VAZIO = { descricao:'', tipo:'Receita', valor:'', data:'', categoria:'Fisioterapia', status:'Pago', paciente:'' }
const fmt = (v) => Number(v).toLocaleString('pt-BR', { style:'currency', currency:'BRL' })

export default function Financeiro() {
  const hoje = new Date()
  const [mes,          setMes]          = useState(hoje.getMonth() + 1)
  const [ano,          setAno]          = useState(hoje.getFullYear())
  const [dados,        setDados]        = useState({ lancamentos:[], receita_mes:0, despesa_mes:0, saldo_mes:0, pendentes:0, cats_receita:[], atendimentos_realizados:0 })
  const [filtroTipo,   setFiltroTipo]   = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [aba,          setAba]          = useState('geral')
  const [modal,        setModal]        = useState(false)
  const [form,         setForm]         = useState(VAZIO)
  const [editId,       setEditId]       = useState(null)
  const [pacientes,    setPacientes]    = useState([])
  const [sugestoes,    setSugestoes]    = useState([])
  const [mostrarSug,   setMostrarSug]   = useState(false)
  const [pacNome,      setPacNome]      = useState('')

  const carregar = async () => {
    const params = { ano, mes }
    if (filtroTipo)   params.tipo   = filtroTipo
    if (filtroStatus) params.status = filtroStatus
    const d = await getLancamentos(params)
    setDados(d)
  }

  useEffect(() => { carregar() }, [mes, ano, filtroTipo, filtroStatus])
  useEffect(() => { getPacientes().then(setPacientes) }, [])

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const abrirNovo = () => {
    setForm({ ...VAZIO, data: new Date().toISOString().slice(0,10) })
    setPacNome(''); setEditId(null); setModal(true)
  }

  const abrirEditar = (l) => {
    setForm({ descricao:l.descricao, tipo:l.tipo, valor:l.valor, data:l.data, categoria:l.categoria, status:l.status, paciente:l.paciente||'' })
    setPacNome(l.paciente_nome||'')
    setEditId(l.id); setModal(true)
  }

  const salvar = async () => {
    try {
      const payload = { ...form, valor: parseFloat(form.valor) }
      if (!payload.paciente) delete payload.paciente
      if (editId) await editarLancamento(editId, payload)
      else        await criarLancamento(payload)
      await carregar(); setModal(false)
    } catch(e) { alert(e.message) }
  }

  const excluir = async (id) => {
    if (!confirm('Excluir este lançamento?')) return
    try { await excluirLancamento(id); await carregar() } catch(e) { alert(e.message) }
  }

  const pagar = async (id) => {
    try { await marcarPago(id); await carregar() } catch(e) { alert(e.message) }
  }

  const filtrarPac = (v) => {
    setPacNome(v)
    setSugestoes(pacientes.filter(p => p.nome.toLowerCase().includes(v.toLowerCase())))
    setMostrarSug(true)
  }

  const cats    = form.tipo === 'Receita' ? CATS_RECEITA : CATS_DESPESA
  const maxCat  = Math.max(...(dados.cats_receita || []).map(c => c.total || 0), 1)
  const pendentesLista = dados.lancamentos.filter(l => l.status === 'Pendente')

  return (
    <Layout title="Financeiro">
      <div className="max-w-3xl mx-auto">

        {/* Abas */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {[['geral','Visão geral'],['lancamentos','Lançamentos'],['categorias','Por categoria'],['pendentes','Pendentes'],['relatorio','Relatório']].map(([k,l]) => (
            <button key={k} onClick={() => setAba(k)}
              className={`btn-sm whitespace-nowrap ${aba===k ? 'btn-primary' : 'btn-outline'}`}>{l}</button>
          ))}
        </div>

        {/* Cards resumo */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { label:'Receita do mês',  val:dados.receita_mes,  cor:'text-accent' },
            { label:'Despesas do mês', val:dados.despesa_mes,  cor:'text-red-600' },
            { label:'Saldo do mês',    val:dados.saldo_mes,    cor: dados.saldo_mes >= 0 ? 'text-accent' : 'text-red-600' },
            { label:'Pendentes',       val:dados.pendentes,    cor:'text-amber-600' },
          ].map(({ label, val, cor }) => (
            <div key={label} className="bg-surface border border-border rounded-xl p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-text-3 mb-1">{label}</div>
              <div className={`text-lg font-semibold ${cor}`}>{fmt(val)}</div>
            </div>
          ))}
        </div>

        {/* Filtros + botão */}
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          <select className="input w-auto" value={mes} onChange={e => setMes(Number(e.target.value))}>
            {MESES.map((m,i) => <option key={i} value={i+1}>{m}</option>)}
          </select>
          <select className="input w-auto" value={ano} onChange={e => setAno(Number(e.target.value))}>
            {[2024,2025,2026,2027].map(y => <option key={y}>{y}</option>)}
          </select>
          {(aba === 'lancamentos' || aba === 'geral') && <>
            <select className="input w-auto" value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
              <option value="">Todos os tipos</option>
              <option>Receita</option><option>Despesa</option>
            </select>
            <select className="input w-auto" value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
              <option value="">Todos os status</option>
              <option>Pago</option><option>Pendente</option>
            </select>
          </>}
          <button className="btn-primary btn-sm ml-auto" onClick={abrirNovo}>+ Novo lançamento</button>
        </div>

        {/* Aba: Visão geral / Lançamentos */}
        {(aba === 'geral' || aba === 'lancamentos') && (
          <div className="card p-0 overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-bg/50">
                  {['Descrição','Paciente','Categoria','Data','Tipo','Status','Valor',''].map(h => (
                    <th key={h} className="text-left px-3 py-3 text-[10px] font-semibold uppercase tracking-widest text-text-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dados.lancamentos.length === 0 ? (
                  <tr><td colSpan={8} className="text-center text-text-3 py-10">Nenhum lançamento encontrado.</td></tr>
                ) : dados.lancamentos.map(l => (
                  <tr key={l.id} className="border-b border-border last:border-0 hover:bg-accent-light/20">
                    <td className="px-3 py-3 font-medium max-w-[160px] truncate">{l.descricao}</td>
                    <td className="px-3 py-3 text-text-2 whitespace-nowrap">{l.paciente_nome || '—'}</td>
                    <td className="px-3 py-3 whitespace-nowrap"><span className="tag tag-blue">{l.categoria}</span></td>
                    <td className="px-3 py-3 text-text-2 whitespace-nowrap">
                      {l.data ? new Date(l.data+'T00:00').toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`tag ${l.tipo==='Receita'?'tag-green':'tag-red'}`}>{l.tipo}</span>
                    </td>
                    <td className="px-3 py-3">
                      {l.status === 'Pendente' ? (
                        <button onClick={() => pagar(l.id)}
                          className="tag tag-amber hover:bg-amber-100 cursor-pointer transition-colors">
                          Pendente ✓
                        </button>
                      ) : (
                        <span className="tag tag-green">Pago</span>
                      )}
                    </td>
                    <td className={`px-3 py-3 font-semibold whitespace-nowrap ${l.tipo==='Receita'?'text-accent':'text-red-600'}`}>
                      {l.tipo==='Receita'?'+':'-'}{fmt(l.valor)}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => abrirEditar(l)} className="text-text-3 hover:text-accent text-xs">✏️</button>
                        <button onClick={() => excluir(l.id)} className="text-text-3 hover:text-red-500 text-xs">✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Aba: Por categoria */}
        {aba === 'categorias' && (
          <div className="card">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-text-3 mb-4">Receitas por categoria</h3>
            {dados.cats_receita.length === 0 ? (
              <p className="text-sm text-text-3">Nenhuma receita no período.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {dados.cats_receita.map(c => (
                  <div key={c.categoria}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-text">{c.categoria}</span>
                      <span className="font-semibold text-accent">{fmt(c.total)}</span>
                    </div>
                    <div className="h-3 bg-bg rounded-full overflow-hidden border border-border">
                      <div className="h-full bg-accent rounded-full transition-all"
                        style={{ width: `${Math.round((c.total/maxCat)*100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Aba: Pendentes */}
        {aba === 'pendentes' && (
          <div className="card p-0 overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-bg/50">
                  {['Descrição','Paciente','Data','Tipo','Valor',''].map(h => (
                    <th key={h} className="text-left px-3 py-3 text-[10px] font-semibold uppercase tracking-widest text-text-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pendentesLista.length === 0 ? (
                  <tr><td colSpan={6} className="text-center text-text-3 py-10">Nenhum pendente no período. ✓</td></tr>
                ) : pendentesLista.map(l => (
                  <tr key={l.id} className="border-b border-border last:border-0">
                    <td className="px-3 py-3 font-medium">{l.descricao}</td>
                    <td className="px-3 py-3 text-text-2">{l.paciente_nome || '—'}</td>
                    <td className="px-3 py-3 text-text-2 whitespace-nowrap">
                      {l.data ? new Date(l.data+'T00:00').toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`tag ${l.tipo==='Receita'?'tag-green':'tag-red'}`}>{l.tipo}</span>
                    </td>
                    <td className={`px-3 py-3 font-semibold ${l.tipo==='Receita'?'text-accent':'text-red-600'}`}>{fmt(l.valor)}</td>
                    <td className="px-3 py-3">
                      <button onClick={() => pagar(l.id)}
                        className="btn-outline btn-sm text-accent border-accent hover:bg-accent-light">
                        Marcar pago
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Aba: Relatório — atendimentos realizados vs recebidos */}
        {aba === 'relatorio' && (
          <div className="flex flex-col gap-4">
            <div className="card">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-text-3 mb-4">
                Fechamento — {MESES[mes-1]} {ano}
              </h3>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <div>
                    <div className="text-sm font-medium text-text">Atendimentos realizados</div>
                    <div className="text-xs text-text-3 mt-0.5">Sessões com check-in confirmado no período</div>
                  </div>
                  <span className="text-2xl font-bold text-accent">{dados.atendimentos_realizados}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <div>
                    <div className="text-sm font-medium text-text">Receitas recebidas</div>
                    <div className="text-xs text-text-3 mt-0.5">Lançamentos de receita com status Pago</div>
                  </div>
                  <span className="text-lg font-bold text-accent">
                    {fmt(dados.lancamentos.filter(l=>l.tipo==='Receita'&&l.status==='Pago').reduce((s,l)=>s+Number(l.valor),0))}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <div>
                    <div className="text-sm font-medium text-text">Receitas pendentes</div>
                    <div className="text-xs text-text-3 mt-0.5">Lançamentos de receita ainda em aberto</div>
                  </div>
                  <span className="text-lg font-bold text-amber-600">
                    {fmt(dados.lancamentos.filter(l=>l.tipo==='Receita'&&l.status==='Pendente').reduce((s,l)=>s+Number(l.valor),0))}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <div>
                    <div className="text-sm font-medium text-text">Total de despesas</div>
                    <div className="text-xs text-text-3 mt-0.5">Soma de todos os gastos do período</div>
                  </div>
                  <span className="text-lg font-bold text-red-600">{fmt(dados.despesa_mes)}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <div>
                    <div className="text-sm font-bold text-text">Saldo do período</div>
                    <div className="text-xs text-text-3 mt-0.5">Receitas pagas menos despesas</div>
                  </div>
                  <span className={`text-xl font-bold ${dados.saldo_mes >= 0 ? 'text-accent' : 'text-red-600'}`}>
                    {fmt(dados.saldo_mes)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Modal novo/editar lançamento */}
      <Modal aberto={modal} onFechar={() => setModal(false)}
        titulo={editId ? 'Editar lançamento' : 'Novo lançamento'}
        subtitulo="Controle financeiro da clínica"
        rodape={
          <div className="flex gap-2 ml-auto">
            {editId && <button className="btn-danger" onClick={async () => { await excluir(editId); setModal(false) }}>Excluir</button>}
            <button className="btn-outline" onClick={() => setModal(false)}>Cancelar</button>
            <button className="btn-primary" onClick={salvar}>Salvar</button>
          </div>
        }>
        <Campo label="Descrição">
          <input className="input" value={form.descricao} onChange={e => f('descricao', e.target.value)} placeholder="Ex: Sessão de fisioterapia" />
        </Campo>
        <div className="grid grid-cols-2 gap-3">
          <Campo label="Tipo">
            <select className="input" value={form.tipo} onChange={e => { f('tipo', e.target.value); f('categoria', e.target.value==='Receita'?'Fisioterapia':'Infraestrutura') }}>
              <option>Receita</option><option>Despesa</option>
            </select>
          </Campo>
          <Campo label="Categoria">
            <select className="input" value={form.categoria} onChange={e => f('categoria', e.target.value)}>
              {cats.map(c => <option key={c}>{c}</option>)}
            </select>
          </Campo>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Campo label="Valor (R$)">
            <input className="input" type="number" step="0.01" min="0" value={form.valor} onChange={e => f('valor', e.target.value)} placeholder="0,00" />
          </Campo>
          <Campo label="Data">
            <input className="input" type="date" value={form.data} onChange={e => f('data', e.target.value)} />
          </Campo>
        </div>
        <Campo label="Status">
          <select className="input" value={form.status} onChange={e => f('status', e.target.value)}>
            <option>Pago</option><option>Pendente</option>
          </select>
        </Campo>
        {form.tipo === 'Receita' && (
          <Campo label="Paciente (opcional)">
            <div className="relative">
              <input className="input" value={pacNome}
                onChange={e => filtrarPac(e.target.value)}
                onFocus={() => { setSugestoes(pacientes); setMostrarSug(true) }}
                onBlur={() => setTimeout(() => setMostrarSug(false), 150)}
                placeholder="Digite o nome do paciente…" />
              {mostrarSug && sugestoes.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-surface border border-border rounded-xl shadow-lg z-50 max-h-40 overflow-y-auto mt-1">
                  {sugestoes.map(p => (
                    <div key={p.id} onMouseDown={() => { setPacNome(p.nome); f('paciente', p.id); setMostrarSug(false) }}
                      className="px-3 py-2.5 text-sm cursor-pointer hover:bg-accent-light/50">{p.nome}</div>
                  ))}
                </div>
              )}
            </div>
          </Campo>
        )}
      </Modal>
    </Layout>
  )
}
