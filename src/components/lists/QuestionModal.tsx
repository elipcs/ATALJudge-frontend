import React from 'react';

import { Question } from '../../types';

interface QuestionFormData {
  title: string;
  statement: string;
  input: string;
  output: string;
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
    input: question?.input || '',
    output: question?.output || '',
    timeLimit: question?.timeLimit || '1s',
    memoryLimit: question?.memoryLimit || '128MB',
    tags: question?.tags?.join(', ') || '',
  });

  React.useEffect(() => {
    if (question) {
      setFormData({
        title: question.title,
        statement: question.statement,
        input: question.input,
        output: question.output,
        timeLimit: question.timeLimit,
        memoryLimit: question.memoryLimit,
        tags: question.tags?.join(', ') || '',
      });
    }
  }, [question]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      tags: formData.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
    });
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <h2 className="text-xl font-bold mb-4">{title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Título</label>
              <input name="title" value={formData.title} onChange={handleChange} className="w-full border rounded p-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tags</label>
              <input name="tags" value={formData.tags} onChange={handleChange} className="w-full border rounded p-2" placeholder="ex: A, B, C" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Enunciado</label>
            <textarea name="statement" value={formData.statement} onChange={handleChange} className="w-full border rounded p-2 h-24" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Entrada</label>
              <input name="input" value={formData.input} onChange={handleChange} className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Saída</label>
              <input name="output" value={formData.output} onChange={handleChange} className="w-full border rounded p-2" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Limite de Tempo</label>
              <input name="timeLimit" value={formData.timeLimit} onChange={handleChange} className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Limite de Memória</label>
              <input name="memoryLimit" value={formData.memoryLimit} onChange={handleChange} className="w-full border rounded p-2" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-slate-100 hover:bg-slate-200">Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionModal;
