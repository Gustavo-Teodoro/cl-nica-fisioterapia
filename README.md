# Sistema de Gerenciamento — Clínica Fisioterapia & Pilates
## Dra. Fernanda Rodrigues Teodoro

---

## O que há de novo nesta versão

### ✅ Bugs corrigidos
- **Erro 500 no financeiro** — `from django.db.models import Sum` duplicado dentro da view removido
- **URL `mes=3:1`** — `api.js` tinha funções duplicadas causando concatenação inválida; corrigido com parse seguro
- **CATEGORIA_CHOICES duplicado** — `Outros` aparecia duas vezes no model; corrigido

### 🆕 Funcionalidades adicionadas

1. **Check-in de presença** (Pergunta 5 e 6 da entrevista)
   - Agendamentos agora têm status `Realizado` e `Faltou`
   - Na agenda, ao clicar em um paciente aparecem os botões "Marcar como Realizado" e "Marcar Faltou"
   - Ao marcar como Realizado: atualiza `ultimo_atendimento` do paciente automaticamente

2. **Controle de pacotes de sessões** (Pergunta 7)
   - Novo model `Pacote` vinculado ao paciente
   - Na ficha do paciente: seção "Pacotes de Sessões" com barra de progresso visual
   - Ao fazer check-in como Realizado: desconta automaticamente uma sessão do pacote ativo
   - Quando o pacote encerra, status muda para `Encerrado` automaticamente

3. **Dashboard com alertas inteligentes** (Pergunta 10)
   - Novo menu "Dashboard" acessível por todos os perfis
   - Alertas automáticos para:
     - 🚨 Pacotes vencidos (urgente)
     - ⚠️ Pacotes com menos de 20% de sessões restantes
     - ⚠️ Pagamentos pendentes há mais de 7 dias
   - Resumo financeiro do mês com saldo
   - Agenda do dia resumida

4. **Relatório de fechamento mensal** (Pergunta 8)
   - Nova aba "Relatório" no Financeiro
   - Mostra: atendimentos realizados vs receitas recebidas vs pendentes vs despesas
   - Saldo final do período

5. **Importar ficha com IA** (digitalização de papel)
   - Novo menu "Importar" na navegação
   - Tira foto da ficha de papel pelo celular
   - IA extrai os dados automaticamente
   - Revisão antes de salvar
   - Requer chave da API Anthropic (ver configuração abaixo)

---

## Instalação e configuração

### 1. Dependências Python
```bash
pip install django djangorestframework django-cors-headers whitenoise anthropic
```

### 2. Atualizar banco de dados
```bash
python manage.py migrate
```

### 3. Configurar chave da Anthropic (para importar fichas)
No arquivo `clinica/settings.py`, adicione sua chave:
```python
ANTHROPIC_API_KEY = 'sk-ant-...'
```
Ou via variável de ambiente (recomendado):
```bash
export ANTHROPIC_API_KEY=sk-ant-...
```
Obtenha sua chave em: https://console.anthropic.com/

### 4. Build do frontend
```bash
cd frontend
npm install
npm run build
cd ..
```

### 5. Iniciar o servidor
```bash
python manage.py runserver
```

---

## Estrutura do projeto

```
projeto/
├── api/
│   ├── models.py         ← Paciente, Agendamento, Pacote, Lancamento, Evolucao, ExamePDF, Usuario
│   ├── serializers.py    ← Serializers de todos os models
│   ├── views.py          ← Todas as views + check-in + pacotes + importar ficha
│   ├── urls.py           ← Todas as rotas da API
│   └── migrations/       ← 0001 a 0006
├── clinica/
│   ├── settings.py       ← Configurações + ANTHROPIC_API_KEY
│   └── urls.py
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Dashboard.jsx      ← NOVO: alertas e resumo
│       │   ├── Pacientes.jsx      ← Atualizado: check-in na agenda
│       │   ├── FichaPaciente.jsx  ← Atualizado: seção de pacotes
│       │   ├── Financeiro.jsx     ← Atualizado: aba relatório
│       │   ├── ImportarFicha.jsx  ← NOVO: digitalização com IA
│       │   ├── Evolucoes.jsx
│       │   └── Configuracoes.jsx
│       ├── components/
│       │   ├── Layout.jsx         ← Atualizado: novos menus
│       │   └── Modal.jsx
│       └── services/
│           └── api.js             ← Corrigido: sem duplicatas
└── manage.py
```

---

## Perfis de acesso

| Perfil | Agenda | Pacientes | Financeiro | Dashboard | Importar | Config |
|--------|--------|-----------|------------|-----------|----------|--------|
| admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| clinica | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| contador | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
