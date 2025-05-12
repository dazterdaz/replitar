import React, { useState } from 'react';
import { useConfig } from '../../contexts/ConfigContext';
import { Save } from 'lucide-react';

const VistaConfiguracion: React.FC = () => {
  const { config, updateConfig } = useConfig();
  
  const [formState, setFormState] = useState({
    nombreEstudio: config.nombreEstudio,
    direccionEstudio: config.direccionEstudio,
    textoConsentimiento: config.textoConsentimiento,
    textoTutorLegal: config.textoTutorLegal,
    textosFooter: config.textosFooter,
    datosContacto: {
      nombre: config.datosContacto.nombre,
      whatsapp: config.datosContacto.whatsapp,
      email: config.datosContacto.email,
      instagram: config.datosContacto.instagram
    }
  });
  
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleContactoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      datosContacto: {
        ...prev.datosContacto,
        [name]: value
      }
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
      console.error('Error al guardar la configuración:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Error desconocido al guardar');
      setSaveStatus('error');
      
      setTimeout(() => {
        setSaveStatus('idle');
      }, 5000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Configuración General</h2>
        
        {saveStatus === 'success' && (
          <div className="px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm">
            Configuración guardada correctamente
          </div>
        )}
        
        {saveStatus === 'error' && (
          <div className="px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm">
            Error al guardar la configuración: {errorMessage}
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Información del Estudio</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nombreEstudio" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Estudio
                </label>
                <input
                  type="text"
                  id="nombreEstudio"
                  name="nombreEstudio"
                  value={formState.nombreEstudio}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              
              <div>
                <label htmlFor="direccionEstudio" className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección del Estudio
                </label>
                <input
                  type="text"
                  id="direccionEstudio"
                  name="direccionEstudio"
                  value={formState.direccionEstudio}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Texto Legal</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="textoConsentimiento" className="block text-sm font-medium text-gray-700 mb-1">
                  Texto del Consentimiento
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Variables disponibles: {'{Nombre Cliente}'}, {'{Rut Cliente}'}, {'{Edad Cliente}'}, {'{Nombre Artista}'}, {'{Nombre Estudio}'}, {'{Direccion Estudio}'}
                </p>
                <textarea
                  id="textoConsentimiento"
                  name="textoConsentimiento"
                  value={formState.textoConsentimiento}
                  onChange={handleInputChange}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div>
                <label htmlFor="textoTutorLegal" className="block text-sm font-medium text-gray-700 mb-1">
                  Texto del Tutor Legal
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Variables disponibles: {'{Nombre Tutor}'}, {'{Rut Tutor}'}, {'{Parentesco Tutor}'}, {'{Nombre Cliente}'}, {'{Apellidos Cliente}'}, {'{Rut Cliente}'}, {'{Edad Cliente}'}, {'{Nombre Estudio}'}, {'{Direccion Estudio}'}
                </p>
                <textarea
                  id="textoTutorLegal"
                  name="textoTutorLegal"
                  value={formState.textoTutorLegal}
                  onChange={handleInputChange}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Texto del Footer</h3>
            
            <div>
              <label htmlFor="textosFooter" className="block text-sm font-medium text-gray-700 mb-1">
                Texto del Footer
              </label>
              <input
                type="text"
                id="textosFooter"
                name="textosFooter"
                value={formState.textosFooter}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Datos de Contacto</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formState.datosContacto.nombre}
                  onChange={handleContactoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              
              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp
                </label>
                <input
                  type="text"
                  id="whatsapp"
                  name="whatsapp"
                  value={formState.datosContacto.whatsapp}
                  onChange={handleContactoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formState.datosContacto.email}
                  onChange={handleContactoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              
              <div>
                <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
                  Instagram
                </label>
                <input
                  type="text"
                  id="instagram"
                  name="instagram"
                  value={formState.datosContacto.instagram}
                  onChange={handleContactoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saveStatus === 'saving'}
              className={`inline-flex items-center px-4 py-2 bg-teal-600 border border-transparent rounded-md font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${
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
                  <Save size={18} className="mr-2" />
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

export default VistaConfiguracion;