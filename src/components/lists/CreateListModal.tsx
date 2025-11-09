import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreateListRequest } from "@/services/lists";
import { fromBrazilianDateTimeLocal, validateNotPastDate, validateEndDateAfterStartDate } from "@/utils";
import { Checkbox } from "@/components/ui/checkbox";

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
    classIds: [] as string[],
    countTowardScore: false,
    isRestricted: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    startDate: '',
    endDate: '',
    dateRange: ''
  });

  useEffect(() => {
    if (form.startDate || form.endDate) {
      validateDatesInRealTime();
    }
  }, [form.startDate, form.endDate]);

  const validateDates = () => {
    const newErrors = {
      startDate: '',
      endDate: '',
      dateRange: ''
    };

    if (form.startDate && !validateNotPastDate(fromBrazilianDateTimeLocal(form.startDate))) {
      newErrors.startDate = 'A data de início não pode ser no passado';
    }

    if (form.endDate && !validateNotPastDate(fromBrazilianDateTimeLocal(form.endDate))) {
      newErrors.endDate = 'A data de fim não pode ser no passado';
    }

    if (form.startDate && form.endDate) {
      const startDateISO = fromBrazilianDateTimeLocal(form.startDate);
      const endDateISO = fromBrazilianDateTimeLocal(form.endDate);
      
      if (!validateEndDateAfterStartDate(startDateISO, endDateISO)) {
        newErrors.dateRange = 'A data de fim deve ser posterior à data de início';
      }
    }

    setErrors(newErrors);
    return !newErrors.startDate && !newErrors.endDate && !newErrors.dateRange;
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    
    setTimeout(() => {
      validateDatesInRealTime();
    }, 0);
  };

  const validateDatesInRealTime = () => {
    const newErrors = {
      startDate: '',
      endDate: '',
      dateRange: ''
    };

    if (form.startDate && !validateNotPastDate(fromBrazilianDateTimeLocal(form.startDate))) {
      newErrors.startDate = 'A data de início não pode ser no passado';
    }

    if (form.endDate && !validateNotPastDate(fromBrazilianDateTimeLocal(form.endDate))) {
      newErrors.endDate = 'A data de fim não pode ser no passado';
    }

    if (form.startDate && form.endDate) {
      const startDateISO = fromBrazilianDateTimeLocal(form.startDate);
      const endDateISO = fromBrazilianDateTimeLocal(form.endDate);
      
      if (!validateEndDateAfterStartDate(startDateISO, endDateISO)) {
        newErrors.dateRange = 'A data de fim deve ser posterior à data de início';
      }
    }

    setErrors(newErrors);
  };

  const isFormValid = () => {
    if (!form.title.trim()) return false;
    
    if (form.classIds.length === 0) return false;
    
    const tempErrors = {
      startDate: '',
      endDate: '',
      dateRange: ''
    };

    if (form.startDate && !validateNotPastDate(fromBrazilianDateTimeLocal(form.startDate))) {
      tempErrors.startDate = 'A data de início não pode ser no passado';
    }

    if (form.endDate && !validateNotPastDate(fromBrazilianDateTimeLocal(form.endDate))) {
      tempErrors.endDate = 'A data de fim não pode ser no passado';
    }

    if (form.startDate && form.endDate) {
      const startDateISO = fromBrazilianDateTimeLocal(form.startDate);
      const endDateISO = fromBrazilianDateTimeLocal(form.endDate);
      
      if (!validateEndDateAfterStartDate(startDateISO, endDateISO)) {
        tempErrors.dateRange = 'A data de fim deve ser posterior à data de início';
      }
    }

    return !tempErrors.startDate && !tempErrors.endDate && !tempErrors.dateRange;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title.trim()) {
      return;
    }

    if (!validateDates()) {
      return;
    }

    try {
      setLoading(true);
      
      const now = new Date();
      const defaultEndDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const listData: CreateListRequest = {
        title: form.title,
        description: form.description,
        startDate: form.startDate ? fromBrazilianDateTimeLocal(form.startDate) : now.toISOString(),
        endDate: form.endDate ? fromBrazilianDateTimeLocal(form.endDate) : defaultEndDate.toISOString(),
        classIds: form.classIds,
        countTowardScore: form.countTowardScore,
        isRestricted: form.isRestricted
      };

      await onSubmit(listData);
      
      setForm({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        classIds: [] as string[],
        countTowardScore: false,
        isRestricted: false
      });
      
      onClose();
    } catch (error) {
      console.error('Erro ao criar lista:', error);
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
        classIds: [] as string[],
        countTowardScore: false,
        isRestricted: false
      });
      setErrors({
        startDate: '',
        endDate: '',
        dateRange: ''
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-2xl mx-4 my-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-xl">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Nova Lista</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Título *
            </label>
            <Input
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Digite o título da lista"
              disabled={loading}
              required
              className="h-12 text-sm bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 text-slate-900 placeholder:text-slate-500 rounded-xl"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Descrição
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Digite a descrição da lista"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-slate-900 placeholder:text-slate-500"
              rows={3}
              disabled={loading}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Data de Início
              </label>
              <Input
                type="datetime-local"
                value={form.startDate}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
                disabled={loading}
                className={`h-12 text-sm bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 text-slate-900 rounded-xl ${
                  errors.startDate ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20' : ''
                }`}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Data de Fim
              </label>
              <Input
                type="datetime-local"
                value={form.endDate}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
                disabled={loading}
                className={`h-12 text-sm bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 text-slate-900 rounded-xl ${
                  errors.endDate ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20' : ''
                }`}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
              )}
            </div>
          </div>

          {errors.dateRange && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{errors.dateRange}</p>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-slate-700">
                Turmas
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const allIds = Array.isArray(classes) ? classes.map(c => c.id) : [];
                    setForm(prev => ({ ...prev, classIds: allIds }));
                  }}
                  disabled={loading}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Selecionar Todas
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setForm(prev => ({ ...prev, classIds: [] }));
                  }}
                  disabled={loading}
                  className="text-xs text-slate-600 hover:text-slate-800 font-medium px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Limpar
                </button>
              </div>
            </div>
            
            
            <div className="border border-slate-200 rounded-xl p-4 max-h-40 overflow-y-auto bg-slate-50">
              {classes.length === 0 ? (
                <div className="text-center py-4 text-slate-500 text-sm">
                  Nenhuma turma disponível
                </div>
              ) : (
                <div className="space-y-2">
                  {classes.map((cls) => (
                    <label key={cls.id} className="flex items-center p-3 hover:bg-white rounded-lg transition-colors cursor-pointer">
                      <Checkbox
                        checked={form.classIds.includes(cls.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setForm(prev => ({ ...prev, classIds: [...prev.classIds, cls.id] }));
                          } else {
                            setForm(prev => ({ ...prev, classIds: prev.classIds.filter(id => id !== cls.id) }));
                          }
                        }}
                        disabled={loading}
                        className="mr-3"
                        variant="text"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-slate-900">{cls.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            
            {form.classIds.length === 0 && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600 font-medium">⚠️ Selecione pelo menos uma turma</p>
              </div>
            )}

            {form.classIds.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-blue-800">
                    {form.classIds.length} turma{form.classIds.length !== 1 ? 's' : ''} selecionada{form.classIds.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="mt-2 text-xs text-blue-600">
                  {form.classIds.map(id => {
                    const cls = classes.find(c => c.id === id);
                    return cls?.name;
                  }).filter(Boolean).join(', ')}
                </div>
              </div>
            )}
            
            {/* Campo: conta para a nota */}
            <div className="mt-4 border-t pt-4 space-y-3">
              <label className="flex items-center gap-3">
                <Checkbox
                  checked={form.countTowardScore}
                  onChange={(e) => setForm(prev => ({ ...prev, countTowardScore: e.target.checked }))}
                  className="mr-2"
                  variant="text"
                />
                <span className="text-sm font-medium text-slate-700">Esta lista conta para a nota</span>
              </label>
              
              {/* Campo: restringir por IP */}
              <label className="flex items-center gap-3">
                <Checkbox
                  checked={form.isRestricted}
                  onChange={(e) => setForm(prev => ({ ...prev, isRestricted: e.target.checked }))}
                  className="mr-2"
                  variant="text"
                />
                <span className="text-sm font-medium text-slate-700">Restringir acesso por IP</span>
              </label>
            </div>
          </div>
        </form>
        
        <div className="flex gap-3 mt-8 pt-6 border-t border-slate-200">
          <Button 
            variant="outline" 
            onClick={handleClose} 
            className="flex-1 h-12 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl transition-all duration-200"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            disabled={loading || !isFormValid()}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Criando...
              </div>
            ) : (
              'Criar Lista'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

