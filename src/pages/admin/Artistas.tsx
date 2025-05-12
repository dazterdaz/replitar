import React, { useState } from 'react';
import { useConfig } from '../../contexts/ConfigContext';
import { Plus, Edit, Trash2, Save, X, Check, Image as ImageIcon, User } from 'lucide-react';

const Artistas: React.FC = () => {
  const { config, addArtista, updateArtista, removeArtista } = useConfig();
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [newArtista, setNewArtista] = useState({
    nombre: '',
    activo: true,
    imagen: ''
  });
  
  const [editArtista, setEditArtista] = useState({
    id: '',
    nombre: '',
    activo: true,
    imagen: ''
  });
  
  const handleShowForm = () => {
    setShowForm(true);
    setNewArtista({
      nombre: '',
      activo: true,
      imagen: ''
    });
  };
  
  const handleCancelForm = () => {
    setShowForm(false);
    setNewArtista({
      nombre: '',
      activo: true,
      imagen: ''
    });
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNewArtista(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setEditArtista(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        alert('La imagen es demasiado grande. El tamaño máximo es 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const imageUrl = reader.result as string;
        if (isEditing) {
          setEditArtista(prev => ({ ...prev, imagen: imageUrl }));
        } else {
          setNewArtista(prev => ({ ...prev, imagen: imageUrl }));
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newArtista.nombre.trim()) {
      alert('El nombre del artista es obligatorio');
      return;
    }
    
    try {
      await addArtista({
        id: `artista_${Date.now()}`,
        nombre: newArtista.nombre,
        activo: newArtista.activo,
        imagen: newArtista.imagen
      });
      
      setShowForm(false);
      setNewArtista({
        nombre: '',
        activo: true,
        imagen: ''
      });
    } catch (error) {
      console.error('Error al añadir artista:', error);
      alert('Error al añadir artista');
    }
  };
  
  const handleEdit = (artista: any) => {
    setEditingId(artista.id);
    setEditArtista({
      id: artista.id,
      nombre: artista.nombre,
      activo: artista.activo,
      imagen: artista.imagen || ''
    });
  };
  
  const handleCancelEdit = () => {
    setEditingId(null);
  };
  
  const handleSaveEdit = async () => {
    if (!editArtista.nombre.trim()) {
      alert('El nombre del artista es obligatorio');
      return;
    }
    
    try {
      await updateArtista(editArtista.id, {
        nombre: editArtista.nombre,
        activo: editArtista.activo,
        imagen: editArtista.imagen
      });
      
      setEditingId(null);
    } catch (error) {
      console.error('Error al actualizar artista:', error);
      alert('Error al actualizar artista');
    }
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este artista?')) {
      try {
        await removeArtista(id);
      } catch (error: any) {
        console.error('Error al eliminar artista:', error);
        // Mostrar mensaje específico si el error está relacionado con consentimientos
        if (error.message && error.message.includes('consentimientos asociados')) {
          alert(error.message);
        } else {
          alert('Error al eliminar artista');
        }
      }
    }
  };
  
  const toggleActivo = async (id: string, activo: boolean) => {
    try {
      await updateArtista(id, { activo: !activo });
    } catch (error) {
      console.error('Error al actualizar artista:', error);
      alert('Error al actualizar artista');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Gestión de Artistas</h2>
        
        <button
          onClick={handleShowForm}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        >
          <Plus size={16} className="mr-1" />
          Nuevo Artista
        </button>
      </div>
      
      {showForm && (
        <div className="bg-teal-50 p-4 rounded-md border border-teal-200 mb-6">
          <h3 className="text-md font-medium text-teal-800 mb-3">Añadir Nuevo Artista</h3>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-2">
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Artista
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={newArtista.nombre}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Nombre completo"
                />
              </div>
              
              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="activo"
                    checked={newArtista.activo}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Artista Activo</span>
                </label>
              </div>

              <div className="col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imagen del Artista
                </label>
                <div className="flex items-center space-x-4">
                  {newArtista.imagen ? (
                    <div className="w-20 h-20 rounded-full overflow-hidden">
                      <img 
                        src={newArtista.imagen} 
                        alt="Vista previa" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                      <ImageIcon className="text-gray-400" size={32} />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, false)}
                    className="flex-1"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Máximo 5MB. Formatos recomendados: JPG, PNG
                </p>
              </div>
            </div>
            
            <div className="flex justify-end mt-4 space-x-2">
              <button
                type="button"
                onClick={handleCancelForm}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="bg-white rounded-md border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Artista
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {config.artistas.map((artista) => (
                <tr key={artista.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {editingId === artista.id ? (
                        <div className="flex-1 space-y-3">
                          <input
                            type="text"
                            name="nombre"
                            value={editArtista.nombre}
                            onChange={handleEditInputChange}
                            className="w-full px-3 py-1 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                          />
                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageChange(e, true)}
                              className="w-full"
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          {artista.imagen ? (
                            <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                              <img 
                                src={artista.imagen} 
                                alt={artista.nombre}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                              <User className="text-gray-500" size={20} />
                            </div>
                          )}
                          <div className="text-sm font-medium text-gray-900">
                            {artista.nombre}
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === artista.id ? (
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="activo"
                          checked={editArtista.activo}
                          onChange={handleEditInputChange}
                          className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Activo</span>
                      </label>
                    ) : (
                      <span 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          artista.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}
                        onClick={() => toggleActivo(artista.id, artista.activo)}
                        style={{ cursor: 'pointer' }}
                      >
                        {artista.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {editingId === artista.id ? (
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={handleSaveEdit}
                          className="text-teal-600 hover:text-teal-900"
                          title="Guardar"
                        >
                          <Save size={18} />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-gray-600 hover:text-gray-900"
                          title="Cancelar"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(artista)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(artista.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              
              {config.artistas.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                    No hay artistas registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Artistas;