import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useConfig } from '../../contexts/ConfigContext';
import { formatRut } from '../../utils/formatters';
import { generatePDF } from '../../utils/pdfGenerator';
import { FileDown, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

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

interface ResumenProps {
  onSubmit: () => void;
}

interface ResumenSeccionProps {
  titulo: string;
  campos: { label: string; valor: string }[];
}

const ResumenSeccion: React.FC<ResumenSeccionProps> = ({ titulo, campos }) => {
  return (
    <div>
      <h4 className="font-medium text-gray-800 mb-3">{titulo}</h4>
      <div className="bg-gray-50 rounded-md p-4">
        <dl className="grid grid-cols-1 gap-3">
          {campos.map((campo, index) => {
            // Formatear RUT si el campo es de tipo RUT
            const valor = (campo.label === 'RUT/Pasaporte' || campo.label === 'RUT') 
              ? formatRut(campo.valor)
              : campo.valor;
            
            return (
              <div key={index} className="flex">
                <dt className="font-medium text-gray-600 w-1/3">{campo.label}:</dt>
                <dd className="text-gray-800">{valor}</dd>
              </div>
            );
          })}
        </dl>
      </div>
    </div>
  );
};

const Resumen: React.FC<ResumenProps> = ({ onSubmit }) => {
  const { getValues } = useFormContext();
  const { config } = useConfig();
  const [pdfGenerado, setPdfGenerado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  
  const generarPDF = () => {
    const valores = getValues();
    const pdf = generatePDF(valores, config);
    pdf.save(`consentimiento_${valores.cliente.nombre}_${format(new Date(), 'yyyyMMdd')}.pdf`);
    setPdfGenerado(true);
  };

  const handleSubmit = async () => {
    if (!pdfGenerado) {
      alert('Por favor, descarga una copia del consentimiento antes de enviarlo.');
      return;
    }
    
    setEnviando(true);
    try {
      await onSubmit();
    } catch (error) {
      console.error('Error al enviar el formulario:', error);
      alert('Ocurrió un error al enviar el formulario. Por favor intenta de nuevo.');
      setEnviando(false);
    }
  };

  const formatFechaNacimiento = (fecha: string) => {
    if (!fecha) return 'No especificada';
    try {
      return format(new Date(fecha), 'dd/MM/yyyy');
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Obtener respuestas de salud
  const informacionSalud = getValues('informacionSalud') || {};
  
  // Formato para mostrar en el resumen
  const respuestasSalud = PREGUNTAS_SALUD.map((pregunta, index) => {
    const respuesta = informacionSalud[index]?.respuesta === 'true' ? 'Sí' : 'No';
    const infoAdicional = informacionSalud[index]?.informacionAdicional;
    
    return {
      pregunta,
      respuesta,
      infoAdicional
    };
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Resumen del Formulario</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-800">Datos Ingresados</h3>
          <button
            type="button"
            onClick={generarPDF}
            className={`inline-flex items-center px-4 py-2 rounded-md transition-colors ${
              pdfGenerado
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {pdfGenerado ? (
              <>
                <CheckCircle size={18} className="mr-2" />
                Descargar PDF de nuevo
              </>
            ) : (
              <>
                <FileDown size={18} className="mr-2" />
                Descargar PDF
              </>
            )}
          </button>
        </div>
        
        <div className="space-y-8">
          <ResumenSeccion 
            titulo="Datos Personales" 
            campos={[
              { label: 'Nombre', valor: `${getValues('cliente.nombre')} ${getValues('cliente.apellidos')}` },
              { label: 'RUT/Pasaporte', valor: getValues('cliente.rut') },
              { label: 'Edad', valor: `${getValues('cliente.edad')} años` },
              { label: 'Fecha de Nacimiento', valor: formatFechaNacimiento(getValues('cliente.fechaNacimiento')) },
              { label: 'Dirección', valor: `${getValues('cliente.direccion.calle')}, ${getValues('cliente.direccion.comuna')}, ${getValues('cliente.direccion.region')}` },
              { label: 'Teléfono', valor: getValues('cliente.telefono') },
              { label: 'Email', valor: getValues('cliente.email') }
            ]}
          />
          
          {getValues('cliente.edad') < 18 && getValues('tutor') && (
            <ResumenSeccion 
              titulo="Datos del Tutor Legal" 
              campos={[
                { label: 'Nombre', valor: getValues('tutor.nombre') },
                { label: 'RUT', valor: getValues('tutor.rut') },
                { label: 'Parentesco', valor: getValues('tutor.parentesco') === 'Otro' 
                  ? `${getValues('tutor.parentesco')} (${getValues('tutor.otroParentesco')})` 
                  : getValues('tutor.parentesco') 
                }
              ]}
            />
          )}
          
          <ResumenSeccion 
            titulo="Artista Seleccionado" 
            campos={[
              { label: 'Artista', valor: getValues('artistaSeleccionado') }
            ]}
          />
          
          <div>
            <h4 className="font-medium text-gray-800 mb-3">Información de Salud</h4>
            <div className="bg-gray-50 rounded-md p-4">
              <div className="space-y-2">
                {respuestasSalud.map((item, index) => (
                  <div key={index} className="flex flex-col">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">{item.pregunta}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.respuesta === 'Sí' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-800'
                      }`}>
                        {item.respuesta}
                      </span>
                    </div>
                    {item.infoAdicional && (
                      <span className="text-sm text-gray-500 ml-4 mt-1">
                        Detalle: {item.infoAdicional}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 mb-3">Firma Digital</h4>
            {getValues('firma') ? (
              <div className="border rounded-md p-3">
                <img 
                  src={getValues('firma')} 
                  alt="Firma digital" 
                  className="max-h-20" 
                />
                <p className="text-sm text-gray-500 mt-2">
                  Fecha: {format(new Date(), 'dd/MM/yyyy')}
                </p>
              </div>
            ) : (
              <p className="text-amber-600">No se ha registrado la firma</p>
            )}
          </div>
        </div>
        
        {!pdfGenerado && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              Por favor, descarga una copia del consentimiento antes de enviarlo.
            </p>
          </div>
        )}
        
        <div className="mt-8">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!pdfGenerado || enviando}
            className={`w-full inline-flex justify-center items-center px-4 py-3 rounded-md transition-colors ${
              !pdfGenerado || enviando
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-teal-600 hover:bg-teal-700 text-white'
            }`}
          >
            {enviando ? (
              <>
                <span className="animate-spin mr-2">⌛</span>
                Enviando...
              </>
            ) : (
              'Enviar Formulario'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Resumen;