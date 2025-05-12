import React from 'react';
import { Outlet } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { Settings, Users, FileText, ChevronFirst as FirstAid } from 'lucide-react';

const Configuracion: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Configuración</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar de navegación */}
          <div className="md:w-64 bg-gray-50 md:border-r border-gray-200">
            <nav className="p-4">
              <ul className="space-y-2">
                <li>
                  <NavLink
                    to="/admin/configuracion"
                    end
                    className={({ isActive }) =>
                      `flex items-center px-4 py-2 rounded-md transition-colors ${
                        isActive
                          ? 'bg-teal-500 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`
                    }
                  >
                    <Settings size={18} className="mr-2" />
                    General
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/admin/configuracion/artistas"
                    className={({ isActive }) =>
                      `flex items-center px-4 py-2 rounded-md transition-colors ${
                        isActive
                          ? 'bg-teal-500 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`
                    }
                  >
                    <Users size={18} className="mr-2" />
                    Artistas
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/admin/configuracion/cuidados"
                    className={({ isActive }) =>
                      `flex items-center px-4 py-2 rounded-md transition-colors ${
                        isActive
                          ? 'bg-teal-500 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`
                    }
                  >
                    <FirstAid size={18} className="mr-2" />
                    Cuidados
                  </NavLink>
                </li>
              </ul>
            </nav>
          </div>
          
          {/* Contenido principal */}
          <div className="flex-1 p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuracion;