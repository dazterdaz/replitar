import React, { useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useConfig } from '../../contexts/ConfigContext';
import SignatureCanvas from 'react-signature-canvas';
import { format } from 'date-fns';
import { Undo2 } from 'lucide-react';
import { formatRut } from '../../utils/formatters';

interface ConsentimientoFirmaProps {
  onCompleteStepChange: (complete: boolean) => void;
  onSubmit: () => void;
}

const ConsentimientoFirma: React.FC<ConsentimientoFirmaProps> = ({ onCompleteStepChange, onSubmit }) => {
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  const { config } = useConfig();
  
  const [firmado, setFirmado] = useState(false);
  const sigCanvas = useRef<SignatureCanvas | null>(null);
  const [fechaFirma] = useState<string>(format(new Date(), 'dd/MM/yyyy'));
  
  const clienteNombre = watch('cliente.nombre');
  const clienteApellidos = watch('cliente.apellidos');
  const clienteRut = watch('cliente.rut');
  const clienteEdad = watch('cliente.edad');
  const artistaSeleccionado = watch('artistaSeleccionado');
  const confirmacion = watch('confirmacionConsentimiento');

  // Reemplazar etiquetas en el texto del consentimiento
  const textoConsentimientoFormateado = config.textoConsentimiento
    .replace('{Nombre Cliente}', `${clienteNombre || '[Nombre Cliente]'} ${clienteApellidos || '[Apellidos Cliente]'}`)
    .replace('{Rut Cliente}', clienteRut ? formatRut(clienteRut) : '[Rut Cliente]')
    .replace('{Edad Cliente}', clienteEdad?.toString() || '[Edad Cliente]')
    .replace('{Nombre Artista}', artistaSeleccionado || '[Nombre Artista]')
    .replace(/{Nombre Estudio}/g, config.nombreEstudio)
    .replace('{Direccion Estudio}', config.direccionEstudio);

  const limpiarFirma = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      setFirmado(false);
      setValue('firma', '');
      onCompleteStepChange(false);
    }
  };

  const confirmarFirma = () => {
    if (sigCanvas.current) {
      if (sigCanvas.current.isEmpty()) {
        alert('Por favor realiza tu firma antes de continuar.');
        return;
      }
      
      const firmaDataURL = sigCanvas.current.toDataURL('image/png');
      setValue('firma', firmaDataURL);
      setFirmado(true);
      onCompleteStepChange(true);
    }
  };
  
  const handleSubmitForm = () => {
    if (!confirmacion) {
      alert('Debes confirmar que has leído y aceptas los términos del consentimiento.');
      return;
    }
    
    if (!firmado) {
      alert('Debes firmar el consentimiento antes de enviar.');
      return;
    }
    
    // Llamar a la función de envío proporcionada por el padre
    onSubmit();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Consentimiento y Firma</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Consentimiento General</h3>
        <div className="prose max-w-none mb-6">
          <p className="whitespace-pre-line text-gray-700">
            {textoConsentimientoFormateado}
          </p>
        </div>
        
        <div className="mt-6 mb-8">
          <label className="flex items-start">
            <input
              type="checkbox"
              className={`mt-1 h-4 w-4 text-teal-600 border ${
                errors.confirmacionConsentimiento ? 'border-red-500' : 'border-gray-300'
              }`}
              {...register('confirmacionConsentimiento', { 
                required: 'Debes confirmar que has leído y aceptas los términos del consentimiento' 
              })}
            />
            <span className="ml-2 text-sm text-gray-700">
              Confirmo que toda la información proporcionada es verdadera y he leído y acepto todos los términos anteriores.
            </span>
          </label>
          {errors.confirmacionConsentimiento && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmacionConsentimiento.message as string}</p>
          )}
        </div>
        
        <h3 className="font-bold text-lg text-gray-800 mb-4">Firma Digital</h3>
        <p className="text-gray-600 mb-4">
          Por favor, firma en el espacio a continuación utilizando el mouse, el dedo o lápiz óptico.
        </p>
        
        <div className="border-2 border-gray-300 rounded-lg overflow-hidden mb-4">
          <SignatureCanvas
            ref={sigCanvas}
            penColor="black"
            canvasProps={{
              className: 'w-full h-64 cursor-crosshair'
            }}
            onEnd={() => {
              if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
                confirmarFirma();
              }
            }}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={limpiarFirma}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Undo2 size={16} className="mr-2" />
            Borrar firma
          </button>
          
          <button
            type="button"
            onClick={confirmarFirma}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!watch('confirmacionConsentimiento')}
          >
            Confirmar firma
          </button>
        </div>
        
        <div className="mt-4 text-right">
          <p className="text-sm text-gray-500">
            Fecha: {fechaFirma}
          </p>
        </div>
        
        {firmado && (
          <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md">
            ✓ Firma guardada correctamente
          </div>
        )}
        
        {/* Botón para enviar formulario completo */}
        <div className="mt-8">
          <button
            type="button"
            onClick={handleSubmitForm}
            disabled={!firmado || !confirmacion}
            className={`w-full inline-flex justify-center items-center px-4 py-3 rounded-md transition-colors ${
              !firmado || !confirmacion
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-teal-600 hover:bg-teal-700 text-white'
            }`}
          >
            Finalizar y Enviar Formulario
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsentimientoFirma;