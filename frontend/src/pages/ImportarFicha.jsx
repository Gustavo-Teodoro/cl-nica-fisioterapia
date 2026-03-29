import { useState, useRef } from 'react'
import Layout from '../components/Layout'
import Modal, { Campo } from '../components/Modal'
import { criarPaciente } from '../services/api'

const VAZIO = {
  nome: '', cpf: '', telefone: '', data_nascimento: '', idade: '',
  estado_civil: '', profissao: '', endereco: '', modalidade: '',
  pagamento_tipo: '', convenio: '', diagnostico_medico: '',
  queixa_principal: '', diagnostico_fisio: '', alergia: '',
  medicacao: '', outros_problemas: '', status: 'Ativo',
}

const ETAPAS = {
  INICIO: 'inicio',
  PREVIEW: 'preview',
  PROCESSANDO: 'processando',
  REVISAO: 'revisao',
  SUCESSO: 'sucesso',
}

export default function ImportarFicha() {
  const [etapa, setEtapa] = useState(ETAPAS.INICIO)
  const [imagem, setImagem] = useState(null)
  const [imagemUrl, setImagemUrl] = useState(null)
  const [form, setForm] = useState(VAZIO)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const inputRef = useRef()

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleArquivo = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErro('Por favor, selecione uma imagem (JPG, PNG, etc).')
      return
    }
    setErro('')
    setImagem(file)
    setImagemUrl(URL.createObjectURL(file))
    setEtapa(ETAPAS.PREVIEW)
  }

  const processarFicha = async () => {
    setEtapa(ETAPAS.PROCESSANDO)
    setErro('')
    try {
      const formData = new FormData()
      formData.append('imagem', imagem)
      const res = await fetch('/api/importar-ficha/', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Erro ao processar imagem.')
      setForm({ ...VAZIO, ...data })
      setEtapa(ETAPAS.REVISAO)
    } catch (e) {
      setErro(e.message)
      setEtapa(ETAPAS.PREVIEW)
    }
  }

  const salvar = async () => {
    setSalvando(true)
    setErro('')
    try {
      await criarPaciente(form)
      setEtapa(ETAPAS.SUCESSO)
    } catch (e) {
      setErro(e.message)
    } finally {
      setSalvando(false)
    }
  }

  const reiniciar = () => {
    setEtapa(ETAPAS.INICIO)
    setImagem(null)
    setImagemUrl(null)
    setForm(VAZIO)
    setErro('')
  }

  return (
    <Layout title="Importar Ficha">
      <div className="max-w-2xl mx-auto">

        {/* Cabeçalho */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-text">Importar Ficha de Papel</h2>
          <p className="text-sm text-text-3 mt-1">
            Tire uma foto da ficha manuscrita — a IA extrai os dados automaticamente.
          </p>
        </div>

        {/* Barra de progresso */}
        <div className="flex items-center gap-2 mb-8">
          {['Foto', 'Processar', 'Revisar', 'Salvar'].map((label, i) => {
            const ativas = {
              [ETAPAS.INICIO]: 0, [ETAPAS.PREVIEW]: 1,
              [ETAPAS.PROCESSANDO]: 2, [ETAPAS.REVISAO]: 3, [ETAPAS.SUCESSO]: 4,
            }
            const atual = ativas[etapa] ?? 0
            const ativa = i < atual
            const corrente = i === atual - 1 || (i === 0 && atual === 0)
            return (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                  ${ativa ? 'bg-accent text-white' : corrente ? 'bg-accent/20 text-accent border border-accent' : 'bg-bg border border-border text-text-3'}`}>
                  {ativa ? '✓' : i + 1}
                </div>
                <span className={`text-xs hidden sm:block ${ativa || corrente ? 'text-text font-medium' : 'text-text-3'}`}>{label}</span>
                {i < 3 && <div className={`flex-1 h-px ${ativa ? 'bg-accent' : 'bg-border'}`} />}
              </div>
            )
          })}
        </div>

        {/* Erro */}
        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-5">
            ⚠️ {erro}
          </div>
        )}

        {/* ETAPA: INÍCIO */}
        {etapa === ETAPAS.INICIO && (
          <div
            onClick={() => inputRef.current.click()}
            className="border-2 border-dashed border-border rounded-2xl p-12 text-center cursor-pointer hover:border-accent hover:bg-accent-light/10 transition-all group"
          >
            <div className="text-5xl mb-4">📷</div>
            <p className="text-text font-medium mb-1">Toque para tirar foto ou escolher da galeria</p>
            <p className="text-text-3 text-sm">Funciona com câmera do celular ou scanner</p>
            <p className="text-text-3 text-xs mt-3">JPG, PNG — até 10MB</p>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={e => handleArquivo(e.target.files[0])}
            />
          </div>
        )}

        {/* ETAPA: PREVIEW */}
        {etapa === ETAPAS.PREVIEW && (
          <div className="card p-0 overflow-hidden">
            <img src={imagemUrl} alt="Ficha escaneada" className="w-full max-h-96 object-contain bg-bg" />
            <div className="p-4 flex gap-3 justify-end border-t border-border">
              <button className="btn-outline" onClick={reiniciar}>Trocar foto</button>
              <button className="btn-primary" onClick={processarFicha}>
                ✨ Extrair dados com IA
              </button>
            </div>
          </div>
        )}

        {/* ETAPA: PROCESSANDO */}
        {etapa === ETAPAS.PROCESSANDO && (
          <div className="card text-center py-16">
            <div className="text-4xl mb-4 animate-bounce">🤖</div>
            <p className="text-text font-medium mb-2">Analisando a ficha...</p>
            <p className="text-text-3 text-sm">A IA está lendo os dados manuscritos</p>
            <div className="mt-6 flex justify-center gap-1">
              {[0,1,2].map(i => (
                <div key={i} className="w-2 h-2 bg-accent rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* ETAPA: REVISÃO */}
        {etapa === ETAPAS.REVISAO && (
          <div>
            <div className="bg-accent-light/30 border border-accent/30 rounded-xl px-4 py-3 text-sm text-accent mb-5">
              ✅ Dados extraídos! Revise e corrija o que for necessário antes de salvar.
            </div>

            {/* Miniatura da foto */}
            <div className="flex gap-4 mb-6 items-start">
              <img src={imagemUrl} alt="Ficha" className="w-24 h-24 object-cover rounded-xl border border-border flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-text">Ficha original</p>
                <p className="text-xs text-text-3 mt-1">Compare com os campos extraídos ao lado</p>
                <button className="text-xs text-accent underline mt-2" onClick={reiniciar}>
                  Usar outra foto
                </button>
              </div>
            </div>

            <div className="card flex flex-col gap-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-text-3">Dados do Paciente</p>

              <Campo label="Nome completo *">
                <input className="input" value={form.nome} onChange={e => f('nome', e.target.value)} />
              </Campo>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Campo label="CPF">
                  <input className="input" value={form.cpf} onChange={e => f('cpf', e.target.value)} />
                </Campo>
                <Campo label="Telefone">
                  <input className="input" value={form.telefone} onChange={e => f('telefone', e.target.value)} />
                </Campo>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Campo label="Data de nascimento">
                  <input className="input" type="date" value={form.data_nascimento} onChange={e => f('data_nascimento', e.target.value)} />
                </Campo>
                <Campo label="Estado civil">
                  <select className="input" value={form.estado_civil} onChange={e => f('estado_civil', e.target.value)}>
                    <option value="">—</option>
                    {['Solteiro(a)','Casado(a)','Divorciado(a)','Viúvo(a)','União estável'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </Campo>
              </div>

              <Campo label="Profissão">
                <input className="input" value={form.profissao} onChange={e => f('profissao', e.target.value)} />
              </Campo>

              <Campo label="Endereço">
                <input className="input" value={form.endereco} onChange={e => f('endereco', e.target.value)} />
              </Campo>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Campo label="Modalidade">
                  <select className="input" value={form.modalidade} onChange={e => f('modalidade', e.target.value)}>
                    <option value="">—</option>
                    {['Fisioterapia','Pilates','Ambos'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </Campo>
                <Campo label="Tipo de pagamento">
                  <select className="input" value={form.pagamento_tipo} onChange={e => f('pagamento_tipo', e.target.value)}>
                    <option value="">—</option>
                    {['Particular','Convênio','Ambos'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </Campo>
              </div>

              <Campo label="Diagnóstico médico">
                <input className="input" value={form.diagnostico_medico} onChange={e => f('diagnostico_medico', e.target.value)} />
              </Campo>

              <Campo label="Queixa principal">
                <textarea className="input min-h-[80px]" value={form.queixa_principal} onChange={e => f('queixa_principal', e.target.value)} />
              </Campo>

              <Campo label="Medicações em uso">
                <textarea className="input min-h-[60px]" value={form.medicacao} onChange={e => f('medicacao', e.target.value)} />
              </Campo>

              <Campo label="Alergias">
                <input className="input" value={form.alergia} onChange={e => f('alergia', e.target.value)} />
              </Campo>
            </div>

            {erro && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mt-4">
                ⚠️ {erro}
              </div>
            )}

            <div className="flex gap-3 mt-5 justify-end">
              <button className="btn-outline" onClick={reiniciar}>Cancelar</button>
              <button className="btn-primary" onClick={salvar} disabled={salvando || !form.nome}>
                {salvando ? 'Salvando...' : '✓ Salvar paciente'}
              </button>
            </div>
          </div>
        )}

        {/* ETAPA: SUCESSO */}
        {etapa === ETAPAS.SUCESSO && (
          <div className="card text-center py-16">
            <div className="text-5xl mb-4">🎉</div>
            <p className="text-text font-semibold text-lg mb-2">Paciente cadastrado com sucesso!</p>
            <p className="text-text-3 text-sm mb-8">A ficha foi digitalizada e salva no sistema.</p>
            <div className="flex gap-3 justify-center">
              <button className="btn-outline" onClick={reiniciar}>Importar outra ficha</button>
              <a href="/pacientes" className="btn-primary">Ver pacientes</a>
            </div>
          </div>
        )}

      </div>
    </Layout>
  )
}
