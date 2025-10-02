import React from 'react';

import { QuestionArrangement, QuestionGroup } from '../../types';

interface ArrangementConfigModalProps {
  isOpen: boolean;
  arrangement: QuestionArrangement;
  onClose: () => void;
}

const ArrangementConfigModal: React.FC<ArrangementConfigModalProps> = ({
  isOpen,
  arrangement,
  onClose
}) => {
  if (!isOpen || !arrangement) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-xl font-bold mb-4">Configuração do Arranjo</h2>
        <div className="mb-2">
          <span className="font-medium">Nome: </span>{arrangement.name}
        </div>
        <div className="mb-2">
          <span className="font-medium">Descrição: </span>{arrangement.description}
        </div>
        <div className="mb-2">
          <span className="font-medium">Nota Máxima: </span>{arrangement.maxScore}
        </div>
        <div className="mb-2">
          <span className="font-medium">Nota de Aprovação: </span>{arrangement.passingScore}
        </div>
        <div className="mb-4">
          <span className="font-medium">Requisitos: </span>
          {arrangement.requireAllGroups
            ? 'É necessário resolver o mínimo de cada grupo.'
            : 'É necessário resolver o mínimo de pelo menos um grupo.'}
        </div>
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Grupos</h3>
          <ul className="space-y-2">
            {arrangement.groups.map((group: QuestionGroup) => (
              <li key={group.id} className={`p-3 rounded border ${group.color || 'border-slate-200'}`}>
                <div className="font-medium">{group.name}</div>
                <div className="text-sm text-slate-600">Questões: {group.questions.length}</div>
                <div className="text-sm text-slate-600">Mínimo para completar: {group.minRequired}</div>
                <div className="text-sm text-slate-600">Pontos por questão: {group.pointsPerQuestion}</div>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700">Fechar</button>
        </div>
      </div>
    </div>
  );
};

export default ArrangementConfigModal;
