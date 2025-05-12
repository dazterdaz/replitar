import React, { useState } from 'react';
import { useConfig } from '../../contexts/ConfigContext';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

const PreguntasSalud: React.FC = () => {
  const { config, addPreguntaSalud, updatePreguntaSalud, removePreguntaSalud } = useConfig();
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [newPregunta, setNewPregunta] = useState({
    pregunta: '',
    respuestaPorDefecto: false,
    mostrarCampoAdicional: false,
    campoAdicionalSoloSi: false
  });
  
  const [editPregunta, setEditPregunta] = useState({
    id: '',
    pregunta: '',
    respuestaPorDefecto: false,
    mostrarCampoAdicional: false,
    campoAdicionalSoloSi: false
  });
  
  const handleShowForm = () => {
    setShowForm(true);
    setNewPregunta({
      pregunta: '',
      respuestaPorDefecto: false,
      mostrarCampoAdicional: false,
      campoAdicionalSoloSi: false
    });
  };
  
  const handleCancelForm = () => {
    setShowForm(false);
    setNewPregunta({
      pregunta: '',
      respuestaPorDefecto: false,
      mostrarCampoAdicional: false,
      campoAdicionalSoloSi: false
    });
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setNewPregunta(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setEditPregunta(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPregunta.pregunta.trim()) {
      alert('La pregunta es obligatoria');
      return;
    }
    
    try {
      await addPreguntaSalud({
        id: `pregunta_${Date.now()}`,
        ...newPregunta
      });
      
      setShowForm(false);
      setNewPregunta({
        pregunta: '',
        respuestaPorDefecto: false,
        mostrarCampoAdicional: false,
        campoAdicionalSoloSi: false
      });
    } catch (error) {
      console.error('Error al añadir pregunta:', error);
      alert('Error al añadir pregunta');
    }
  };
  
  const handleEdit = (pregunta: any) => {
    setEditingId(pregunta.id);
    setEditPregunta({
      id: pregunta.id,
      pregunta: pregunta.pregunta,
      respuestaPorDefecto: pregunta.respuestaPorDefecto,
      mostrarCampoAdicional: pregunta.mostrarCampoAdicional,
      campoAdicionalSoloSi: pregunta.campoAdicionalSoloSi
    });
  };
  
  const handleCancelEdit = () => {
    setEditingId(null);
  };
  
  const handleSaveEdit = async () => {
    if (!editPregunta.pregunta.trim()) {
      alert('La pregunta es obligatoria');
      return;
    }
    
    try {
      await updatePreguntaSalud(editPregunta.id, {
        pregunta: editPregunta.pregunta,
        respuestaPorDefecto: editPregunta.respuestaPorDefecto,
        mostrarCampoAdicional: editPregunta.mostrarCampoAdicional,
        campoAdicionalSoloSi: editPregunta.campoAdicionalSoloSi
      });
      
      setEditingId(null);
    } catch (error) {
      console.error('Error al actualizar pregunta:', error);
      alert('Error al actualizar pregunta');
    }
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta pregunta?')) {
      try {
        await removePreguntaSalud(id);
      } catch (error) {
        console.error('Error al eliminar pregunta:', error);
        alert('Error al eliminar pregunta');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Gestión de Preguntas de Salud</h2>
        
        <button
          onClick={handleShowForm}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        >
          <Plus size={16} className="mr-1" />
          Nueva Pregunta
        </button>
      </div>
      
      {showForm && (
        <div className="bg-teal-50 p-4 rounded-md border border-teal-200 mb-6">
          <h3 className="text-md font-medium text-teal-800 mb-3">Añadir Nueva Pregunta</h3>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="pregunta" className="block text-sm font-medium text-gray-700 mb-1">
                  Pregunta
                </label>
                <textarea
                  id="pregunta"
                  name="pregunta"
                  value={newPregunta.pregunta}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Escribe la pregunta..."
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="respuestaPorDefecto"
                      checked={newPregunta.respuestaPorDefecto}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Respuesta por defecto "Sí"</span>
                  </label>
                </div>
                
                <div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="mostrarCampoAdicional"
                      checked={newPregunta.mostrarCampoAdicional}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Mostrar campo adicional</span>
                  </label>
                </div>
                
                <div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="campoAdicionalSoloSi"
                      checked={newPregunta.campoAdicionalSoloSi}
                      onChange={handleInputChange}
                      disabled={!newPregunta.mostrarCampoAdicional}
                      className={`h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded ${
                        !newPregunta.mostrarCampoAdicional ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    />
                    <span className={`ml-2 text-sm text-gray-700 ${
                      !newPregunta.mostrarCampoAdicional ? 'opacity-50' : ''
                    }`}>
                      Campo adicional solo si respuesta es "Sí"
                    </span>
                  </label>
                </div>
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
                  Pregunta
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resp. Default
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campo Adicional
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Solo si "Sí"
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {config.preguntasSalud.map((pregunta) => (
                <tr key={pregunta.id}>
                  <td className="px-6 py-4">
                    {editingId === pregunta.id ? (
                      <textarea
                        name="pregunta"
                        value={editPregunta.pregunta}
                        onChange={handleEditInputChange}
                        className="w-full px-3 py-1 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                        rows={2}
                      />
                    ) : (
                      <div className="text-sm text-gray-900">
                        {pregunta.pregunta}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {editingId === pregunta.id ? (
                      <input
                        type="checkbox"
                        name="respuestaPorDefecto"
                        checked={editPregunta.respuestaPorDefecto}
                        onChange={handleEditInputChange}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      />
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        pregunta.respuestaPorDefecto ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {pregunta.respuestaPorDefecto ? 'Sí' : 'No'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {editingId === pregunta.id ? (
                      <input
                        type="checkbox"
                        name="mostrarCampoAdicional"
                        checked={editPregunta.mostrarCampoAdicional}
                        onChange={handleEditInputChange}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      />
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        pregunta.mostrarCampoAdicional ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {pregunta.mostrarCampoAdicional ? 'Sí' : 'No'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {editingId === pregunta.id ? (
                      <input
                        type="checkbox"
                        name="campoAdicionalSoloSi"
                        checked={editPregunta.campoAdicionalSoloSi}
                        onChange={handleEditInputChange}
                        disabled={!editPregunta.mostrarCampoAdicional}
                        className={`h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded ${
                          !editPregunta.mostrarCampoAdicional ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      />
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        pregunta.campoAdicionalSoloSi && pregunta.mostrarCampoAdicional 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {pregunta.campoAdicionalSoloSi && pregunta.mostrarCampoAdicional ? 'Sí' : 'No'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {editingId === pregunta.id ? (
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
                          onClick={() => handleEdit(pregunta)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(pregunta.id)}
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
              
              {config.preguntasSalud.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No hay preguntas registradas
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

export default PreguntasSalud;