import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Modal, { Campo } from '../components/Modal'
import {
  getPaciente, editarPaciente, excluirPaciente,
  uploadExame, excluirExame, criarEvolucao, excluirEvolucao,
  getPacotes, criarPacote, editarPacote, excluirPacote,
} from '../services/api'

const CheckItem = ({ ativo, label }) => (
  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border
    ${ativo?'bg-accent-light border-accent/30 text-accent':'bg-bg border-border text-text-3'}`}>
    {ativo
      ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3"><polyline points="20 6 9 17 4 12"/></svg>
      : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
    {label}
  </span>
)

const Dado = ({ label, value, full }) => (
  <div className={full ? 'col-span-2' : ''}>
    <div className="text-[10px] font-semibold uppercase tracking-widest text-text-3 mb-1">{label}</div>
    <div className="text-sm text-text">{value || '—'}</div>
  </div>
)

const Secao = ({ titulo, children }) => (
  <div className="card mb-4">
    <h3 className="text-xs font-semibold uppercase tracking-widest text-text-3 mb-4">{titulo}</h3>
    {children}
  </div>
)

const VAZIO_PACOTE = { tipo: 'Fisioterapia', total_sessoes: '', valor_total: '', data_inicio: '', data_vencimento: '', observacao: '' }

export default function FichaPaciente() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [paciente,     setPaciente]     = useState(null)
  const [editando,     setEditando]     = useState(false)
  const [form,         setForm]         = useState({})
  const [novaEvolucao, setNovaEvolucao] = useState({ data: '', descricao: '' })
  const [salvandoEv,   setSalvandoEv]   = useState(false)
  const [pacotes,      setPacotes]      = useState([])
  const [modalPacote,  setModalPacote]  = useState(false)
  const [formPacote,   setFormPacote]   = useState(VAZIO_PACOTE)
  const [editPacoteId, setEditPacoteId] = useState(null)

  const carregar = async () => {
    const [p, pacs] = await Promise.all([getPaciente(id), getPacotes(id)])
    setPaciente(p); setForm(p); setPacotes(pacs)
  }
  useEffect(() => { carregar() }, [id])

  if (!paciente) return (
    <Layout title="Ficha do Paciente">
      <div className="flex items-center justify-center h-48 text-text-3">Carregando…</div>
    </Layout>
  )

  const f  = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const fp = (k, v) => setFormPacote(p => ({ ...p, [k]: v }))

  const salvar = async () => {
    try { await editarPaciente(id, form); await carregar(); setEditando(false) }
    catch(e) { alert(e.message) }
  }

  const salvarEvolucao = async () => {
    if (!novaEvolucao.data || !novaEvolucao.descricao.trim()) { alert('Preencha a data e a descrição.'); return }
    setSalvandoEv(true)
    try { await criarEvolucao({ paciente: id, ...novaEvolucao }); setNovaEvolucao({ data:'', descricao:'' }); await carregar() }
    catch(e) { alert(e.message) } finally { setSalvandoEv(false) }
  }

  const removerEvolucao = async (evId) => {
    if (!confirm('Excluir esta evolução?')) return
    try { await excluirEvolucao(evId); await carregar() } catch(e) { alert(e.message) }
  }

  const excluir = async () => {
    if (!confirm(`Excluir o paciente ${paciente.nome}? Esta ação não pode ser desfeita.`)) return
    try { await excluirPaciente(id); navigate('/agenda') } catch(e) { alert(e.message) }
  }

  const handleUpload = async (e) => {
    const fd = new FormData()
    fd.append('paciente_id', id)
    for (const file of e.target.files) fd.append('pdfs', file)
    try { await uploadExame(fd); await carregar() } catch(err) { alert(err.message) }
    e.target.value = ''
  }

  const removerExame = async (exameId) => {
    if (!confirm('Remover este exame?')) return
    try { await excluirExame(exameId); await carregar() } catch(e) { alert(e.message) }
  }

  const abrirNovoPacote = () => {
    setFormPacote({ ...VAZIO_PACOTE, data_inicio: new Date().toISOString().slice(0,10) })
    setEditPacoteId(null); setModalPacote(true)
  }

  const abrirEditarPacote = (p) => {
    setFormPacote({ tipo: p.tipo, total_sessoes: p.total_sessoes, valor_total: p.valor_total,
      data_inicio: p.data_inicio, data_vencimento: p.data_vencimento || '', observacao: p.observacao || '' })
    setEditPacoteId(p.id); setModalPacote(true)
  }

  const salvarPacote = async () => {
    try {
      const payload = { ...formPacote, paciente: id,
        total_sessoes: parseInt(formPacote.total_sessoes),
        valor_total: parseFloat(formPacote.valor_total),
        data_vencimento: formPacote.data_vencimento || null }
      if (editPacoteId) await editarPacote(editPacoteId, payload)
      else await criarPacote(payload)
      await carregar(); setModalPacote(false)
    } catch(e) { alert(e.message) }
  }

  const removerPacote = async (pid) => {
    if (!confirm('Excluir este pacote?')) return
    try { await excluirPacote(pid); await carregar() } catch(e) { alert(e.message) }
  }

  const exames   = [{campo:'exame_raio_x',label:'Raio X'},{campo:'exame_rnm',label:'RNM'},{campo:'exame_tomografia',label:'Tomografia'},{campo:'exame_ecografia',label:'Ecografia'}]
  const historico= [{campo:'hs_cirurgia',label:'Cirurgia'},{campo:'hs_hipertensao',label:'Hipertensão'},{campo:'hs_diabetes',label:'Diabetes'},{campo:'hs_cardiaco',label:'Prob. cardíaco'},{campo:'hs_labirintite',label:'Labirintite'},{campo:'hs_fumante',label:'Fumante'},{campo:'hs_perda_peso',label:'Perda de peso'},{campo:'hs_febre',label:'Febre/calafrios'},{campo:'hs_vomito',label:'Vômito/náuseas'},{campo:'hs_trauma',label:'Trauma recente'},{campo:'hs_osteoporose',label:'Osteoporose'}]

  return (
    <Layout title="Ficha do Paciente">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/agenda')} className="btn-outline btn-sm">← Voltar</button>
          <div>
            <h1 className="font-semibold text-lg text-text">{paciente.nome}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              {paciente.cpf && <span className="text-sm text-text-3">{paciente.cpf}</span>}
              <span className={`tag ${paciente.modalidade==='Fisioterapia'?'tag-green':paciente.modalidade==='Pilates'?'tag-blue':'tag-amber'}`}>{paciente.modalidade}</span>
              <span className={`tag ${paciente.status==='Ativo'?'tag-green':'tag-amber'}`}>{paciente.status}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {editando ? (<>
            <button className="btn-danger btn-sm" onClick={excluir}>Excluir paciente</button>
            <button className="btn-outline btn-sm" onClick={() => { setEditando(false); setForm(paciente) }}>Cancelar</button>
            <button className="btn-primary btn-sm" onClick={salvar}>Salvar alterações</button>
          </>) : (<>
            <button className="btn-outline btn-sm" onClick={() => navigate(`/pacientes/${id}/evolucoes`)}>📋 Evoluções</button>
            <button className="btn-primary btn-sm" onClick={() => setEditando(true)}>✏️ Editar ficha</button>
          </>)}
        </div>
      </div>

      {/* Dados Pessoais */}
      <Secao titulo="Dados Pessoais">
        {editando ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[['Nome completo','nome'],['CPF','cpf'],['Telefone','telefone'],['Profissão','profissao'],['Endereço','endereco']].map(([l,k])=>(
              <div key={k} className={k==='endereco'?'col-span-2':''}>
                <label className="label">{l}</label>
                <input className="input" value={form[k]||''} onChange={e=>f(k,e.target.value)} />
              </div>
            ))}
            <div><label className="label">Data de Nascimento</label>
              <input className="input" type="date" value={form.data_nascimento||''} onChange={e=>f('data_nascimento',e.target.value)} /></div>
            <div><label className="label">Estado Civil</label>
              <select className="input" value={form.estado_civil||''} onChange={e=>f('estado_civil',e.target.value)}>
                <option value="">Selecione</option>
                {['Solteiro(a)','Casado(a)','Divorciado(a)','Viúvo(a)','União estável'].map(o=><option key={o}>{o}</option>)}
              </select></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            <Dado label="Nome" value={paciente.nome} />
            <Dado label="CPF" value={paciente.cpf} />
            <Dado label="Data de Nasc." value={paciente.data_nascimento ? new Date(paciente.data_nascimento+'T00:00').toLocaleDateString('pt-BR') : null} />
            <Dado label="Telefone" value={paciente.telefone} />
            <Dado label="Estado Civil" value={paciente.estado_civil} />
            <Dado label="Profissão" value={paciente.profissao} />
            <Dado label="Endereço" value={paciente.endereco} full />
          </div>
        )}
      </Secao>

      {/* Pagamento */}
      <Secao titulo="Pagamento">
        {editando ? (
          <div className="grid grid-cols-3 gap-3">
            <div><label className="label">Tipo</label>
              <select className="input" value={form.pagamento_tipo||''} onChange={e=>f('pagamento_tipo',e.target.value)}>
                <option>Particular</option><option>Convênio</option></select></div>
            <div><label className="label">Convênio</label>
              <input className="input" value={form.convenio||''} onChange={e=>f('convenio',e.target.value)} /></div>
            <div><label className="label">Modalidade</label>
              <select className="input" value={form.modalidade||''} onChange={e=>f('modalidade',e.target.value)}>
                <option>Fisioterapia</option><option>Pilates</option><option>Ambos</option></select></div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-x-8 gap-y-4">
            <Dado label="Tipo" value={paciente.pagamento_tipo} />
            <Dado label="Convênio" value={paciente.convenio} />
            <Dado label="Modalidade" value={paciente.modalidade} />
          </div>
        )}
      </Secao>

      {/* Pacotes de Sessões */}
      <Secao titulo="Pacotes de Sessões">
        <div className="flex justify-end mb-3">
          <button className="btn-primary btn-sm" onClick={abrirNovoPacote}>+ Novo pacote</button>
        </div>
        {pacotes.length === 0 ? (
          <p className="text-sm text-text-3">Nenhum pacote cadastrado.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {pacotes.map(p => (
              <div key={p.id} className={`border rounded-xl p-4 ${p.status==='Ativo'?'border-accent/30 bg-accent-light/10':'border-border bg-bg'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className={`tag text-xs ${p.tipo==='Pilates'?'tag-blue':'tag-green'}`}>{p.tipo}</span>
                    <span className={`tag text-xs ml-2 ${p.status==='Ativo'?'tag-green':p.status==='Encerrado'?'tag-blue':'tag-red'}`}>{p.status}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => abrirEditarPacote(p)} className="text-xs text-text-3 hover:text-accent">✏️</button>
                    <button onClick={() => removerPacote(p.id)} className="text-xs text-text-3 hover:text-red-500">✕</button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-text-2">Sessões</span>
                  <span className="font-semibold text-text">{p.sessoes_usadas} / {p.total_sessoes} usadas</span>
                </div>
                <div className="h-2 bg-bg border border-border rounded-full overflow-hidden mb-2">
                  <div className={`h-full rounded-full transition-all ${p.percentual_uso > 80 ? 'bg-red-500' : 'bg-accent'}`}
                    style={{ width: `${p.percentual_uso}%` }} />
                </div>
                <div className="flex justify-between text-xs text-text-3">
                  <span>{p.sessoes_restantes} sessão(ões) restante(s)</span>
                  <span>{Number(p.valor_total).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</span>
                </div>
                {p.data_vencimento && (
                  <div className="text-xs text-text-3 mt-1">
                    Vence em: {new Date(p.data_vencimento+'T00:00').toLocaleDateString('pt-BR')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Secao>

      {/* Diagnóstico */}
      <Secao titulo="Diagnóstico e Queixa">
        {editando ? (
          <div className="flex flex-col gap-3">
            {[['Diagnóstico Médico','diagnostico_medico'],['Queixa Principal','queixa_principal'],['Diagnóstico Fisioterapêutico','diagnostico_fisio']].map(([l,k])=>(
              <div key={k}><label className="label">{l}</label>
                <textarea className="input resize-none" rows={2} value={form[k]||''} onChange={e=>f(k,e.target.value)} /></div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <Dado label="Diagnóstico Médico" value={paciente.diagnostico_medico} full />
            <Dado label="Queixa Principal" value={paciente.queixa_principal} full />
            <Dado label="Diagnóstico Fisioterapêutico" value={paciente.diagnostico_fisio} full />
          </div>
        )}
      </Secao>

      {/* Exames */}
      <Secao titulo="Exames Complementares">
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-wrap gap-2">
            {editando
              ? exames.map(({campo,label})=>(
                  <button key={campo} type="button" onClick={()=>f(campo,!form[campo])}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border cursor-pointer transition-all
                      ${form[campo]?'bg-accent-light border-accent/30 text-accent':'bg-bg border-border text-text-3 hover:border-accent hover:text-accent'}`}>
                    {form[campo]
                      ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3"><polyline points="20 6 9 17 4 12"/></svg>
                      : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
                    {label}
                  </button>))
              : exames.map(({campo,label})=><CheckItem key={campo} ativo={paciente[campo]} label={label} />)
            }
          </div>
          <label className="btn-outline btn-sm cursor-pointer">
            📎 Anexar PDF
            <input type="file" accept=".pdf" multiple className="hidden" onChange={handleUpload} />
          </label>
        </div>
        {editando && (
          <div className="mt-3"><label className="label">Observações dos exames</label>
            <textarea className="input resize-none" rows={2} value={form.obs_exames||''} onChange={e=>f('obs_exames',e.target.value)} /></div>
        )}
        {!editando && paciente.obs_exames && <div className="mt-3"><Dado label="Observações" value={paciente.obs_exames} /></div>}
        <div className="mt-4 flex flex-col gap-2">
          {paciente.exames_pdf?.length === 0 && <p className="text-sm text-text-3">Nenhum exame anexado ainda.</p>}
          {paciente.exames_pdf?.map(exame=>(
            <div key={exame.id} className="flex items-center gap-3 px-3 py-2.5 bg-bg border border-border rounded-xl">
              <svg viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="1.8" className="w-4 h-4 flex-shrink-0">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/>
              </svg>
              <span className="flex-1 text-sm font-medium text-text truncate">{exame.nome_original}</span>
              <span className="text-xs text-text-3 flex-shrink-0">{exame.data_upload}</span>
              <a href={exame.arquivo_url} target="_blank" rel="noreferrer" className="text-xs text-accent font-medium hover:underline flex-shrink-0">Abrir</a>
              <button onClick={()=>removerExame(exame.id)} className="text-text-3 hover:text-red-500 text-sm">✕</button>
            </div>
          ))}
        </div>
      </Secao>

      {/* Histórico de Saúde */}
      <Secao titulo="Histórico de Saúde">
        {editando ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
            {historico.map(({campo,label})=>(
              <label key={campo} className="flex items-center gap-2 cursor-pointer text-sm text-text-2">
                <input type="checkbox" checked={!!form[campo]} onChange={e=>f(campo,e.target.checked)} className="w-4 h-4 accent-accent" />{label}
              </label>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 mb-4">
            {historico.map(({campo,label})=><CheckItem key={campo} ativo={paciente[campo]} label={label} />)}
          </div>
        )}
        {editando ? (
          <div className="grid grid-cols-2 gap-3">
            {[['Alergia','alergia'],['Outros problemas','outros_problemas']].map(([l,k])=>(
              <div key={k}><label className="label">{l}</label>
                <input className="input" value={form[k]||''} onChange={e=>f(k,e.target.value)} /></div>
            ))}
            <div className="col-span-2"><label className="label">Medicação em uso</label>
              <textarea className="input resize-none" rows={2} value={form.medicacao||''} onChange={e=>f('medicacao',e.target.value)} /></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 mt-4">
            {paciente.alergia && <Dado label="Alergia" value={paciente.alergia} />}
            {paciente.outros_problemas && <Dado label="Outros problemas" value={paciente.outros_problemas} />}
            {paciente.medicacao && <Dado label="Medicação em uso" value={paciente.medicacao} full />}
          </div>
        )}
      </Secao>

      {/* Evoluções */}
      <Secao titulo="Evoluções">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 sm:items-end">
          <div><label className="label">Data</label>
            <input className="input" type="date" value={novaEvolucao.data} onChange={e=>setNovaEvolucao(p=>({...p,data:e.target.value}))} /></div>
          <div className="flex-1"><label className="label">Descrição</label>
            <input className="input" placeholder="Descreva a evolução…" value={novaEvolucao.descricao}
              onChange={e=>setNovaEvolucao(p=>({...p,descricao:e.target.value}))}
              onKeyDown={e=>e.key==='Enter'&&salvarEvolucao()} /></div>
          <button className="btn-primary btn-sm whitespace-nowrap" onClick={salvarEvolucao} disabled={salvandoEv}>
            {salvandoEv?'Salvando…':'+ Adicionar'}
          </button>
        </div>
        <div className="overflow-hidden rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg/50">
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-text-3 w-8">#</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-text-3">Data</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-text-3">Descrição</th>
                <th className="w-8"/>
              </tr>
            </thead>
            <tbody>
              {paciente.evolucoes?.length === 0 ? (
                <tr><td colSpan={4} className="text-center text-text-3 py-8">Nenhuma evolução registrada</td></tr>
              ) : paciente.evolucoes?.map((ev,i)=>(
                <tr key={ev.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-text-3">{i+1}</td>
                  <td className="px-4 py-3 text-text-2 whitespace-nowrap">{ev.data?new Date(ev.data+'T00:00').toLocaleDateString('pt-BR'):'—'}</td>
                  <td className="px-4 py-3">{ev.descricao}</td>
                  <td className="px-4 py-3">
                    <button onClick={()=>removerEvolucao(ev.id)} className="text-text-3 hover:text-red-500 transition-colors">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Secao>

      {/* Modal Pacote */}
      <Modal aberto={modalPacote} onFechar={()=>setModalPacote(false)}
        titulo={editPacoteId ? 'Editar Pacote' : 'Novo Pacote de Sessões'}
        subtitulo={paciente.nome}
        rodape={
          <div className="flex gap-2 ml-auto">
            <button className="btn-outline" onClick={()=>setModalPacote(false)}>Cancelar</button>
            <button className="btn-primary" onClick={salvarPacote}>Salvar</button>
          </div>
        }>
        <Campo label="Tipo">
          <select className="input" value={formPacote.tipo} onChange={e=>fp('tipo',e.target.value)}>
            <option>Fisioterapia</option><option>Pilates</option>
          </select>
        </Campo>
        <div className="grid grid-cols-2 gap-3">
          <Campo label="Total de sessões">
            <input className="input" type="number" min="1" value={formPacote.total_sessoes} onChange={e=>fp('total_sessoes',e.target.value)} placeholder="Ex: 10" />
          </Campo>
          <Campo label="Valor total (R$)">
            <input className="input" type="number" step="0.01" min="0" value={formPacote.valor_total} onChange={e=>fp('valor_total',e.target.value)} placeholder="0,00" />
          </Campo>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Campo label="Data de início">
            <input className="input" type="date" value={formPacote.data_inicio} onChange={e=>fp('data_inicio',e.target.value)} />
          </Campo>
          <Campo label="Data de vencimento">
            <input className="input" type="date" value={formPacote.data_vencimento} onChange={e=>fp('data_vencimento',e.target.value)} />
          </Campo>
        </div>
        <Campo label="Observação">
          <input className="input" value={formPacote.observacao} onChange={e=>fp('observacao',e.target.value)} placeholder="Opcional" />
        </Campo>
      </Modal>
    </Layout>
  )
}
