import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useConsentimientos } from '../../contexts/ConsentimientosContext';
import { format, parseISO, isWithinInterval, subDays, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, Eye, Download, Filter, Calendar, User, X, FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { formatRut } from '../../utils/formatters';
import { useConfig } from '../../contexts/ConfigContext';
import ErrorMessageSupabase from '../../components/ErrorMessageSupabase';
import { objectsToCsv, downloadCsv, getFormattedDateForFilename } from '../../utils/csvExport';

// Lista fija de preguntas de salud
const PREGUNTAS_SALUD = [
  '¿Comiste en las últimas 4 horas?',
  '¿Tienes alergias?',
  '¿Tienes hemofilia?',
  '¿Has tomado aspirina en los últimos 5 días?',
  '¿Tienes hepatitis?',
  '¿Tienes mala cicatrización?',
  '¿Vives con VIH?',
  '¿Tienes problemas de salud?',
  '¿Estás en tratamiento médico?',
  '¿Tienes tendencia a desmayarte?',
  '¿Fumas?',
  '¿Bebes alcohol?',
  '¿Bebiste en las últimas 3 horas?',
  '¿Consumes drogas?',
  '¿Tienes problemas dermatológicos?',
  '¿Tu piel produce queloides?',
  '¿Es tu primer tatuaje?'
];

const ConsentimientosArchivados: React.FC = () => {
  const { consentimientosArchivados, connectionError } = useConsentimientos();
  const { config } = useConfig();
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroAbierto, setFiltroAbierto] = useState(false);
  
  // Estados para filtros avanzados
  const [filtroArtista, setFiltroArtista] = useState<string>('');
  const [filtroFechaDesde, setFiltroFechaDesde] = useState<string>('');
  const [filtroFechaHasta, setFiltroFechaHasta] = useState<string>('');
  const [filtroEdad, setFiltroEdad] = useState<'todos' | 'mayores' | 'menores'>('todos');

  // Función auxiliar para verificar si una fecha está dentro de un rango
  const estaEnRango = (fecha: string) => {
    if (!filtroFechaDesde && !filtroFechaHasta) return true;
    
    try {
      const fechaConsentimiento = parseISO(fecha);
      
      if (filtroFechaDesde && filtroFechaHasta) {
        return isWithinInterval(fechaConsentimiento, {
          start: startOfDay(parseISO(filtroFechaDesde)),
          end: endOfDay(parseISO(filtroFechaHasta))
        });
      }
      
      if (filtroFechaDesde) {
        return fechaConsentimiento >= startOfDay(parseISO(filtroFechaDesde));
      }
      
      if (filtroFechaHasta) {
        return fechaConsentimiento <= endOfDay(parseISO(filtroFechaHasta));
      }
      
      return true;
    } catch (error) {
      console.error('Error al comparar fechas:', error);
      return true;
    }
  };

  // Inicializar fechas para filtros rápidos
  const inicializarFiltroUltimos30Dias = () => {
    const hoy = new Date();
    const hace30Dias = subDays(hoy, 30);
    setFiltroFechaDesde(format(hace30Dias, 'yyyy-MM-dd'));
    setFiltroFechaHasta(format(hoy, 'yyyy-MM-dd'));
  };

  const inicializarFiltroUltimos7Dias = () => {
    const hoy = new Date();
    const hace7Dias = subDays(hoy, 7);
    setFiltroFechaDesde(format(hace7Dias, 'yyyy-MM-dd'));
    setFiltroFechaHasta(format(hoy, 'yyyy-MM-dd'));
  };

  const limpiarFiltros = () => {
    setFiltroArtista('');
    setFiltroFechaDesde('');
    setFiltroFechaHasta('');
    setFiltroEdad('todos');
    setSearchTerm('');
  };
  
  // Filtrar consentimientos
  const filteredConsentimientos = consentimientosArchivados.filter(
    (consentimiento) => {
      // Filtro por texto general (nombre, RUT, email, código)
      const searchString = searchTerm.toLowerCase();
      const nombreCompleto = `${consentimiento.cliente.nombre} ${consentimiento.cliente.apellidos}`.toLowerCase();
      const matchesSearch = searchTerm === '' || 
        nombreCompleto.includes(searchString) ||
        consentimiento.cliente.rut.toLowerCase().includes(searchString) ||
        consentimiento.cliente.email.toLowerCase().includes(searchString) ||
        consentimiento.codigo.toLowerCase().includes(searchString);
      
      // Filtro por artista
      const matchesArtista = filtroArtista === '' || consentimiento.artistaSeleccionado === filtroArtista;
      
      // Filtro por fecha
      const matchesFecha = estaEnRango(consentimiento.fechaCreacion);
      
      // Filtro por edad
      const matchesEdad = 
        filtroEdad === 'todos' || 
        (filtroEdad === 'mayores' && consentimiento.cliente.edad >= 18) ||
        (filtroEdad === 'menores' && consentimiento.cliente.edad < 18);
      
      return matchesSearch && matchesArtista && matchesFecha && matchesEdad;
    }
  );
  
  // Generar PDF
  const generarPDF = (consentimiento: any) => {
    const pdf = new jsPDF();
    const margen = 20;
    let y = margen;
    
    // Configuraciones
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    
    // Titulo y datos del estudio
    pdf.text(`${config.nombreEstudio}`, 105, y, { align: 'center' });
    y += 8;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${config.direccionEstudio}`, 105, y, { align: 'center' });
    y += 15;
    
    // Información del formulario
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('FORMULARIO DE CONSENTIMIENTO PARA TATUAJE', 105, y, { align: 'center' });
    y += 10;
    
    // Fecha
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Fecha: ${format(parseISO(consentimiento.fechaCreacion), 'dd/MM/yyyy')}`, margen, y);
    y += 10;
    
    // Datos del cliente
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DATOS DEL CLIENTE', margen, y);
    y += 7;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Nombre: ${consentimiento.cliente.nombre} ${consentimiento.cliente.apellidos}`, margen, y);
    y += 5;
    pdf.text(`RUT/Pasaporte: ${formatRut(consentimiento.cliente.rut)}`, margen, y);
    y += 5;
    pdf.text(`Edad: ${consentimiento.cliente.edad} años`, margen, y);
    y += 5;
    pdf.text(`Fecha de Nacimiento: ${format(new Date(consentimiento.cliente.fechaNacimiento), 'dd/MM/yyyy')}`, margen, y);
    y += 5;
    pdf.text(`Dirección: ${consentimiento.cliente.direccion.calle}, ${consentimiento.cliente.direccion.comuna}, ${consentimiento.cliente.direccion.region}`, margen, y);
    y += 5;
    pdf.text(`Teléfono: ${consentimiento.cliente.telefono}`, margen, y);
    y += 5;
    pdf.text(`Email: ${consentimiento.cliente.email}`, margen, y);
    y += 10;
    
    // Datos del tutor si es menor de edad
    if (consentimiento.cliente.edad < 18 && consentimiento.tutor) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DATOS DEL TUTOR LEGAL', margen, y);
      y += 7;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Nombre: ${consentimiento.tutor.nombre}`, margen, y);
      y += 5;
      pdf.text(`RUT: ${formatRut(consentimiento.tutor.rut)}`, margen, y);
      y += 5;
      const parentescoTexto = consentimiento.tutor.parentesco === 'Otro' 
        ? `${consentimiento.tutor.parentesco} (${consentimiento.tutor.otroParentesco})` 
        : consentimiento.tutor.parentesco;
      pdf.text(`Parentesco: ${parentescoTexto}`, margen, y);
      y += 10;
    }
    
    // Artista seleccionado
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ARTISTA A CARGO', margen, y);
    y += 7;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Artista: ${consentimiento.artistaSeleccionado}`, margen, y);
    y += 10;
    
    // Información de salud
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('INFORMACIÓN DE SALUD', margen, y);
    y += 7;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    // Mostrar preguntas de salud con sus respuestas
    const infoSalud = consentimiento.informacionSalud || {};
    
    PREGUNTAS_SALUD.forEach((pregunta, index) => {
      const infoRespuesta = infoSalud[index] || {};
      const respuesta = infoRespuesta.respuesta ? 'Sí' : 'No';
      const infoAdicional = infoRespuesta.informacionAdicional || '';
      
      let textoRespuesta = `${pregunta}: ${respuesta}`;
      if (infoAdicional) {
        textoRespuesta += ` (${infoAdicional})`;
      }
      
      // Verificar si hay espacio suficiente en la página actual, sino crear nueva
      if (y > 270) {
        pdf.addPage();
        y = margen;
      }
      
      const lineasRespuesta = pdf.splitTextToSize(textoRespuesta, 170);
      pdf.text(lineasRespuesta, margen, y);
      y += lineasRespuesta.length * 5;
    });
    
    // Nueva página para el consentimiento y firma
    pdf.addPage();
    y = margen;
    
    // Texto de consentimiento
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CONSENTIMIENTO GENERAL', margen, y);
    y += 7;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    const textoConsentimiento = config.textoConsentimiento
      .replace('{Nombre Cliente}', `${consentimiento.cliente.nombre} ${consentimiento.cliente.apellidos}`)
      .replace(/{Nombre Estudio}/g, config.nombreEstudio);
      
    const lineasConsentimiento = pdf.splitTextToSize(textoConsentimiento, 170);
    pdf.text(lineasConsentimiento, margen, y);
    y += lineasConsentimiento.length * 5 + 10;
    
    // Firma
    if (consentimiento.firma) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('FIRMA DEL CLIENTE', margen, y);
      y += 7;
      
      // Añadir la imagen de la firma
      try {
        pdf.addImage(consentimiento.firma, 'PNG', margen, y, 50, 20);
        y += 25;
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Fecha: ${format(parseISO(consentimiento.fechaCreacion), 'dd/MM/yyyy')}`, margen, y);
      } catch (e) {
        console.error('Error al añadir la firma al PDF:', e);
        pdf.text('Error al cargar la firma', margen, y);
      }
    }
    
    // Guardar el PDF
    pdf.save(`consentimiento_${consentimiento.cliente.nombre}_${format(parseISO(consentimiento.fechaCreacion), 'yyyyMMdd')}.pdf`);
  };

  // Exportar datos de clientes a CSV
  const exportarClientesCSV = () => {
    // Preparar los datos para exportar (solo los campos solicitados)
    const datosClientes = filteredConsentimientos.map(consentimiento => ({
      nombre: consentimiento.cliente.nombre,
      apellidos: consentimiento.cliente.apellidos,
      email: consentimiento.cliente.email,
      telefono: consentimiento.cliente.telefono
    }));

    // Definir las cabeceras del CSV
    const headers = {
      nombre: 'Nombre',
      apellidos: 'Apellidos',
      email: 'Email',
      telefono: 'Teléfono'
    };

    // Convertir a CSV y descargar
    const csvContent = objectsToCsv(datosClientes, headers);
    const fechaArchivo = getFormattedDateForFilename();
    downloadCsv(csvContent, `clientes_archivados_${fechaArchivo}`);
  };

  if (connectionError) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Consentimientos Archivados</h1>
        <ErrorMessageSupabase onRetry={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Consentimientos Archivados</h1>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFiltroAbierto(!filtroAbierto)}
            className={`p-2 rounded-md ${filtroAbierto ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-700'}`}
            title="Mostrar/ocultar filtros avanzados"
          >
            <Filter size={20} />
          </button>
          
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 block w-full"
              placeholder="Buscar por nombre, RUT, email, código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* Filtros avanzados */}
      {filtroAbierto && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6 animate-fadeIn">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-700">Filtros Avanzados</h3>
            <button
              onClick={limpiarFiltros}
              className="text-sm text-teal-600 hover:text-teal-800"
            >
              Limpiar filtros
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtro por artista */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center">
                  <User size={16} className="mr-1" />
                  Artista
                </div>
              </label>
              <select
                value={filtroArtista}
                onChange={(e) => setFiltroArtista(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">Todos los artistas</option>
                {Array.from(new Set(consentimientosArchivados.map(c => c.artistaSeleccionado)))
                  .filter(Boolean)
                  .sort()
                  .map(artista => (
                    <option key={artista} value={artista}>{artista}</option>
                  ))}
              </select>
            </div>
            
            {/* Filtro por fechas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center">
                  <Calendar size={16} className="mr-1" />
                  Fecha desde
                </div>
              </label>
              <input
                type="date"
                value={filtroFechaDesde}
                onChange={(e) => setFiltroFechaDesde(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center">
                  <Calendar size={16} className="mr-1" />
                  Fecha hasta
                </div>
              </label>
              <input
                type="date"
                value={filtroFechaHasta}
                onChange={(e) => setFiltroFechaHasta(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>
          
          {/* Filtros rápidos de fecha */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={inicializarFiltroUltimos7Dias}
              className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded-full text-gray-700"
            >
              Últimos 7 días
            </button>
            <button
              onClick={inicializarFiltroUltimos30Dias}
              className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded-full text-gray-700"
            >
              Últimos 30 días
            </button>
          </div>
          
          {/* Filtro por edad */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Edad</label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-teal-600"
                  name="filtroEdad"
                  value="todos"
                  checked={filtroEdad === 'todos'}
                  onChange={() => setFiltroEdad('todos')}
                />
                <span className="ml-2">Todos</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-teal-600"
                  name="filtroEdad"
                  value="mayores"
                  checked={filtroEdad === 'mayores'}
                  onChange={() => setFiltroEdad('mayores')}
                />
                <span className="ml-2">Mayores de edad</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-teal-600"
                  name="filtroEdad"
                  value="menores"
                  checked={filtroEdad === 'menores'}
                  onChange={() => setFiltroEdad('menores')}
                />
                <span className="ml-2">Menores de edad</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Contador de resultados y botón de exportar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        {filteredConsentimientos.length > 0 && (
          <div className="text-sm text-gray-500 mb-3 md:mb-0">
            Mostrando {filteredConsentimientos.length} de {consentimientosArchivados.length} consentimientos archivados
          </div>
        )}
        
        <button
          onClick={exportarClientesCSV}
          disabled={filteredConsentimientos.length === 0}
          className={`flex items-center px-3 py-2 rounded-md ${
            filteredConsentimientos.length === 0 
              ? 'bg-gray-300 cursor-not-allowed text-gray-500'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          <FileDown size={18} className="mr-2" />
          Exportar Contactos de Clientes
        </button>
      </div>
      
      {consentimientosArchivados.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 mb-4">No hay consentimientos archivados</p>
        </div>
      ) : filteredConsentimientos.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 mb-4">No se encontraron consentimientos que coincidan con los criterios de búsqueda</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
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
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredConsentimientos.map((consentimiento) => (
                  <tr key={consentimiento.id} className="bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {consentimiento.cliente.nombre} {consentimiento.cliente.apellidos}
                          </div>
                          <div className="text-sm text-gray-500">
                            {consentimiento.cliente.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                        {consentimiento.codigo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(parseISO(consentimiento.fechaCreacion), 'dd MMM yyyy', { locale: es })}
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(parseISO(consentimiento.fechaCreacion), 'HH:mm', { locale: es })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {consentimiento.artistaSeleccionado}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        consentimiento.cliente.edad >= 18 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {consentimiento.cliente.edad} años
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link 
                          to={`/admin/consentimientos/${consentimiento.id}`}
                          className="text-teal-600 hover:text-teal-900"
                          title="Ver detalles"
                        >
                          <Eye size={18} />
                        </Link>
                        <button
                          onClick={() => generarPDF(consentimiento)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Descargar PDF"
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsentimientosArchivados;