import React from 'react';

import { Question } from '../../types';

// Tipo específico para casos de teste
interface TestCase {
  input: string;
  expectedOutput: string;
  isPublic: boolean;
}

interface TestCasesModalProps {
  isOpen: boolean;
  question: Question;
  onClose: () => void;
}

const TestCasesModal: React.FC<TestCasesModalProps> = ({
  isOpen,
  question,
  onClose
}) => {
  if (!isOpen || !question) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6">
        <h2 className="text-xl font-bold mb-4">Casos de Teste</h2>
        {question.testCases && question.testCases.length > 0 ? (
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="bg-slate-100">
                <th className="p-2 text-left">Entrada</th>
                <th className="p-2 text-left">Saída Esperada</th>
                <th className="p-2 text-left">Tipo</th>
              </tr>
            </thead>
            <tbody>
              {question.testCases.map((tc: TestCase, idx: number) => (
                <tr key={idx} className="border-b">
                  <td className="p-2 whitespace-pre-line">{tc.input}</td>
                  <td className="p-2 whitespace-pre-line">{tc.expectedOutput}</td>
                  <td className="p-2">{tc.isPublic ? 'Público' : 'Privado'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="mb-4 text-slate-600">Nenhum caso de teste cadastrado.</div>
        )}
        <div className="flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700">Fechar</button>
        </div>
      </div>
    </div>
  );
};

export default TestCasesModal;
