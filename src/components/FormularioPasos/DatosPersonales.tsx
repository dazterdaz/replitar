import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { format } from 'date-fns';
import regionesChile from '../../data/regiones';
import { formatRut } from '../../utils/formatters';

const DatosPersonales: React.FC = () => {
  const { register, watch, setValue, formState: { errors, isSubmitted } } = useFormContext();
  const [regionSeleccionada, setRegionSeleccionada] = useState<number | null>(null);
  const [comunas, setComunas] = useState<string[]>([]);
  
  const fechaNacimiento = watch('cliente.fechaNacimiento');
  const edad = watch('cliente.edad');
  const rut = watch('cliente.rut');

  // Calcular edad basada en la fecha de nacimiento
  useEffect(() => {
    if (fechaNacimiento) {
      const fechaNac = new Date(fechaNacimiento);
      const hoy = new Date();
      let edadCalculada = hoy.getFullYear() - fechaNac.getFullYear();
      const m = hoy.getMonth() - fechaNac.getMonth();
      
      if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) {
        edadCalculada--;
      }
      
      setValue('cliente.edad', edadCalculada);
    }
  }, [fechaNacimiento, setValue]);

  // Actualizar comunas cuando cambia la región
  useEffect(() => {
    if (regionSeleccionada) {
      const region = regionesChile.find(r => r.id === regionSeleccionada);
      if (region) {
        setComunas(region.comunas);
        setValue('cliente.direccion.region', region.nombre);
      }
    } else {
      setComunas([]);
      setValue('cliente.direccion.comuna', '');
    }
  }, [regionSeleccionada, setValue]);

  // Manejar cambio de región
  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const regionId = parseInt(e.target.value);
    setRegionSeleccionada(regionId || null);
  };

  // Formatear RUT mientras se escribe
  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue('cliente.rut', value);
  };

  // Solo mostrar errores si se ha intentado enviar el formulario
  const showError = (fieldName: string) => {
    return isSubmitted && errors.cliente?.[fieldName];
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Datos Personales</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
        {/* Información Personal Básica */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Información Personal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                id="nombre"
                type="text"
                className={`w-full px-3 py-2 border rounded-md ${
                  showError('nombre') ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ingresa tu nombre"
                {...register('cliente.nombre', { required: 'El nombre es obligatorio' })}
              />
              {showError('nombre') && (
                <p className="mt-1 text-sm text-red-600">{errors.cliente?.nombre?.message as string}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700 mb-1">
                Apellidos
              </label>
              <input
                id="apellidos"
                type="text"
                className={`w-full px-3 py-2 border rounded-md ${
                  showError('apellidos') ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ingresa tus apellidos"
                {...register('cliente.apellidos', { required: 'Los apellidos son obligatorios' })}
              />
              {showError('apellidos') && (
                <p className="mt-1 text-sm text-red-600">{errors.cliente?.apellidos?.message as string}</p>
              )}
            </div>
          </div>
        </div>

        {/* Identificación */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Identificación</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="rut" className="block text-sm font-medium text-gray-700 mb-1">
                RUT / Pasaporte
              </label>
              <input
                id="rut"
                type="text"
                className={`w-full px-3 py-2 border rounded-md ${
                  showError('rut') ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="12.345.678-9 o Pasaporte"
                {...register('cliente.rut', { required: 'El RUT o pasaporte es obligatorio' })}
                onChange={handleRutChange}
              />
              {rut && !showError('rut') && (
                <p className="mt-1 text-sm text-gray-500">
                  Formato: {formatRut(rut)}
                </p>
              )}
              {showError('rut') && (
                <p className="mt-1 text-sm text-red-600">{errors.cliente?.rut?.message as string}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="fechaNacimiento" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Nacimiento
              </label>
              <input
                id="fechaNacimiento"
                type="date"
                max={format(new Date(), 'yyyy-MM-dd')}
                className={`w-full px-3 py-2 border rounded-md ${
                  showError('fechaNacimiento') ? 'border-red-500' : 'border-gray-300'
                }`}
                {...register('cliente.fechaNacimiento', { required: 'La fecha de nacimiento es obligatoria' })}
              />
              {showError('fechaNacimiento') && (
                <p className="mt-1 text-sm text-red-600">{errors.cliente?.fechaNacimiento?.message as string}</p>
              )}
            </div>
          </div>

          {edad !== undefined && (
            <div className="mt-2">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                edad < 18 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {edad < 18 
                  ? `Menor de edad (${edad} años)` 
                  : `Mayor de edad (${edad} años)`
                }
              </div>
            </div>
          )}
        </div>
        
        {/* Dirección */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Dirección</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
                Región
              </label>
              <select
                id="region"
                className={`w-full px-3 py-2 border rounded-md ${
                  showError('direccion.region') ? 'border-red-500' : 'border-gray-300'
                }`}
                onChange={handleRegionChange}
                defaultValue=""
              >
                <option value="" disabled>Selecciona una región</option>
                {regionesChile.map(region => (
                  <option key={region.id} value={region.id}>
                    {region.nombre}
                  </option>
                ))}
              </select>
              {showError('direccion.region') && (
                <p className="mt-1 text-sm text-red-600">{errors.cliente?.direccion?.region?.message as string}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="comuna" className="block text-sm font-medium text-gray-700 mb-1">
                Comuna
              </label>
              <select
                id="comuna"
                className={`w-full px-3 py-2 border rounded-md ${
                  showError('direccion.comuna') ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={!regionSeleccionada}
                {...register('cliente.direccion.comuna', { required: 'La comuna es obligatoria' })}
              >
                <option value="" disabled>
                  {!regionSeleccionada ? 'Primero selecciona una región' : 'Selecciona una comuna'}
                </option>
                {comunas.map(comuna => (
                  <option key={comuna} value={comuna}>
                    {comuna}
                  </option>
                ))}
              </select>
              {showError('direccion.comuna') && (
                <p className="mt-1 text-sm text-red-600">{errors.cliente?.direccion?.comuna?.message as string}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="calle" className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <input
                id="calle"
                type="text"
                className={`w-full px-3 py-2 border rounded-md ${
                  showError('direccion.calle') ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ingresa tu dirección completa"
                {...register('cliente.direccion.calle', { required: 'La dirección es obligatoria' })}
              />
              {showError('direccion.calle') && (
                <p className="mt-1 text-sm text-red-600">{errors.cliente?.direccion?.calle?.message as string}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Contacto */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Información de Contacto</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                id="telefono"
                type="tel"
                className={`w-full px-3 py-2 border rounded-md ${
                  showError('telefono') ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+56 9 XXXX XXXX"
                {...register('cliente.telefono', { required: 'El teléfono es obligatorio' })}
              />
              {showError('telefono') && (
                <p className="mt-1 text-sm text-red-600">{errors.cliente?.telefono?.message as string}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                className={`w-full px-3 py-2 border rounded-md ${
                  showError('email') ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="tu@email.com"
                {...register('cliente.email', { 
                  required: 'El correo electrónico es obligatorio',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Correo electrónico inválido'
                  }
                })}
              />
              {showError('email') && (
                <p className="mt-1 text-sm text-red-600">{errors.cliente?.email?.message as string}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatosPersonales;