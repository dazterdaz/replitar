import React, { useState } from 'react';
import { useConfig } from '../../contexts/ConfigContext';
import { Save, X } from 'lucide-react';
import ErrorMessageSupabase from '../../components/ErrorMessageSupabase';

const CuidadosTatuajes: React.FC = () => {
  const { config, updateConfig, connectionError, retryConnection } = useConfig();
  
  const [formState, setFormState] = useState({
    creamAftercare: config.creamAftercare,
    patchAftercare: config.patchAftercare
  });
  
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaveStatus('saving');
      setErrorMessage('');
      
      await updateConfig(formState);
      
      setSaveStatus('success');
      
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Error al guardar los cuidados del tatuaje:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Error desconocido al guardar');
      setSaveStatus('error');
      
      setTimeout(() => {
        setSaveStatus('idle');
      }, 5000);
    }
  };

  if (connectionError) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">Cuidados del Tatuaje</h2>
        <ErrorMessageSupabase 
          errorMessage="No se pudo establecer conexión con la base de datos."
          onRetry={retryConnection}
          hasConnectionError={true}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Cuidados del Tatuaje</h2>
        
        {saveStatus === 'success' && (
          <div className="px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm">
            Instrucciones de cuidado guardadas correctamente
          </div>
        )}
        
        {saveStatus === 'error' && (
          <div className="px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm">
            Error al guardar las instrucciones: {errorMessage}
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Cuidados con Crema</h3>
            
            <div>
              <p className="text-sm text-gray-500 mb-2">
                Instrucciones para el cuidado de tatuajes con método de crema. Puedes usar formato de texto con saltos de línea.
              </p>
              <textarea
                id="creamAftercare"
                name="creamAftercare"
                value={formState.creamAftercare}
                onChange={handleInputChange}
                rows={15}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 font-mono text-sm"
              />
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Cuidados con Parche (Second Skin)</h3>
            
            <div>
              <p className="text-sm text-gray-500 mb-2">
                Instrucciones para el cuidado de tatuajes con método de parche Second Skin. Puedes usar formato de texto con saltos de línea.
              </p>
              <textarea
                id="patchAftercare"
                name="patchAftercare"
                value={formState.patchAftercare}
                onChange={handleInputChange}
                rows={15}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 font-mono text-sm"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setFormState({
                creamAftercare: config.creamAftercare,
                patchAftercare: config.patchAftercare
              })}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              disabled={saveStatus === 'saving'}
            >
              <X size={16} className="mr-2" />
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saveStatus === 'saving'}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none ${
                saveStatus === 'saving' ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {saveStatus === 'saving' ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CuidadosTatuajes;