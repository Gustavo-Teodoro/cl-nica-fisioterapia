import { Routes, Route, Navigate } from 'react-router-dom'
import Login          from './pages/Login'
import Pacientes      from './pages/Pacientes'
import FichaPaciente  from './pages/FichaPaciente'
import Configuracoes  from './pages/Configuracoes'
import Evolucoes      from './pages/Evolucoes'
import Financeiro     from './pages/Financeiro'
import ImportarFicha  from './pages/ImportarFicha'
import Dashboard      from './pages/Dashboard'

function RotaProtegida({ children }) {
  const auth = localStorage.getItem('auth')
  return auth ? children : <Navigate to="/login" replace />
}

function RotaAdmin({ children }) {
  const auth = localStorage.getItem('auth')
  if (!auth) return <Navigate to="/login" replace />
  const { perfil } = JSON.parse(auth)
  return perfil === 'admin' ? children : <Navigate to="/agenda" replace />
}

function RotaFinanceiro({ children }) {
  const auth = localStorage.getItem('auth')
  if (!auth) return <Navigate to="/login" replace />
  const { perfil } = JSON.parse(auth)
  return (perfil === 'admin' || perfil === 'contador') ? children : <Navigate to="/agenda" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login"                       element={<Login />} />
      <Route path="/"                            element={<Navigate to="/agenda" replace />} />
      <Route path="/agenda"                      element={<RotaProtegida><Pacientes /></RotaProtegida>} />
      <Route path="/pacientes/:id"               element={<RotaProtegida><FichaPaciente /></RotaProtegida>} />
      <Route path="/pacientes/:id/evolucoes"     element={<RotaProtegida><Evolucoes /></RotaProtegida>} />
      <Route path="/financeiro"                  element={<RotaFinanceiro><Financeiro /></RotaFinanceiro>} />
      <Route path="/configuracoes"               element={<RotaAdmin><Configuracoes /></RotaAdmin>} />
      <Route path="/importar-ficha"              element={<RotaProtegida><ImportarFicha /></RotaProtegida>} />
      <Route path="/dashboard"                   element={<RotaProtegida><Dashboard /></RotaProtegida>} />
      <Route path="*"                            element={<Navigate to="/agenda" replace />} />
    </Routes>
  )
}
