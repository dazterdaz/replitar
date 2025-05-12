import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';

const DocumentosCedula: React.FC = () => {
  const { setValue } = useFormContext();
  const [filePreview, setFilePreview] = useState<string | null>(null);

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
      setValue('cedulaCliente', file);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Documentos</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-600 mb-4">
          Por favor, sube una foto de tu cédula de identidad (solo cara frontal).
        </p>
        
        <div>
          <label htmlFor="cedulaCliente" className="block text-sm font-medium text-gray-700 mb-2">
            Cédula de identidad (máx. 20MB)
          </label>
          <input
            id="cedulaCliente"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <p className="mt-1 text-xs text-gray-500">
            Formatos aceptados: JPG, PNG, etc. Tamaño máximo: 20MB
          </p>
        </div>
        
        {filePreview && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Vista previa:</p>
            <img 
              src={filePreview} 
              alt="Vista previa de cédula" 
              className="max-h-60 rounded border border-gray-300" 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentosCedula;