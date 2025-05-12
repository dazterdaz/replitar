import React, { useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import SignatureCanvas from 'react-signature-canvas';
import { format } from 'date-fns';
import { Undo2 } from 'lucide-react';

interface FirmaDigitalProps {
  onCompleteStepChange: (complete: boolean) => void;
  onSubmit: () => void;
}

const FirmaDigital: React.FC<FirmaDigitalProps> = ({ onCompleteStepChange, onSubmit }) => {
  const { setValue } = useFormContext();
  const [firmado, setFirmado] = useState(false);
  const sigCanvas = useRef<SignatureCanvas | null>(null);
  const [fechaFirma] = useState<string>(format(new Date(), 'dd/MM/yyyy'));

  const limpiarFirma = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      setFirmado(false);
      onCompleteStepChange(false);
    }
  };

  const guardarFirma = () => {
    if (sigCanvas.current) {
      if (sigCanvas.current.isEmpty()) {
        alert('Por favor realiza tu firma antes de continuar.');
        return;
      }
      
      const firmaDataURL = sigCanvas.current.toDataURL('image/png');
      setValue('firma', firmaDataURL);
      setFirmado(true);
      onCompleteStepChange(true);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Firma Digital</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-600 mb-4">
          Por favor, firma en el espacio a continuación utilizando el mouse, el dedo o lápiz óptico.
        </p>
        
        <div className="border-2 border-gray-300 rounded-lg overflow-hidden mb-4">
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
        
        <div className="mt-4 text-right">
          <p className="text-sm text-gray-500">
            Fecha: {fechaFirma}
          </p>
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

export default FirmaDigital;