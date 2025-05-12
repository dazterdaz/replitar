import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useConfig } from '../contexts/ConfigContext';
import { 
  LayoutDashboard, 
  FileText, 
  Archive, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const AdminLayout: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { config } = useConfig();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile && !sidebarOpen) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar superior */}
      <nav className="bg-white shadow-sm px-4 py-2 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center">
          <button 
            onClick={toggleMobileMenu} 
            className="mr-2 block md:hidden hover:bg-gray-100 p-1 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <span className="font-semibold text-lg truncate">
            {config.nombreEstudio} - Panel de Administración
          </span>
        </div>
        <div className="flex items-center">
          <span className="mr-4 hidden md:block text-gray-600">
            ¡Hola, {currentUser?.usuario}!
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center text-gray-600 hover:text-red-500 hover:bg-gray-100 px-2 py-1 rounded-lg transition-colors"
          >
            <LogOut size={18} className="mr-1" />
            <span className="hidden md:inline">Cerrar sesión</span>
          </button>
        </div>
      </nav>

      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <aside 
          className={`
            bg-white shadow-md h-[calc(100vh-3.5rem)] z-20 transition-all duration-300 ease-in-out
            ${isMobile 
              ? `fixed transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`
              : 'relative transform-none'
            }
            ${sidebarOpen && !isMobile ? 'w-64' : 'w-16'}
          `}
        >
          {/* Botón para contraer/expandir en desktop */}
          {!isMobile && (
            <button
              onClick={toggleSidebar}
              className="absolute -right-3 top-4 bg-white rounded-full p-1 shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
          )}

          <div className="py-4 px-4 h-full overflow-y-auto">
            <h2 className={`text-xl font-bold text-gray-800 mb-6 border-b pb-2 transition-opacity duration-200 ${
              sidebarOpen || isMobile ? 'opacity-100' : 'opacity-0'
            }`}>
              Menú de Administración
            </h2>
            <ul className="space-y-2">
              <li>
                <NavLink
                  to="/admin"
                  end
                  className={({ isActive }) =>
                    `flex items-center py-2 px-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-teal-500 text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard size={18} className={sidebarOpen || isMobile ? "mr-2" : "mx-auto"} />
                  <span className={`transition-opacity duration-200 ${
                    sidebarOpen || isMobile ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
                  }`}>
                    Dashboard
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/consentimientos"
                  className={({ isActive }) =>
                    `flex items-center py-2 px-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-teal-500 text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FileText size={18} className={sidebarOpen || isMobile ? "mr-2" : "mx-auto"} />
                  <span className={`transition-opacity duration-200 ${
                    sidebarOpen || isMobile ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
                  }`}>
                    Consentimientos
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/archivados"
                  className={({ isActive }) =>
                    `flex items-center py-2 px-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-teal-500 text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Archive size={18} className={sidebarOpen || isMobile ? "mr-2" : "mx-auto"} />
                  <span className={`transition-opacity duration-200 ${
                    sidebarOpen || isMobile ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
                  }`}>
                    Archivados
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/configuracion"
                  className={({ isActive }) =>
                    `flex items-center py-2 px-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-teal-500 text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Settings size={18} className={sidebarOpen || isMobile ? "mr-2" : "mx-auto"} />
                  <span className={`transition-opacity duration-200 ${
                    sidebarOpen || isMobile ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
                  }`}>
                    Configuración
                  </span>
                </NavLink>
              </li>
            </ul>
          </div>
        </aside>

        {/* Overlay para cerrar sidebar en móvil */}
        {mobileMenuOpen && isMobile && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-10"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Contenido principal */}
        <main className={`flex-1 p-4 transition-all duration-300 min-h-[calc(100vh-3.5rem)] ${
          sidebarOpen && !isMobile ? 'md:pl-6' : 'md:pl-20'
        }`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;