import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useConfig } from '../contexts/ConfigContext';
import { useConsentimientos } from '../contexts/ConsentimientosContext';
import { Palette, CheckCircle, ArrowLeft, ArrowRight, FileDown } from 'lucide-react';
import { generatePDF } from '../utils/pdfGenerator';
import { format } from 'date-fns';
import ErrorMessageSupabase from '../components/ErrorMessageSupabase';

// Componentes de pasos del formulario
import DatosPersonales from '../components/FormularioPasos/DatosPersonales';
import DatosTutor from '../components/FormularioPasos/DatosTutor';
import InformacionSalud from '../components/FormularioPasos/InformacionSalud';
import SeleccionArtista from '../components/FormularioPasos/SeleccionArtista';
import DocumentosCedula from '../components/FormularioPasos/DocumentosCedula';
import ConsentimientoFirma from '../components/FormularioPasos/ConsentimientoFirma';

const FormularioConsentimiento: React.FC = () => {
  const { config, connectionError } = useConfig();
  const { addConsentimiento, connectionError: consentimientosConnectionError } = useConsentimientos();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isPasoFirmaCompleto, setIsPasoFirmaCompleto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorSubmit, setErrorSubmit] = useState<string | null>(null);
  
  // Crear formulario
  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      cliente: {
        nombre: '',
        apellidos: '',
        edad: 0,
        rut: '',
        fechaNacimiento: '',
        direccion: {
          calle: '',
          region: '',
          comuna: ''
        },
        telefono: '',
        email: '',
        confirmacionDatos: false
      },
      tutor: {
        nombre: '',
        rut: '',
        parentesco: '',
        otroParentesco: ''
      },
      informacionSalud: {},
      artistaSeleccionado: '',
      confirmacionConsentimiento: false,
      firma: ''
    }
  });
  
  // Observar cliente.edad para determinar validez del paso de tutor
  const clienteEdad = methods.watch('cliente.edad');

  const totalSteps = clienteEdad < 18 ? 6 : 5;

  // Avanzar al siguiente paso
  const nextStep = async () => {
    setErrorSubmit(null); // Limpiar errores anteriores
    let isValid = false;
    
    switch (currentStep) {
      case 1: // Datos Personales
        isValid = await methods.trigger([
          'cliente.nombre', 
          'cliente.apellidos', 
          'cliente.rut', 
          'cliente.fechaNacimiento',
          'cliente.direccion.calle',
          'cliente.direccion.region',
          'cliente.direccion.comuna',
          'cliente.telefono',
          'cliente.email'
        ], { shouldFocus: true });
        break;
        
      case 2: // Datos Tutor (solo para menores)
        if (clienteEdad < 18) {
          isValid = await methods.trigger([
            'tutor.nombre',
            'tutor.rut',
            'tutor.parentesco'
          ], { shouldFocus: true });
          if (methods.getValues('tutor.parentesco') === 'Otro') {
            isValid = isValid && await methods.trigger('tutor.otroParentesco', { shouldFocus: true });
          }
        } else {
          isValid = true;
        }
        break;
        
      case 3: // Información Salud
        const informacionSalud = methods.getValues('informacionSalud');
        // Verificamos que al menos las primeras 10 preguntas estén respondidas (las más importantes)
        isValid = Array.from({ length: 10 }).every((_, i) => 
          informacionSalud[i] && informacionSalud[i].respuesta !== undefined
        );
        if (!isValid) {
          setErrorSubmit('Por favor responde todas las preguntas de salud importantes.');
        }
        break;
        
      case 4: // Selección Artista
        isValid = await methods.trigger('artistaSeleccionado', { shouldFocus: true });
        break;
        
      case 5: // Documentos Cédula o Consentimiento y Firma para mayores
        if (clienteEdad >= 18) {
          // Si es mayor y estamos en el paso de consentimiento y firma
          if (!methods.getValues('confirmacionConsentimiento')) {
            setErrorSubmit('Debes confirmar que has leído y aceptas los términos del consentimiento.');
            return;
          }
          
          if (!methods.getValues('firma')) {
            setErrorSubmit('Debes firmar el consentimiento antes de enviar.');
            return;
          }
          
          // Si llegamos aquí, debemos enviar el formulario
          isValid = true;
          try {
            await handleSubmit();
          } catch (error) {
            console.error('Error al enviar el formulario:', error);
            // No avanzamos al siguiente paso si hay un error
            return;
          }
          return; // Salimos para evitar el avance automático
        } else {
          // Si es menor y estamos en el paso de documentos, simplemente continuamos
          isValid = true; // Este paso es opcional
        }
        break;
        
      case 6: // Consentimiento y Firma para menores
        if (!methods.getValues('confirmacionConsentimiento')) {
          setErrorSubmit('Debes confirmar que has leído y aceptas los términos del consentimiento.');
          return;
        }
        
        if (!methods.getValues('firma')) {
          setErrorSubmit('Debes firmar el consentimiento antes de enviar.');
          return;
        }
        
        // Si llegamos aquí, debemos enviar el formulario
        isValid = true;
        try {
          await handleSubmit();
        } catch (error) {
          console.error('Error al enviar el formulario:', error);
          // No avanzamos al siguiente paso si hay un error
          return;
        }
        return; // Salimos para evitar el avance automático
        
      default:
        isValid = false;
    }
    
    if (isValid) {
      setCurrentStep(Math.min(currentStep + 1, totalSteps));
      window.scrollTo(0, 0);
    }
  };
  
  // Retroceder al paso anterior
  const prevStep = () => {
    setCurrentStep(Math.max(currentStep - 1, 1));
    window.scrollTo(0, 0);
    setErrorSubmit(null); // Limpiar errores al retroceder
  };
  
  // Manejar envío del formulario
  const handleSubmit = async () => {
    if (isSubmitting) return; // Prevenir múltiples envíos
    
    setErrorSubmit(null);
    setIsSubmitting(true);
    
    try {
      const formData = methods.getValues();
      
      if (!formData.confirmacionConsentimiento) {
        setErrorSubmit('Debes confirmar que has leído y aceptas los términos del consentimiento.');
        setIsSubmitting(false);
        return;
      }
      
      if (!formData.firma) {
        setErrorSubmit('Debes firmar el consentimiento antes de enviar.');
        setIsSubmitting(false);
        return;
      }
      
      console.log("Enviando formulario...");
      
      // Convertir respuestas booleanas
      const informacionSaludProcesada: any = {};
      Object.keys(formData.informacionSalud).forEach(preguntaId => {
        informacionSaludProcesada[preguntaId] = {
          respuesta: formData.informacionSalud[preguntaId].respuesta === 'true',
          informacionAdicional: formData.informacionSalud[preguntaId].informacionAdicional
        };
      });
      
      // Crear objeto de consentimiento
      const consentimiento = await addConsentimiento({
        cliente: formData.cliente,
        tutor: clienteEdad < 18 ? formData.tutor : undefined,
        informacionSalud: informacionSaludProcesada,
        artistaSeleccionado: formData.artistaSeleccionado,
        cedulaCliente: formData.cedulaCliente,
        firma: formData.firma
      });
      
      console.log("Consentimiento guardado:", consentimiento);
      
      // Generar PDF
      const pdf = generatePDF(consentimiento, config);
      const pdfData = pdf.output('datauristring');
      
      // Redirigir a la página de éxito con los datos necesarios
      navigate('/exito', { 
        state: {
          consentimientoId: consentimiento.id,
          consentimientoCodigo: consentimiento.codigo,
          clienteNombre: consentimiento.cliente.nombre,
          pdfData: pdfData
        }
      });
      
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      setErrorSubmit('Ocurrió un error al enviar el formulario. Por favor intenta de nuevo.');
      setIsSubmitting(false);
    }
  };

  // Renderizar paso actual
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <DatosPersonales />;
      case 2:
        // Si es mayor de edad, mostrar información de salud en vez de datos del tutor
        return clienteEdad >= 18 ? <InformacionSalud /> : <DatosTutor />;
      case 3:
        // Si es mayor de edad, mostrar selección de artista, de lo contrario información de salud
        return clienteEdad >= 18 ? <SeleccionArtista /> : <InformacionSalud />;
      case 4:
        // Si es mayor de edad, mostrar documentos cédula, de lo contrario selección de artista
        return clienteEdad >= 18 ? <DocumentosCedula /> : <SeleccionArtista />;
      case 5:
        // Si es mayor de edad, mostrar consentimiento y firma, de lo contrario documentos cédula
        return clienteEdad >= 18 
          ? <ConsentimientoFirma onCompleteStepChange={setIsPasoFirmaCompleto} onSubmit={handleSubmit} /> 
          : <DocumentosCedula />;
      case 6:
        // Este paso solo existe para menores de edad (consentimiento y firma)
        return <ConsentimientoFirma onCompleteStepChange={setIsPasoFirmaCompleto} onSubmit={handleSubmit} />;
      default:
        return <div>Paso no encontrado</div>;
    }
  };

  // Mostrar error de conexión si lo hay
  if (connectionError || consentimientosConnectionError) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 mt-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Formulario de Consentimiento</h2>
          <ErrorMessageSupabase onRetry={() => window.location.reload()} />
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700 transition-colors"
            >
              <ArrowLeft size={16} className="mr-2" />
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <Palette className="text-teal-500" size={28} />
            <h1 className="text-xl font-bold text-gray-800">{config.nombreEstudio}</h1>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Progreso */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-medium text-gray-800">
                Paso {currentStep} de {totalSteps}
              </h2>
              <span className="text-sm text-gray-500">
                {Math.round((currentStep / totalSteps) * 100)}% completado
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-teal-500 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Formulario */}
          <FormProvider {...methods}>
            <form>
              <div className="bg-white shadow-md rounded-lg p-6 md:p-8">
                {renderStep()}
                
                {/* Mensaje de error si existe */}
                {errorSubmit && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {errorSubmit}
                  </div>
                )}
              </div>
              
              {/* Botones de navegación */}
              <div className="flex justify-between mt-6">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700 transition-colors"
                  >
                    <ArrowLeft size={16} className="mr-2" />
                    Anterior
                  </button>
                ) : (
                  <Link 
                    to="/"
                    className="flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700 transition-colors"
                  >
                    <ArrowLeft size={16} className="mr-2" />
                    Volver al inicio
                  </Link>
                )}
                
                {/* Botón Siguiente para todos los pasos */}
                <button
                  type="button"
                  onClick={nextStep}
                  className={`flex items-center px-4 py-2 ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : ((clienteEdad >= 18 && currentStep === 5) || (clienteEdad < 18 && currentStep === 6)) && !isPasoFirmaCompleto
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-teal-500 hover:bg-teal-600'
                  } text-white rounded-md transition-colors`}
                  disabled={
                    isSubmitting || 
                    (((clienteEdad >= 18 && currentStep === 5) || (clienteEdad < 18 && currentStep === 6)) && !isPasoFirmaCompleto)
                  }
                >
                  {isSubmitting ? (
                    <>
                      <span className="inline-block animate-spin mr-2">⌛</span>
                      Enviando...
                    </>
                  ) : ((clienteEdad >= 18 && currentStep === 5) || (clienteEdad < 18 && currentStep === 6))
                    ? 'Enviar Formulario'
                    : 'Siguiente'
                  }
                  {!isSubmitting && !((clienteEdad >= 18 && currentStep === 5) || (clienteEdad < 18 && currentStep === 6)) && 
                    <ArrowRight size={16} className="ml-2" />
                  }
                </button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
};

export default FormularioConsentimiento;