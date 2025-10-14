import React from 'react';

import { Question } from '../../types';

interface QuestionFormData {
  title: string;
  statement: string;
  input_format: string;
  output_format: string;
  constraints?: string;
  notes?: string;
  examples: Array<{
    input: string;
    output: string;
  }>;
  timeLimit: string;
  memoryLimit: string;
  tags: string[];
}

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (questionData: QuestionFormData) => void;
  question?: Question;
  title: string;
}

const QuestionModal: React.FC<QuestionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  question,
  title
}) => {
  const [formData, setFormData] = React.useState({
    title: question?.title || '',
    statement: question?.statement || '',
    input_format: question?.input_format || '',
    output_format: question?.output_format || '',
    constraints: question?.constraints || '',
    notes: question?.notes || '',
    timeLimit: question?.timeLimit || '1s',
    memoryLimit: question?.memoryLimit || '128MB',
    tags: question?.tags?.join(', ') || '',
    examples: question?.examples || [{ input: '', output: '' }],
  });

  React.useEffect(() => {
    if (question) {
      setFormData({
        title: question.title || '',
        statement: question.statement || '',
        input_format: question.input_format || '',
        output_format: question.output_format || '',
        constraints: question.constraints || '',
        notes: question.notes || '',
        timeLimit: question.timeLimit || '1s',
        memoryLimit: question.memoryLimit || '128MB',
        tags: question.tags?.join(', ') || '',
        examples: question.examples || [{ input: '', output: '' }],
      });
    } else {
      setFormData({
        title: '',
        statement: '',
        input_format: '',
        output_format: '',
        constraints: '',
        notes: '',
        timeLimit: '1s',
        memoryLimit: '128MB',
        tags: '',
        examples: [{ input: '', output: '' }],
      });
    }
  }, [question, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleExampleChange = (index: number, field: 'input' | 'output', value: string) => {
    const newExamples = [...formData.examples];
    newExamples[index][field] = value;
    setFormData({ ...formData, examples: newExamples });
  };

  const addExample = () => {
    setFormData({ 
      ...formData, 
      examples: [...formData.examples, { input: '', output: '' }] 
    });
  };

  const removeExample = (index: number) => {
    if (formData.examples.length > 1) {
      const newExamples = formData.examples.filter((_, i) => i !== index);
      setFormData({ ...formData, examples: newExamples });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      tags: formData.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      examples: formData.examples.filter(ex => ex.input.trim() || ex.output.trim()),
    });
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-4xl mx-4 my-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-xl">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Título</label>
              <input 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                className="w-full h-12 px-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-slate-900 placeholder:text-slate-500" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tags</label>
              <input 
                name="tags" 
                value={formData.tags} 
                onChange={handleChange} 
                className="w-full h-12 px-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-slate-900 placeholder:text-slate-500" 
                placeholder="ex: A, B, C" 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Enunciado</label>
            <textarea 
              name="statement" 
              value={formData.statement} 
              onChange={handleChange} 
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-slate-900 placeholder:text-slate-500 h-32" 
              required 
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Formato de Entrada</label>
              <textarea 
                name="input_format" 
                value={formData.input_format} 
                onChange={handleChange} 
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-slate-900 placeholder:text-slate-500 h-20" 
                placeholder="Descreva o formato de entrada..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Formato de Saída</label>
              <textarea 
                name="output_format" 
                value={formData.output_format} 
                onChange={handleChange} 
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-slate-900 placeholder:text-slate-500 h-20" 
                placeholder="Descreva o formato de saída..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Restrições</label>
            <textarea 
              name="constraints" 
              value={formData.constraints} 
              onChange={handleChange} 
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-slate-900 placeholder:text-slate-500 h-24" 
              placeholder="Ex: 1 ≤ N ≤ 10^5, tempo de execução menor que 1 segundo..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Observações</label>
            <textarea 
              name="notes" 
              value={formData.notes} 
              onChange={handleChange} 
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-slate-900 placeholder:text-slate-500 h-24" 
              placeholder="Notas adicionais, dicas ou informações relevantes sobre a questão..."
            />
          </div>

          {/* Seção de Exemplos */}
          <div className="border-t border-slate-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-slate-700">Exemplos</label>
              <button
                type="button"
                onClick={addExample}
                className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200"
              >
                + Adicionar Exemplo
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.examples.map((example, index) => (
                <div key={index} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-slate-700">Exemplo {index + 1}</span>
                    {formData.examples.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExample(index)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Entrada</label>
                      <textarea
                        value={example.input}
                        onChange={(e) => handleExampleChange(index, 'input', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-slate-900 placeholder:text-slate-500 h-20 text-sm font-mono"
                        placeholder="Digite a entrada do exemplo..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Saída</label>
                      <textarea
                        value={example.output}
                        onChange={(e) => handleExampleChange(index, 'output', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-slate-900 placeholder:text-slate-500 h-20 text-sm font-mono"
                        placeholder="Digite a saída esperada..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Limite de Tempo</label>
              <input 
                name="timeLimit" 
                value={formData.timeLimit} 
                onChange={handleChange} 
                className="w-full h-12 px-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-slate-900 placeholder:text-slate-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Limite de Memória</label>
              <input 
                name="memoryLimit" 
                value={formData.memoryLimit} 
                onChange={handleChange} 
                className="w-full h-12 px-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-slate-900 placeholder:text-slate-500" 
              />
            </div>
          </div>
          <div className="flex gap-3 mt-8 pt-6 border-t border-slate-200">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 h-12 px-4 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all duration-200 font-semibold"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="flex-1 h-12 px-4 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02] font-semibold"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionModal;