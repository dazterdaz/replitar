import React from 'react';
import { CloudOff, WifiOff, RefreshCw } from 'lucide-react';
import { useConsentimientos } from '../contexts/ConsentimientosContext';

interface ErrorMessageSupabaseProps {
  compact?: boolean;
  className?: string;
}

export const ErrorMessageSupabase: React.FC<ErrorMessageSupabaseProps> = ({ 
  compact = false,
  className = ''
}) => {
  const { retryConnection, lastConnectionAttempt } = useConsentimientos();
  const [isRetrying, setIsRetrying] = React.useState(false);
  const [retryCount, setRetryCount] = React.useState(0);
  
  const handleRetry = () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    // Intentar la reconexión
    retryConnection();
    
    // Deshabilitar el botón temporalmente para evitar múltiples intentos
    setTimeout(() => {
      setIsRetrying(false);
    }, 8000); // 8 segundos para evitar múltiples clics
  };
  
  const formatLastAttempt = () => {
    if (!lastConnectionAttempt) return 'Sin intentos previos';
    
    const now = new Date();
    const diff = now.getTime() - lastConnectionAttempt.getTime();
    
    if (diff < 60000) {
      return 'hace menos de un minuto';
    } else if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
    } else {
      const hours = Math.floor(diff / 3600000);
      return `hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    }
  };
  
  if (compact) {
    return (
      <div className={`rounded-lg bg-red-50 px-3 py-2 text-red-800 flex items-center gap-2 ${className}`}>
        <CloudOff className="h-4 w-4" />
        <span className="text-sm">Sin conexión a la base de datos</span>
        <button
          onClick={handleRetry}
          disabled={isRetrying}
          className="ml-auto text-red-700 hover:text-red-800 disabled:opacity-50"
          title="Reintentar conexión"
        >
          <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
        </button>
      </div>
    );
  }
  
  return (
    <div className={`rounded-lg bg-red-50 p-4 text-red-800 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <CloudOff className="h-5 w-5 text-red-700" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">Problema de conexión</h3>
          <div className="mt-2 text-sm">
            <p>
              No se pudo conectar a la base de datos. Esto puede deberse a:
            </p>
            <ul className="mt-1 list-disc pl-5 space-y-1">
              <li>Problemas con tu conexión a Internet</li>
              <li>El servidor de base de datos podría estar temporalmente no disponible</li>
              <li>La conexión es demasiado lenta o inestable</li>
            </ul>
            <p className="mt-2 text-xs text-gray-600">
              Último intento de conexión: {formatLastAttempt()}
            </p>
            <p className="mt-1 text-xs text-gray-600">
              {retryCount > 0 ? `Intentos de reconexión manual: ${retryCount}` : ''}
            </p>
            
            <div className="mt-3 flex items-center space-x-4">
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                <RefreshCw className={`mr-1 h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Conectando...' : 'Reintentar conexión'}
              </button>
              <span className="text-xs text-gray-600 inline-flex items-center">
                <WifiOff className="mr-1 h-3 w-3" />
                Los datos guardados en caché permanecen disponibles
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessageSupabase;