import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AdminPage } from '../views/AdminPage'
import { LandingPage } from '../views/LandingPage'
import { SuperAdminPage } from '../views/SuperAdminPage'

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/superadmin" element={<SuperAdminPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
)
