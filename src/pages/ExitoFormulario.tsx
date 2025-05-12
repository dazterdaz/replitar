import React, { useState, useEffect } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { useConfig } from '../contexts/ConfigContext';
import { CheckCircle, FileDown, Home, ArrowLeft } from 'lucide-react';

interface LocationState {
  consentimientoId?: string;
  consentimientoCodigo?: string;
  clienteNombre?: string;
  pdfData?: string;
}

const ExitoFormulario: React.FC = () => {
  const location = useLocation();
  const { config } = useConfig();
  const [contador, setContador] = useState(10);
  const [redirectHome, setRedirectHome] = useState(false);
  
  // Obtener datos del state de la navegación
  const state = location.state as LocationState;
  const { consentimientoCodigo, clienteNombre, pdfData } = state || {};

  // Si no hay código de consentimiento, redirigir a la página de inicio
  if (!consentimientoCodigo) {
    return <Navigate to="/" replace />;
  }
  
  // Iniciar contador para redirección automática
  useEffect(() => {
    const timer = setInterval(() => {
      setContador(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setRedirectHome(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Redireccionar cuando el contador llegue a 0
  if (redirectHome) {
    return <Navigate to="/" replace />;
  }
  
  // Función para descargar el PDF nuevamente
  const descargarPDF = () => {
    if (pdfData) {
      const link = document.createElement('a');
      link.href = pdfData;
      link.download = `consentimiento_${clienteNombre || 'cliente'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-800">
                {config.nombreEstudio}
              </h1>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 flex-grow flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-500" size={32} />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            ¡Consentimiento Enviado con Éxito!
          </h2>

          <p className="text-gray-600 mb-6">
            Gracias por completar el formulario de consentimiento. Tu información ha sido registrada correctamente.
          </p>

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-500 mb-2">Código de verificación:</p>
            <p className="text-lg font-mono font-bold">{consentimientoCodigo}</p>
            <p className="text-sm text-gray-500 mt-2">
              Guarda este código para futuras referencias o verificaciones.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
              onClick={descargarPDF}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-md transition-colors"
              disabled={!pdfData}
            >
              <FileDown size={18} className="mr-2" />
              Descargar PDF
            </button>
            
            <Link
              to="/"
              className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors"
            >
              <Home size={18} className="mr-2" />
              Volver al Inicio
            </Link>
          </div>

          <div className="text-sm text-gray-500">
            Serás redirigido automáticamente en <span className="font-bold">{contador}</span> segundos
          </div>
        </div>
      </div>

      <footer className="bg-gray-800 text-white py-4 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            {config.textosFooter || '© 2025 Sistema de Consentimientos'}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ExitoFormulario;