import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreateListRequest } from "@/services/lists";

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (listData: CreateListRequest) => Promise<void>;
  classes: Array<{ id: string; name: string }>;
}

export default function CreateListModal({ isOpen, onClose, onSubmit, classes }: CreateListModalProps) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    classIds: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const [classSearch, setClassSearch] = useState('');

  const filteredClasses = classes.filter(cls => 
    cls.name.toLowerCase().includes(classSearch.toLowerCase()) ||
    cls.id.toLowerCase().includes(classSearch.toLowerCase())
  );

  useEffect(() => {
    if (isOpen && classes.length > 0 && form.classIds.length === 0) {
      const defaultClassIds = classes.map(c => c.id);
      setForm(prev => ({ ...prev, classIds: defaultClassIds }));
    }
  }, [isOpen, classes, form.classIds.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title.trim()) {
      alert('Title is required');
      return;
    }

    try {
      setLoading(true);
      
      const listData: CreateListRequest = {
        title: form.title,
        description: form.description,
        startDate: form.startDate || new Date().toISOString(),
        endDate: form.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        classIds: form.classIds.length > 0 ? form.classIds : [classes[0]?.id || '']
      };

      await onSubmit(listData);
      
      setForm({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        classIds: []
      });
      
      onClose();
      alert('List created successfully!');
    } catch (error) {
      console.error('Error creating list:', error);
      alert(error instanceof Error ? error.message : 'Error creating list');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setForm({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        classIds: []
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4">Nova Lista</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título *
            </label>
            <Input
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Digite o título da lista"
              disabled={loading}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Digite a descrição da lista"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              disabled={loading}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Início
              </label>
              <Input
                type="datetime-local"
                value={form.startDate}
                onChange={(e) => setForm(prev => ({ ...prev, startDate: e.target.value }))}
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Fim
              </label>
              <Input
                type="datetime-local"
                value={form.endDate}
                onChange={(e) => setForm(prev => ({ ...prev, endDate: e.target.value }))}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Turmas
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (classSearch) {
                      const filteredIds = filteredClasses.map(c => c.id);
                      const newIds = [...new Set([...form.classIds, ...filteredIds])];
                      setForm(prev => ({ ...prev, classIds: newIds }));
                    } else {
                      setForm(prev => ({ ...prev, classIds: classes.map(c => c.id) }));
                    }
                  }}
                  disabled={loading}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  {classSearch ? 'Selecionar Filtradas' : 'Selecionar Todas'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (classSearch) {
                      const filteredIds = filteredClasses.map(c => c.id);
                      setForm(prev => ({ ...prev, classIds: prev.classIds.filter(id => !filteredIds.includes(id)) }));
                    } else {
                      setForm(prev => ({ ...prev, classIds: [] }));
                    }
                  }}
                  disabled={loading}
                  className="text-xs text-gray-600 hover:text-gray-800 font-medium"
                >
                  {classSearch ? 'Remover Filtradas' : 'Limpar'}
                </button>
              </div>
            </div>
            
            <div className="mb-3">
              <Input
                type="text"
                placeholder="Buscar turmas..."
                value={classSearch}
                onChange={(e) => setClassSearch(e.target.value)}
                disabled={loading}
                className="w-full text-sm"
              />
            </div>
            
            <div className="border border-gray-200 rounded-lg p-3 max-h-40 overflow-y-auto bg-gray-50">
              {classes.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Nenhuma turma disponível
                </div>
              ) : filteredClasses.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Nenhuma turma encontrada para &quot;{classSearch}&quot;
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredClasses.map((cls) => (
                    <label key={cls.id} className="flex items-center p-2 hover:bg-white rounded-md transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.classIds.includes(cls.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setForm(prev => ({ ...prev, classIds: [...prev.classIds, cls.id] }));
                          } else {
                            setForm(prev => ({ ...prev, classIds: prev.classIds.filter(id => id !== cls.id) }));
                          }
                        }}
                        disabled={loading}
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-900">{cls.name}</span>
                      </div>
                      {form.classIds.includes(cls.id) && (
                        <div className="ml-2">
                          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>
            
            {form.classIds.length > 0 && (
              <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-blue-800">
                    {form.classIds.length} turma{form.classIds.length !== 1 ? 's' : ''} selecionada{form.classIds.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="mt-1 text-xs text-blue-600">
                  {form.classIds.map(id => {
                    const cls = classes.find(c => c.id === id);
                    return cls?.name;
                  }).filter(Boolean).join(', ')}
                </div>
              </div>
            )}
          </div>
        </form>
        
        <div className="flex gap-3 mt-6">
          <Button 
            onClick={handleSubmit} 
            className="flex-1"
            disabled={loading}
          >
            {loading ? 'Criando...' : 'Criar Lista'}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleClose} 
            className="flex-1"
            disabled={loading}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
