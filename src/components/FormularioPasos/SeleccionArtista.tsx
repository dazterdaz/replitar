import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useConfig } from '../../contexts/ConfigContext';
import { User } from 'lucide-react';

const SeleccionArtista: React.FC = () => {
  const { register, setValue, watch, formState: { errors } } = useFormContext();
  const { config } = useConfig();
  const { artistas } = config;
  
  // Filtrar solo artistas activos
  const artistasActivos = artistas.filter(artista => artista.activo);
  
  // Obtener el artista seleccionado actual
  const artistaSeleccionado = watch('artistaSeleccionado');
  
  // Manejar clic en la tarjeta del artista
  const handleArtistaClick = (nombreArtista: string) => {
    setValue('artistaSeleccionado', nombreArtista, { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Selección de Artista</h2>
      
      <p className="text-gray-600 mb-4">
        Por favor, selecciona el artista que realizará tu tatuaje.
      </p>
      
      <div>
        <label htmlFor="artista" className="block text-sm font-medium text-gray-700 mb-2">
          Artista a cargo
        </label>
        <select
          id="artista"
          className={`w-full px-3 py-2 border rounded-md ${
            errors.artistaSeleccionado ? 'border-red-500' : 'border-gray-300'
          }`}
          {...register('artistaSeleccionado', { 
            required: 'Debes seleccionar un artista' 
          })}
        >
          <option value="">Selecciona un artista</option>
          {artistasActivos.map(artista => (
            <option key={artista.id} value={artista.nombre}>
              {artista.nombre}
            </option>
          ))}
        </select>
        {errors.artistaSeleccionado && (
          <p className="mt-1 text-sm text-red-600">{errors.artistaSeleccionado.message as string}</p>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {artistasActivos.map(artista => (
          <div 
            key={artista.id} 
            className={`bg-white p-4 rounded-lg shadow-sm text-center cursor-pointer transition-all duration-200 ${
              artistaSeleccionado === artista.nombre 
                ? 'ring-2 ring-teal-500 transform scale-105' 
                : 'hover:shadow-md hover:scale-105'
            }`}
            onClick={() => handleArtistaClick(artista.nombre)}
          >
            {artista.imagen ? (
              <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden">
                <img 
                  src={artista.imagen} 
                  alt={artista.nombre}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="text-gray-500" size={32} />
              </div>
            )}
            <h4 className="font-medium">{artista.nombre}</h4>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeleccionArtista;