import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useConsentimientos } from '../../contexts/ConsentimientosContext';
import { useConfig } from '../../contexts/ConfigContext';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, Download, Archive } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { formatRut } from '../../utils/formatters';

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

const ConsentimientoDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getConsentimiento, archivarConsentimiento } = useConsentimientos();
  const { config } = useConfig();
  const [archivando, setArchivando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(false);
  
  // Obtener consentimiento
  const consentimiento = getConsentimiento(id || '');
  
  if (!consentimiento) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Consentimiento no encontrado</h2>
        <p className="text-gray-600 mb-6">
          El consentimiento que estás buscando no existe o ha sido archivado.
        </p>
        <Link
          to="/admin/consentimientos"
          className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
        >
          <ArrowLeft size={16} className="mr-2" />
          Volver a la lista
        </Link>
      </div>
    );
  }
  
  // Archivar consentimiento
  const handleArchivar = async () => {
    if (window.confirm('¿Estás seguro de que deseas archivar este consentimiento?')) {
      try {
        setArchivando(true);
        console.log('Iniciando proceso de archivado del ID:', id);
        
        // Archivar el consentimiento
        await archivarConsentimiento(id || '');
        
        console.log('Consentimiento archivado exitosamente');
        setMensajeExito(true);
        
        // Mostrar mensaje de éxito por 2 segundos antes de redirigir
        setTimeout(() => {
          // Después de archivar exitosamente, redirigir a la lista de consentimientos
          navigate('/admin/consentimientos', { replace: true });
        }, 2000);
      } catch (error) {
        console.error('Error al archivar el consentimiento:', error);
        alert('Error al archivar el consentimiento. Por favor, inténtalo de nuevo.');
        setArchivando(false);
      }
    }
  };
  
  // Generar PDF
  const generarPDF = () => {
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
      // Crear texto completo de parentesco
      const parentescoCompleto = consentimiento.tutor.parentesco === 'Otro' 
        ? `${consentimiento.tutor.parentesco} (${consentimiento.tutor.otroParentesco})`
        : consentimiento.tutor.parentesco;
      pdf.text(`Parentesco: ${parentescoCompleto}`, margen, y);
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
    
    const infoSalud = consentimiento.informacionSalud || {};
    
    // Mostrar preguntas de salud con sus respuestas
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
    
    // Texto de consentimiento con todas las variables reemplazadas
    const textoConsentimiento = config.textoConsentimiento
      .replace('{Nombre Cliente}', `${consentimiento.cliente.nombre} ${consentimiento.cliente.apellidos}`)
      .replace('{Rut Cliente}', formatRut(consentimiento.cliente.rut))
      .replace('{Edad Cliente}', consentimiento.cliente.edad.toString())
      .replace('{Nombre Artista}', consentimiento.artistaSeleccionado)
      .replace(/{Nombre Estudio}/g, config.nombreEstudio)
      .replace('{Direccion Estudio}', config.direccionEstudio);
      
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center mb-4 sm:mb-0">
          <Link
            to="/admin/consentimientos"
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Detalle de Consentimiento</h1>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={generarPDF}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Download size={16} className="mr-2" />
            Descargar PDF
          </button>
          <button
            onClick={handleArchivar}
            disabled={archivando || mensajeExito || consentimiento.archivado}
            className={`inline-flex items-center px-4 py-2 ${
              consentimiento.archivado
                ? 'bg-gray-400 cursor-not-allowed'
                : mensajeExito 
                  ? 'bg-green-500'
                  : archivando 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-red-600 hover:bg-red-700'
            } text-white rounded-md`}
          >
            {consentimiento.archivado ? (
              <>
                Ya está archivado
              </>
            ) : mensajeExito ? (
              <>
                ✓ Archivado correctamente
              </>
            ) : archivando ? (
              <>
                <span className="animate-spin mr-2">⌛</span>
                Archivando...
              </>
            ) : (
              <>
                <Archive size={16} className="mr-2" />
                Archivar
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6 pb-2 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Información del Cliente
          </h2>
          <div className="flex flex-col md:flex-row items-end md:items-center gap-2">
            <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-medium">
              Código: {consentimiento.codigo}
            </span>
            {consentimiento.archivado && (
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                Archivado
              </span>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Nombre Completo</p>
            <p className="font-medium">{consentimiento.cliente.nombre} {consentimiento.cliente.apellidos}</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-500">RUT / Pasaporte</p>
            <p className="font-medium">{formatRut(consentimiento.cliente.rut)}</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Edad</p>
            <p className="font-medium">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                consentimiento.cliente.edad >= 18 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {consentimiento.cliente.edad} años
              </span>
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Fecha de Nacimiento</p>
            <p className="font-medium">
              {format(new Date(consentimiento.cliente.fechaNacimiento), 'dd/MM/yyyy')}
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Dirección</p>
            <p className="font-medium">
              {consentimiento.cliente.direccion.calle}, {consentimiento.cliente.direccion.comuna}, {consentimiento.cliente.direccion.region}
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Teléfono</p>
            <p className="font-medium">{consentimiento.cliente.telefono}</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{consentimiento.cliente.email}</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Fecha del Consentimiento</p>
            <p className="font-medium">
              {format(parseISO(consentimiento.fechaCreacion), 'dd/MM/yyyy HH:mm')}
            </p>
          </div>
        </div>
        
        {consentimiento.cliente.edad < 18 && consentimiento.tutor && (
          <>
            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-6 pb-2 border-b">
              Información del Tutor Legal
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Nombre Completo</p>
                <p className="font-medium">{consentimiento.tutor.nombre}</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-500">RUT</p>
                <p className="font-medium">{formatRut(consentimiento.tutor.rut)}</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Parentesco</p>
                <p className="font-medium">
                  {consentimiento.tutor.parentesco === 'Otro' 
                    ? `${consentimiento.tutor.parentesco} (${consentimiento.tutor.otroParentesco})` 
                    : consentimiento.tutor.parentesco}
                </p>
              </div>

              {consentimiento.tutor.firma && (
                <div className="space-y-2 md:col-span-2">
                  <p className="text-sm text-gray-500">Firma del Tutor</p>
                  <div className="border rounded-md p-3">
                    <img 
                      src={consentimiento.tutor.firma} 
                      alt="Firma del tutor" 
                      className="max-h-24 mx-auto" 
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        )}
        
        <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-6 pb-2 border-b">
          Artista y Detalles del Procedimiento
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Artista Seleccionado</p>
            <p className="font-medium">{consentimiento.artistaSeleccionado}</p>
          </div>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-6 pb-2 border-b">
          Información de Salud
        </h2>
        
        <div className="grid grid-cols-1 gap-3 mb-8">
          {PREGUNTAS_SALUD.map((pregunta, index) => {
            const respuestaData = consentimiento.informacionSalud?.[index] || { respuesta: false };
            return (
              <div key={index} className="p-3 bg-gray-50 rounded-md">
                <div className="flex justify-between items-start">
                  <p className="font-medium">{pregunta}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    respuestaData.respuesta 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {respuestaData.respuesta ? 'Sí' : 'No'}
                  </span>
                </div>
                {respuestaData.informacionAdicional && (
                  <p className="text-sm text-gray-600 mt-1">
                    Información adicional: {respuestaData.informacionAdicional}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        
        <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-6 pb-2 border-b">
          Firma del Cliente
        </h2>
        
        <div className="mb-8">
          {consentimiento.firma ? (
            <div className="border rounded-md p-4">
              <img 
                src={consentimiento.firma} 
                alt="Firma del cliente" 
                className="max-h-24 mx-auto" 
              />
              <p className="text-sm text-gray-500 text-center mt-2">
                Fecha: {format(parseISO(consentimiento.fechaCreacion), 'dd/MM/yyyy')}
              </p>
            </div>
          ) : (
            <p className="text-red-600">No se encontró la firma del cliente</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsentimientoDetalle;