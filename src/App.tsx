import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Providers
import { AuthProvider } from './contexts/AuthContext';
import { ConfigProvider } from './contexts/ConfigContext';
import { ConsentimientosProvider } from './contexts/ConsentimientosContext';

// Pages
import Landing from './pages/Landing';
import FormularioConsentimiento from './pages/FormularioConsentimiento';
import ExitoFormulario from './pages/ExitoFormulario';
import Login from './pages/admin/Login';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Consentimientos from './pages/admin/Consentimientos';
import ConsentimientoDetalle from './pages/admin/ConsentimientoDetalle';
import ConsentimientosArchivados from './pages/admin/ConsentimientosArchivados';
import Configuracion from './pages/admin/Configuracion';
import Artistas from './pages/admin/Artistas';
import VistaConfiguracion from './pages/admin/VistaConfiguracion';
import CuidadosTatuajes from './pages/admin/CuidadosTatuajes';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <ConfigProvider>
        <ConsentimientosProvider>
          <Router>
            <Routes>
              {/* Rutas públicas */}
              <Route path="/" element={<Landing />} />
              <Route path="/formulario" element={<FormularioConsentimiento />} />
              <Route path="/exito" element={<ExitoFormulario />} />
              <Route path="/admin/login" element={<Login />} />
              
              {/* Rutas protegidas de administración */}
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="consentimientos" element={<Consentimientos />} />
                <Route path="consentimientos/:id" element={<ConsentimientoDetalle />} />
                <Route path="archivados" element={<ConsentimientosArchivados />} />
                <Route path="configuracion" element={<Configuracion />}>
                  <Route index element={<VistaConfiguracion />} />
                  <Route path="artistas" element={<Artistas />} />
                  <Route path="cuidados" element={<CuidadosTatuajes />} />
                </Route>
              </Route>
              
              {/* Página 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </ConsentimientosProvider>
      </ConfigProvider>
    </AuthProvider>
  );
}

export default App;