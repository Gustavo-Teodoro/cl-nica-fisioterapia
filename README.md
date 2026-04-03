# 🏥 Clínica Fisioterapia & Pilates

> Sistema web completo para gestão de clínica de fisioterapia e pilates — desenvolvido com Django + React, responsivo e otimizado para uso no celular.

---

## ✨ Funcionalidades

- **Agenda** — Calendário mensal com agendamentos, check-in de presença e registro de faltas
- **Pacientes** — Ficha clínica completa com histórico de saúde, evoluções e exames em PDF
- **Pacotes de sessões** — Controle de sessões contratadas com barra de progresso e alertas automáticos
- **Financeiro** — Lançamentos de receitas e despesas, relatório mensal e controle de pendentes
- **Importar ficha** — Fotografe uma ficha de papel e a IA preenche o cadastro automaticamente
- **Controle de acesso** — Perfis distintos para clínica, financeiro e administrador

---

## 🚀 Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | Django 4.2 + Django REST Framework |
| Frontend | React 18 + Tailwind CSS + Vite |
| Banco de dados | SQLite |
| IA | Google Gemini 1.5 Flash |

---

## 🖥️ Como rodar o projeto

Escolha a forma que preferir:

---

### ▶️ Opção 1 — GitHub Codespaces (recomendado, sem instalar nada)

A forma mais rápida de rodar o projeto direto no navegador, sem precisar instalar nada na sua máquina.

**1.** Acesse o repositório no GitHub e clique em **`<> Code`** → aba **Codespaces** → **"Create codespace on main"**

**2.** Aguarde o ambiente carregar. No terminal que abrir, rode:
```bash
python manage.py runserver
```

**3.** Abra um **segundo terminal** clicando no **`+`** e rode:
```bash
python manage.py shell
```
Cole o seguinte e pressione Enter:
```python
from api.models import Usuario
import hashlib
Usuario.objects.create(usuario='admin', senha=hashlib.sha256(b'admin').hexdigest(), nome='Administrador', perfil='admin')
exit()
```

**4.** Na aba **PORTS**, clique no link da porta **8000** para abrir o sistema no navegador.

**5.** Faça login com as credenciais:

> **Usuário:** `admin` &nbsp;|&nbsp; **Senha:** `admin`

> ⚠️ O usuário precisa ser criado apenas uma vez por Codespace. Se você fechar e reabrir o mesmo Codespace, ele já estará lá.

---

### 💻 Opção 2 — Rodando localmente

#### Requisitos
- Python 3.10+
- Node.js 18+

#### Passo a passo

**1. Clone o repositório:**
```bash
git clone https://github.com/Gustavo-Teodoro/clinica-fisioterapia.git
cd clinica-fisioterapia
```

**2. Crie e ative o ambiente virtual:**
```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

# Mac/Linux
source .venv/bin/activate
```

**3. Instale as dependências do backend:**
```bash
pip install -r requirements.txt
```

**4. Configure as variáveis de ambiente:**

Crie um arquivo `.env` na raiz do projeto:
```
SECRET_KEY=sua-secret-key
GEMINI_API_KEY=sua-chave-gemini
```

> A chave do Gemini é necessária apenas para a função de importar fichas. Obtenha gratuitamente em [aistudio.google.com](https://aistudio.google.com).

**5. Inicialize o banco de dados:**
```bash
python manage.py migrate
```

**6. Crie um usuário administrador:**
```bash
python manage.py shell
```
Cole o seguinte e pressione Enter:
```python
from api.models import Usuario
import hashlib
Usuario.objects.create(usuario='admin', senha=hashlib.sha256(b'admin').hexdigest(), nome='Administrador', perfil='admin')
exit()
```

**7. Build do frontend:**
```bash
cd frontend
npm install
npm run build
cd ..
```

**8. Inicie o servidor:**
```bash
python manage.py runserver
```

Acesse em: [http://127.0.0.1:8000](http://127.0.0.1:8000)

> **Usuário:** `admin` &nbsp;|&nbsp; **Senha:** `admin`

---

## 🔐 Perfis de acesso

| Perfil | Agenda | Pacientes | Financeiro | Dashboard | Importar | Configurações |
|--------|:------:|:---------:|:----------:|:---------:|:--------:|:-------------:|
| Administrador | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Clínica | ✅ | ✅ | — | ✅ | ✅ | — |
| Contador | — | — | ✅ | ✅ | — | — |

---

## 📁 Estrutura do projeto

```
clinica-fisioterapia/
├── api/                  # App Django — models, views, serializers
│   ├── models.py         # Entidades do sistema
│   ├── views.py          # Endpoints da API REST
│   └── serializers.py    
├── clinica/              # Configurações do projeto Django
├── frontend/             # Aplicação React
│   └── src/
│       ├── pages/        # Páginas da aplicação
│       ├── components/   # Componentes reutilizáveis
│       └── services/     # Chamadas à API
├── staticfiles/          # Frontend compilado (servido pelo Django)
├── manage.py
└── requirements.txt
```

---

## 👨‍💻 Autor

Desenvolvido por **Gustavo Teodoro**

[![GitHub](https://img.shields.io/badge/GitHub-Gustavo--Teodoro-181717?logo=github)](https://github.com/Gustavo-Teodoro)