import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AdminPage } from '../views/AdminPage'
import { EventDetailPage } from '../views/EventDetailPage'
import { EventsPage } from '../views/EventsPage'
import { LandingPage } from '../views/LandingPage'
import { SuperAdminPage } from '../views/SuperAdminPage'

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/events/:id" element={<EventDetailPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/superadmin" element={<SuperAdminPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
)
