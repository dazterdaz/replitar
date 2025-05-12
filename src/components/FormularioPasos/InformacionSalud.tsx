import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';

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

const InformacionSalud: React.FC = () => {
  const { register, watch, formState: { errors } } = useFormContext();
  
  // Estado local para manejar los campos adicionales
  const [showAdditionalFields, setShowAdditionalFields] = useState<{[key: string]: boolean}>({});
  
  // Vigilar las respuestas para mostrar campos adicionales para preguntas específicas
  const respuestas = watch('informacionSalud');

  // Determinar si mostrar campo adicional basado en la respuesta
  React.useEffect(() => {
    if (respuestas) {
      const newState = { ...showAdditionalFields };
      
      // Para alergias (índice 1)
      if (respuestas[1]?.respuesta === 'true') {
        newState[1] = true;
      } else {
        newState[1] = false;
      }
      
      // Para problemas de salud (índice 7)
      if (respuestas[7]?.respuesta === 'true') {
        newState[7] = true;
      } else {
        newState[7] = false;
      }
      
      // Para tratamiento médico (índice 8)
      if (respuestas[8]?.respuesta === 'true') {
        newState[8] = true;
      } else {
        newState[8] = false;
      }
      
      // Para problemas dermatológicos (índice 14)
      if (respuestas[14]?.respuesta === 'true') {
        newState[14] = true;
      } else {
        newState[14] = false;
      }
      
      setShowAdditionalFields(newState);
    }
  }, [respuestas]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Información de Salud</h2>
      
      <p className="text-gray-600 mb-4">
        Por favor, responde las siguientes preguntas sobre tu salud para garantizar un procedimiento seguro.
      </p>
      
      <div className="space-y-4">
        {PREGUNTAS_SALUD.map((pregunta, index) => {
          const mostrarCampoAdicional = showAdditionalFields[index];
              
          return (
            <div key={index} className="p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-start">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{pregunta}</p>
                </div>
                <div className="flex space-x-4 ml-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio h-4 w-4 text-teal-600"
                      value="true"
                      defaultChecked={index === 0} // Por defecto "Sí" solo para la primera pregunta (¿Comiste en las últimas 4 horas?)
                      {...register(`informacionSalud.${index}.respuesta`, {
                        required: 'Esta pregunta es obligatoria'
                      })}
                    />
                    <span className="ml-2">Sí</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio h-4 w-4 text-teal-600"
                      value="false"
                      defaultChecked={index !== 0} // Por defecto "No" para todas las demás preguntas
                      {...register(`informacionSalud.${index}.respuesta`, {
                        required: 'Esta pregunta es obligatoria'
                      })}
                    />
                    <span className="ml-2">No</span>
                  </label>
                </div>
              </div>
              
              {mostrarCampoAdicional && (
                <div className="mt-3">
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Proporciona más detalles..."
                    {...register(`informacionSalud.${index}.informacionAdicional`)}
                  />
                </div>
              )}
              
              {errors.informacionSalud?.[index]?.respuesta && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.informacionSalud[index].respuesta.message as string}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InformacionSalud;