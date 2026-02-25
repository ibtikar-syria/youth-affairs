import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { SiteFooter } from '../components/SiteFooter'
import { AdminPage } from '../views/AdminPage'
import { BranchesPage } from '../views/BranchesPage'
import { EventDetailPage } from '../views/EventDetailPage'
import { EventsPage } from '../views/EventsPage'
import { LandingPage } from '../views/LandingPage'
import { LoginPage } from '../views/LoginPage'
import { SuperAdminPage } from '../views/SuperAdminPage'

export const AppRouter = () => (
  <BrowserRouter>
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/branches" element={<BranchesPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/superadmin" element={<SuperAdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <SiteFooter />
    </div>
  </BrowserRouter>
)
