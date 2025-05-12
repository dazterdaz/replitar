import React from 'react';
import { useConfig } from '../contexts/ConfigContext';
import { X, Instagram, Mail, Phone } from 'lucide-react';
import { formatRut } from '../utils/formatters';

interface ContactPopupProps {
  onClose: () => void;
}

const ContactPopup: React.FC<ContactPopupProps> = ({ onClose }) => {
  const { config } = useConfig();
  const { datosContacto } = config;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <h3 className="text-2xl font-bold mb-4 text-center">Información de Contacto</h3>
        <p className="text-gray-600 mb-6 text-center">
          ¿Te interesa tener un sistema como este para tu estudio? ¡Contáctame!
        </p>

        <div className="space-y-4">
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="bg-teal-100 p-2 rounded-full mr-3">
              <span className="font-bold text-teal-600">{datosContacto.nombre.substring(0, 1)}</span>
            </div>
            <div>
              <p className="font-medium">{datosContacto.nombre}</p>
              <p className="text-sm text-gray-500">Desarrollador Web</p>
            </div>
          </div>

          {datosContacto.whatsapp && (
            <a
              href={`https://wa.me/${datosContacto.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="bg-green-100 p-2 rounded-full mr-3">
                <Phone size={18} className="text-green-600" />
              </div>
              <span>{datosContacto.whatsapp}</span>
            </a>
          )}

          {datosContacto.email && (
            <a
              href={`mailto:${datosContacto.email}`}
              className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <Mail size={18} className="text-blue-600" />
              </div>
              <span>{datosContacto.email}</span>
            </a>
          )}

          {datosContacto.instagram && (
            <a
              href={`https://instagram.com/${datosContacto.instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="bg-purple-100 p-2 rounded-full mr-3">
                <Instagram size={18} className="text-purple-600" />
              </div>
              <span>{datosContacto.instagram}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactPopup;