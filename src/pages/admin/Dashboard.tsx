import React from 'react';
import { useConsentimientos } from '../../contexts/ConsentimientosContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { Users, User, FileText, Calendar } from 'lucide-react';
import ErrorMessageSupabase from '../../components/ErrorMessageSupabase';

const Dashboard: React.FC = () => {
  const { getEstadisticas, consentimientos, connectionError } = useConsentimientos();
  const estadisticas = getEstadisticas();
  
  // Colores para gráficos
  const COLORS = ['#2DD4BF', '#0D9488', '#0F766E', '#134E4A', '#064E3B'];
  
  // Transformar datos para gráfico de pie
  const dataPie = [
    { name: 'Mayores de edad', value: estadisticas.mayoresEdad || 0 },
    { name: 'Menores de edad', value: estadisticas.menoresEdad || 0 }
  ];

  if (connectionError) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
        <ErrorMessageSupabase onRetry={() => window.location.reload()} />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-2">
            <div className="bg-teal-100 p-3 rounded-full mr-3">
              <FileText className="text-teal-500" size={22} />
            </div>
            <h2 className="text-lg font-medium text-gray-800">Total Formularios</h2>
          </div>
          <p className="text-3xl font-bold text-gray-900">{estadisticas.totalFormularios || 0}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-2">
            <div className="bg-teal-100 p-3 rounded-full mr-3">
              <Users className="text-teal-500" size={22} />
            </div>
            <h2 className="text-lg font-medium text-gray-800">Edad Clientes</h2>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Mayores</p>
              <p className="text-2xl font-bold text-gray-900">{estadisticas.mayoresEdad || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Menores</p>
              <p className="text-2xl font-bold text-gray-900">{estadisticas.menoresEdad || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-2">
            <div className="bg-teal-100 p-3 rounded-full mr-3">
              <User className="text-teal-500" size={22} />
            </div>
            <h2 className="text-lg font-medium text-gray-800">Top Artista</h2>
          </div>
          {estadisticas.artistasStats?.length > 0 ? (
            <>
              <p className="text-xl font-bold text-gray-900">{estadisticas.artistasStats[0].nombre}</p>
              <p className="text-sm text-gray-500">{estadisticas.artistasStats[0].totalClientes} clientes</p>
            </>
          ) : (
            <p className="text-lg text-gray-500">No hay datos</p>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-2">
            <div className="bg-teal-100 p-3 rounded-full mr-3">
              <Calendar className="text-teal-500" size={22} />
            </div>
            <h2 className="text-lg font-medium text-gray-800">Último Mes</h2>
          </div>
          {estadisticas.porMes?.length > 0 ? (
            <>
              <p className="text-xl font-bold text-gray-900">
                {estadisticas.porMes[estadisticas.porMes.length - 1].cantidad}
              </p>
              <p className="text-sm text-gray-500">formularios</p>
            </>
          ) : (
            <p className="text-lg text-gray-500">No hay datos</p>
          )}
        </div>
      </div>
      
      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de barras por mes */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Formularios por Mes</h2>
          <div className="h-72">
            {estadisticas.porMes?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={estadisticas.porMes}
                  margin={{ top: 10, right: 10, left: 10, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="mes" 
                    angle={-45} 
                    textAnchor="end" 
                    height={70} 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="cantidad" fill="#2DD4BF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">No hay datos disponibles</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Gráfico de torta por edad */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Distribución por Edad</h2>
          <div className="h-72">
            {(estadisticas.mayoresEdad || estadisticas.menoresEdad) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataPie}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {dataPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">No hay datos disponibles</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Estadísticas por artista */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Estadísticas por Artista</h2>
        
        {estadisticas.artistasStats?.length > 0 ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={estadisticas.artistasStats}
                layout="vertical"
                margin={{ top: 10, right: 10, left: 100, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" />
                <YAxis dataKey="nombre" type="category" tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="totalClientes" fill="#0F766E" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="p-10 text-center">
            <p className="text-gray-500">No hay datos disponibles</p>
          </div>
        )}
      </div>
      
      {/* Consentimientos recientes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Consentimientos Recientes</h2>
        
        {consentimientos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Artista
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Edad
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {consentimientos.slice(0, 5).map((consentimiento) => (
                  <tr key={consentimiento.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {consentimiento.cliente?.nombre} {consentimiento.cliente?.apellidos}
                      </div>
                      <div className="text-sm text-gray-500">
                        {consentimiento.cliente?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(parseISO(consentimiento.fechaCreacion), 'dd/MM/yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {consentimiento.artistaSeleccionado}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        consentimiento.cliente?.edad >= 18 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {consentimiento.cliente?.edad || 0} años
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-10 text-center">
            <p className="text-gray-500">No hay consentimientos registrados</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;