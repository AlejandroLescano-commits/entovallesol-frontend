import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import Layout from '@/components/layout/Layout'
import LoginPage from '@/pages/auth/LoginPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import SitotrogaPage from '@/pages/produccion/SitotrogaPage'
import TrichogrammaPage from '@/pages/produccion/TrichogrammaPage'
import GalleriaPage from '@/pages/produccion/GalleriaPage'
import ParathesiaPage from '@/pages/produccion/ParathesiaPage'
import DistribucionPage from '@/pages/distribucion/DistribucionPage'
import InventarioPage from '@/pages/inventario/InventarioPage'
import ReportesPage from '@/pages/reportes/ReportesPage'
import ImportacionPage from '@/pages/importacion/ImportacionPage'
import UsuariosPage from '@/pages/usuarios/UsuariosPage'
import ConfiguracionPage from '@/pages/configuracion/ConfiguracionPage'
import PrediccionPage from '@/pages/prediccion/PrediccionPage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"               element={<DashboardPage />} />
        <Route path="produccion/sitotroga"    element={<SitotrogaPage />} />
        <Route path="produccion/trichogramma" element={<TrichogrammaPage />} />
        <Route path="produccion/galleria"     element={<GalleriaPage />} />
        <Route path="produccion/paratheresia" element={<ParathesiaPage />} />
        <Route path="distribucion"            element={<DistribucionPage />} />
        <Route path="inventario"              element={<InventarioPage />} />
        <Route path="reportes"                element={<ReportesPage />} />
        <Route path="importacion"             element={<ImportacionPage />} />
        <Route path="usuarios"                element={<UsuariosPage />} />
        <Route path="configuracion"           element={<ConfiguracionPage />} />
        <Route path="prediccion"              element={<PrediccionPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}