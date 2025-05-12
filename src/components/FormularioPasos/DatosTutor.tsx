import React, { useState, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { useConfig } from '../../contexts/ConfigContext';
import { formatRut } from '../../utils/formatters';
import SignatureCanvas from 'react-signature-canvas';
import { Undo2 } from 'lucide-react';

const DatosTutor: React.FC = () => {
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  const { config } = useConfig();
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [firmado, setFirmado] = useState(false);
  const sigCanvas = useRef<SignatureCanvas | null>(null);
  
  const clienteNombre = watch('cliente.nombre');
  const clienteApellidos = watch('cliente.apellidos');
  const clienteRut = watch('cliente.rut');
  const clienteEdad = watch('cliente.edad');
  const parentesco = watch('tutor.parentesco');
  const otroParentesco = watch('tutor.otroParentesco');
  const tutorNombre = watch('tutor.nombre');
  const tutorRut = watch('tutor.rut');
  
  // Generar texto completo de parentesco
  const textoParentesco = parentesco === 'Otro' && otroParentesco 
    ? `${parentesco} (${otroParentesco})` 
    : parentesco || '[Parentesco]';
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) { // 20MB
        alert('El archivo es demasiado grande. El tamaño máximo permitido es 20MB.');
        e.target.value = '';
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setValue('tutor.cedulaImagen', file);
    }
  };

  const limpiarFirma = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      setFirmado(false);
      setValue('tutor.firma', '');
    }
  };

  const guardarFirma = () => {
    if (sigCanvas.current) {
      if (sigCanvas.current.isEmpty()) {
        alert('Por favor realiza tu firma antes de continuar.');
        return;
      }
      
      const firmaDataURL = sigCanvas.current.toDataURL('image/png');
      setValue('tutor.firma', firmaDataURL);
      setFirmado(true);
    }
  };

  // Reemplazar etiquetas en el texto del tutor legal
  const textoTutorLegalFormateado = config.textoTutorLegal
    .replace('{Nombre Tutor}', tutorNombre || '[Nombre Tutor Legal]')
    .replace('{Rut Tutor}', tutorRut ? formatRut(tutorRut) : '[Rut Tutor]')
    .replace('{Parentesco Tutor}', textoParentesco)
    .replace('{Nombre Cliente}', clienteNombre || '[Nombre Cliente]')
    .replace('{Apellidos Cliente}', clienteApellidos || '[Apellidos Cliente]')
    .replace('{Rut Cliente}', clienteRut ? formatRut(clienteRut) : '[Rut Cliente]')
    .replace('{Edad Cliente}', clienteEdad?.toString() || '[Edad Cliente]')
    .replace(/{Nombre Estudio}/g, config.nombreEstudio)
    .replace('{Direccion Estudio}', config.direccionEstudio);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Datos del Tutor Legal</h2>
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Esta sección solo es necesaria cuando el cliente es menor de edad (menor de 18 años).
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="tutorNombre" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre completo del tutor
          </label>
          <input
            id="tutorNombre"
            type="text"
            className={`w-full px-3 py-2 border rounded-md ${
              errors.tutor?.nombre ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Nombre completo del tutor"
            {...register('tutor.nombre', { 
              required: clienteEdad < 18 ? 'El nombre del tutor es obligatorio' : false 
            })}
          />
          {errors.tutor?.nombre && (
            <p className="mt-1 text-sm text-red-600">{errors.tutor.nombre.message as string}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="tutorRut" className="block text-sm font-medium text-gray-700 mb-1">
            RUT del tutor
          </label>
          <input
            id="tutorRut"
            type="text"
            className={`w-full px-3 py-2 border rounded-md ${
              errors.tutor?.rut ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="RUT del tutor"
            {...register('tutor.rut', { 
              required: clienteEdad < 18 ? 'El RUT del tutor es obligatorio' : false 
            })}
          />
          {tutorRut && !errors.tutor?.rut && (
            <p className="mt-1 text-xs text-gray-500">
              Formato: {formatRut(tutorRut)}
            </p>
          )}
          {errors.tutor?.rut && (
            <p className="mt-1 text-sm text-red-600">{errors.tutor.rut.message as string}</p>
          )}
        </div>
      </div>
      
      <div>
        <label htmlFor="parentesco" className="block text-sm font-medium text-gray-700 mb-1">
          Parentesco con el menor
        </label>
        <select
          id="parentesco"
          className={`w-full px-3 py-2 border rounded-md ${
            errors.tutor?.parentesco ? 'border-red-500' : 'border-gray-300'
          }`}
          {...register('tutor.parentesco', { 
            required: clienteEdad < 18 ? 'El parentesco es obligatorio' : false 
          })}
        >
          <option value="">Seleccione parentesco</option>
          <option value="Padre">Padre</option>
          <option value="Madre">Madre</option>
          <option value="Otro">Otro</option>
        </select>
        {errors.tutor?.parentesco && (
          <p className="mt-1 text-sm text-red-600">{errors.tutor.parentesco.message as string}</p>
        )}
      </div>
      
      {parentesco === 'Otro' && (
        <div>
          <label htmlFor="otroParentesco" className="block text-sm font-medium text-gray-700 mb-1">
            Especifique parentesco
          </label>
          <input
            id="otroParentesco"
            type="text"
            className={`w-full px-3 py-2 border rounded-md ${
              errors.tutor?.otroParentesco ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Especifique el parentesco"
            {...register('tutor.otroParentesco', { 
              required: parentesco === 'Otro' && clienteEdad < 18 ? 'Debe especificar el parentesco' : false 
            })}
          />
          {errors.tutor?.otroParentesco && (
            <p className="mt-1 text-sm text-red-600">{errors.tutor.otroParentesco.message as string}</p>
          )}
        </div>
      )}
      
      <div>
        <label htmlFor="cedulaTutor" className="block text-sm font-medium text-gray-700 mb-1">
          Subir cédula del tutor (sólo cara frontal, máx. 20MB)
        </label>
        <input
          id="cedulaTutor"
          type="file"
          accept="image/*"
          className={`w-full px-3 py-2 border rounded-md ${
            errors.tutor?.cedulaImagen ? 'border-red-500' : 'border-gray-300'
          }`}
          onChange={handleImageChange}
        />
        {errors.tutor?.cedulaImagen && (
          <p className="mt-1 text-sm text-red-600">{errors.tutor.cedulaImagen.message as string}</p>
        )}
        
        {filePreview && (
          <div className="mt-2">
            <p className="text-sm text-gray-600 mb-1">Vista previa:</p>
            <img 
              src={filePreview} 
              alt="Vista previa de cédula" 
              className="max-h-40 rounded border border-gray-300" 
            />
          </div>
        )}
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg mt-4">
        <h3 className="font-medium text-gray-800 mb-2">Autorización del Tutor Legal</h3>
        <p className="text-sm text-gray-600 whitespace-pre-line">
          {textoTutorLegalFormateado}
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-gray-800">Firma del Tutor Legal</h3>
        <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
          <SignatureCanvas
            ref={sigCanvas}
            penColor="black"
            canvasProps={{
              className: 'w-full h-64 cursor-crosshair'
            }}
            onEnd={() => setFirmado(true)}
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
            onClick={guardarFirma}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700"
          >
            Confirmar firma
          </button>
        </div>
        
        {firmado && (
          <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md">
            ✓ Firma guardada correctamente
          </div>
        )}
      </div>
    </div>
  );
};

export default DatosTutor;