import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useConfig } from '../contexts/ConfigContext';
import { useConsentimientos } from '../contexts/ConsentimientosContext';
import { Palette, Shield, FileCheck, CheckCircle, Search, Hash, X, Instagram, Mail, Phone, ChevronFirst as FirstAid } from 'lucide-react';
import ContactPopup from '../components/ContactPopup';
import CareInstructionsModal from '../components/CareInstructionsModal';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatRut } from '../utils/formatters';

const Landing: React.FC = () => {
  const { config } = useConfig();
  const { getConsentimientoPorCodigo } = useConsentimientos();
  const [showContactModal, setShowContactModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showCareModal, setShowCareModal] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [resultado, setResultado] = useState<{
    encontrado: boolean;
    consentimiento?: any;
    mensaje?: string;
  } | null>(null);

  const validarDocumento = () => {
    if (!codigo.trim()) {
      setResultado({
        encontrado: false,
        mensaje: 'Por favor, ingresa un código de verificación'
      });
      return;
    }

    const consentimiento = getConsentimientoPorCodigo(codigo.trim().toUpperCase());
    
    if (consentimiento) {
      setResultado({
        encontrado: true,
        consentimiento,
        mensaje: 'Documento verificado exitosamente'
      });
    } else {
      setResultado({
        encontrado: false,
        mensaje: 'No se encontró ningún documento con ese código'
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center gap-2">
              <Palette className="text-teal-500" size={32} />
              <h1 className="text-2xl font-bold text-gray-800">{config.nombreEstudio}</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowCareModal(true)}
                className="w-full sm:w-auto px-4 py-2 border border-blue-500 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors font-medium text-center"
              >
                <FirstAid size={18} className="inline-block mr-1" />
                Cuidados
              </button>
              <button
                onClick={() => setShowValidationModal(true)}
                className="w-full sm:w-auto px-4 py-2 border border-teal-500 text-teal-500 hover:bg-teal-50 rounded-lg transition-colors font-medium text-center"
              >
                Validar Documento
              </button>
              <Link
                to="/formulario"
                className="w-full sm:w-auto px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors font-medium text-center"
              >
                Completar Formulario
              </Link>
              <Link
                to="/admin/login"
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium text-center"
              >
                Acceso Admin
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-teal-500 to-teal-600 text-white py-12 sm:py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Formulario de Consentimiento para Tatuajes
          </h2>
          <p className="text-lg sm:text-xl mb-8 max-w-3xl mx-auto">
            Completa tu formulario de consentimiento de manera rápida y segura antes de tu sesión de tatuaje.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/formulario"
              className="px-6 py-3 bg-white text-teal-600 hover:bg-gray-100 rounded-lg transition-colors font-medium text-lg inline-block"
            >
              Comenzar Ahora
            </Link>
            <button
              onClick={() => setShowValidationModal(true)}
              className="px-6 py-3 bg-teal-600 text-white hover:bg-teal-700 rounded-lg transition-colors font-medium text-lg inline-block border-2 border-white"
            >
              Validar Documento
            </button>
            <button
              onClick={() => setShowCareModal(true)}
              className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors font-medium text-lg inline-block border-2 border-white"
            >
              <FirstAid size={20} className="inline-block mr-2" />
              Cuidados del Tatuaje
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 sm:py-16 container mx-auto px-4">
        <h3 className="text-xl sm:text-2xl font-bold text-center mb-8 sm:mb-12 text-gray-800">
          ¿Por qué usar nuestro formulario digital?
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
            <div className="bg-teal-100 p-3 rounded-full mb-4">
              <Shield className="text-teal-600" size={24} />
            </div>
            <h4 className="font-bold text-lg mb-2">Seguro y Confidencial</h4>
            <p className="text-gray-600">
              Toda tu información se mantiene segura y protegida en todo momento.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
            <div className="bg-teal-100 p-3 rounded-full mb-4">
              <FileCheck className="text-teal-600" size={24} />
            </div>
            <h4 className="font-bold text-lg mb-2">PDF Descargable</h4>
            <p className="text-gray-600">
              Recibe una copia de tu consentimiento en formato PDF para tu tranquilidad.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
            <div className="bg-teal-100 p-3 rounded-full mb-4">
              <CheckCircle className="text-teal-600" size={24} />
            </div>
            <h4 className="font-bold text-lg mb-2">Rápido y Fácil</h4>
            <p className="text-gray-600">
              Completa el formulario en minutos, sin complicaciones ni papeleos.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-100 py-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-xl sm:text-2xl font-bold mb-6 text-gray-800">
            ¿Listo para tu próximo tatuaje?
          </h3>
          <p className="text-lg mb-8 max-w-2xl mx-auto text-gray-600">
            Completa tu formulario de consentimiento ahora y ahorra tiempo en el estudio.
          </p>
          <Link
            to="/formulario"
            className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors font-medium text-lg inline-block"
          >
            Completar Formulario
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <div className="text-center md:text-left">
              <h4 className="font-bold text-xl mb-2">{config.nombreEstudio}</h4>
              <p className="text-gray-300">{config.direccionEstudio}</p>
            </div>
            
            <div className="flex space-x-4">
              {config.datosContacto.instagram && (
                <a href={`https://instagram.com/${config.datosContacto.instagram.replace('@', '')}`} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="text-gray-300 hover:text-white transition-colors">
                  <Instagram size={24} />
                </a>
              )}
              {config.datosContacto.email && (
                <a href={`mailto:${config.datosContacto.email}`}
                   className="text-gray-300 hover:text-white transition-colors">
                  <Mail size={24} />
                </a>
              )}
              {config.datosContacto.whatsapp && (
                <a href={`https://wa.me/${config.datosContacto.whatsapp.replace(/\D/g, '')}`}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="text-gray-300 hover:text-white transition-colors">
                  <Phone size={24} />
                </a>
              )}
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <button 
              onClick={() => setShowContactModal(true)}
              className="text-gray-300 hover:text-white transition-colors"
            >
              {config.textosFooter}
            </button>
          </div>
        </div>
      </footer>

      {/* Modales */}
      {showContactModal && (
        <ContactPopup onClose={() => setShowContactModal(false)} />
      )}

      {showCareModal && (
        <CareInstructionsModal onClose={() => setShowCareModal(false)} />
      )}

      {showValidationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative animate-fadeIn">
            <button
              onClick={() => {
                setShowValidationModal(false);
                setResultado(null);
                setCodigo('');
              }}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>

            <h3 className="text-2xl font-bold mb-4 text-center">Validar Documento</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="codigo" className="block text-sm font-medium text-gray-700 mb-1">
                  Código de Verificación
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="codigo"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                    placeholder="Ingresa el código (ej: TCF-XXXXX-XXXXX)"
                  />
                </div>
              </div>

              <button
                onClick={validarDocumento}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                <Search size={18} className="mr-2" />
                Validar
              </button>

              {resultado && (
                <div className={`mt-4 p-4 rounded-md ${
                  resultado.encontrado ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  {resultado.encontrado ? (
                    <div className="space-y-3">
                      <div className="flex items-center text-green-800">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        <p className="font-medium">{resultado.mensaje}</p>
                      </div>
                      <div className="text-sm text-gray-600 space-y-2">
                        <p><strong>Cliente:</strong> {resultado.consentimiento.cliente.nombre} {resultado.consentimiento.cliente.apellidos}</p>
                        <p><strong>RUT/Pasaporte:</strong> {formatRut(resultado.consentimiento.cliente.rut)}</p>
                        <p><strong>Fecha:</strong> {format(parseISO(resultado.consentimiento.fechaCreacion), "dd 'de' MMMM 'de' yyyy", { locale: es })}</p>
                        <p><strong>Hora:</strong> {format(parseISO(resultado.consentimiento.fechaCreacion), 'HH:mm', { locale: es })}</p>
                        <p><strong>Artista:</strong> {resultado.consentimiento.artistaSeleccionado}</p>
                        <p className="italic mt-2 text-green-700">Este consentimiento es válido y está registrado en nuestro sistema.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-800">
                      <X className="h-5 w-5 mr-2" />
                      <p>{resultado.mensaje}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;