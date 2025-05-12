import React, { useState } from 'react';
import { useConfig } from '../contexts/ConfigContext';
import { X, Download, Phone } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface CareInstructionsModalProps {
  onClose: () => void;
}

const CareInstructionsModal: React.FC<CareInstructionsModalProps> = ({ onClose }) => {
  const { config } = useConfig();
  const [careType, setCareType] = useState<'cream' | 'patch'>('cream');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleDownloadPDF = () => {
    // Crear un nuevo documento PDF
    const pdf = new jsPDF();
    const margin = 20;
    let y = margin;

    // Configuración del documento
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${config.nombreEstudio}`, 105, y, { align: 'center' });
    y += 10;
    
    pdf.setFontSize(16);
    pdf.text(
      careType === 'cream' 
        ? 'CUIDADOS POST-TATUAJE CON CREMA' 
        : 'CUIDADOS POST-TATUAJE CON PARCHE', 
      105, 
      y, 
      { align: 'center' }
    );
    y += 10;

    // Contenido
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    
    const careText = careType === 'cream' 
      ? config.creamAftercare 
      : config.patchAftercare;
    
    const textLines = pdf.splitTextToSize(careText, 170);
    pdf.text(textLines, 20, y);

    // Pie de página con contacto del estudio
    pdf.setFontSize(10);
    pdf.text(
      `Para cualquier consulta: ${config.datosContacto.whatsapp || 'WhatsApp no disponible'}`,
      105,
      pdf.internal.pageSize.height - 20,
      { align: 'center' }
    );

    // Guardar PDF
    pdf.save(`cuidados_tatuaje_${careType === 'cream' ? 'crema' : 'parche'}.pdf`);
  };
  
  const handleWhatsApp = () => {
    if (!phoneNumber) {
      alert('Por favor ingresa tu número de teléfono');
      return;
    }
    
    // Eliminar caracteres no numéricos del número
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    if (cleanPhone.length < 8) {
      alert('Por favor ingresa un número de teléfono válido');
      return;
    }
    
    // Preparar el texto para WhatsApp
    const careText = careType === 'cream' 
      ? config.creamAftercare 
      : config.patchAftercare;
    
    // Crear la URL con el texto codificado
    const whatsappText = encodeURIComponent(`*CUIDADOS DE TU TATUAJE - ${config.nombreEstudio}*\n\n${careText}`);
    const whatsappURL = `https://wa.me/${cleanPhone}?text=${whatsappText}`;
    
    // Abrir WhatsApp en una nueva pestaña
    window.open(whatsappURL, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <h3 className="text-2xl font-bold mb-4 text-center">Cuidados del Tatuaje</h3>
        <p className="text-gray-600 mb-6 text-center">
          Descarga las instrucciones detalladas de cuidado según el tipo de protección que utilizas.
        </p>

        <div className="mb-6">
          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={() => setCareType('cream')} 
              className={`px-4 py-2 rounded-md transition-colors ${
                careType === 'cream' 
                  ? 'bg-teal-500 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Cuidados con Crema
            </button>
            <button
              onClick={() => setCareType('patch')}
              className={`px-4 py-2 rounded-md transition-colors ${
                careType === 'patch' 
                  ? 'bg-teal-500 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Cuidados con Parche
            </button>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h4 className="font-semibold mb-2">
            {careType === 'cream' ? 'Cuidados con Crema' : 'Cuidados con Parche (Second Skin)'}
          </h4>
          <div className="max-h-60 overflow-y-auto mb-4">
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {careType === 'cream' ? config.creamAftercare : config.patchAftercare}
            </p>
          </div>

          <button
            onClick={handleDownloadPDF}
            className="w-full flex items-center justify-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 mb-4"
          >
            <Download size={18} className="mr-2" />
            Descargar PDF
          </button>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="font-semibold mb-2">Enviar a mi WhatsApp</h4>
          <div className="mb-4">
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Ingresa tu número de teléfono:
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+56 9 XXXX XXXX"
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              />
            </div>
          </div>
          
          <button
            onClick={handleWhatsApp}
            className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="currentColor"
              className="mr-2"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            Enviar por WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

export default CareInstructionsModal;