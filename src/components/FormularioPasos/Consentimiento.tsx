import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useConfig } from '../../contexts/ConfigContext';
import { formatRut } from '../../utils/formatters';

const Consentimiento: React.FC = () => {
  const { register, watch, formState: { errors } } = useFormContext();
  const { config } = useConfig();
  
  const clienteNombre = watch('cliente.nombre');
  const clienteApellidos = watch('cliente.apellidos');
  const clienteRut = watch('cliente.rut');
  const clienteEdad = watch('cliente.edad');
  const artistaSeleccionado = watch('artistaSeleccionado');
  
  // Reemplazar etiquetas en el texto del consentimiento
  const textoConsentimientoFormateado = config.textoConsentimiento
    .replace('{Nombre Cliente}', `${clienteNombre || '[Nombre Cliente]'} ${clienteApellidos || '[Apellidos Cliente]'}`)
    .replace('{Rut Cliente}', clienteRut ? formatRut(clienteRut) : '[Rut Cliente]')
    .replace('{Edad Cliente}', clienteEdad?.toString() || '[Edad Cliente]')
    .replace('{Nombre Artista}', artistaSeleccionado || '[Nombre Artista]')
    .replace(/{Nombre Estudio}/g, config.nombreEstudio)
    .replace('{Direccion Estudio}', config.direccionEstudio);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Consentimiento General</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="prose max-w-none">
          <p className="whitespace-pre-line text-gray-700">
            {textoConsentimientoFormateado}
          </p>
        </div>
        
        <div className="mt-6">
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
      </div>
    </div>
  );
};

export default Consentimiento;