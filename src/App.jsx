import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthPage from './pages/AuthPage'
import WorkspacePage from './pages/WorkspacePage'
import DashboardPage from './pages/DashboardPage'

function App() {

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/workspace/:documentId" element={<WorkspacePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
