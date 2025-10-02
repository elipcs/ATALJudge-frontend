import React from 'react';
import Link from 'next/link';

import { QuestionList, QuestionArrangement } from '../../types';

interface ListHeaderProps {
  list: QuestionList;
  availableArrangements: QuestionArrangement[];
  currentArrangementIndex: number;
  switchArrangementScenario: (index: number) => void;
}

const ListHeader: React.FC<ListHeaderProps> = ({
  list,
  availableArrangements,
  currentArrangementIndex,
  switchArrangementScenario
}) => {
  if (!list) return null;
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <Link href="/listas" className="text-blue-600 hover:underline font-medium">← Voltar</Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{list.title}</h1>
          <p className="text-slate-500 text-sm">{list.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`px-4 py-2 rounded-full text-sm font-medium ${
          list.status === 'published' ? 'text-green-600 bg-green-100' :
          'text-yellow-600 bg-yellow-100'
        }`}>
          {list.status === 'published' ? 'Publicada' : 'Rascunho'}
        </span>
        {/* Seleção de arranjo */}
        {availableArrangements.length > 1 && (
          <div className="flex rounded-lg overflow-hidden border border-slate-300 bg-white/80">
            {availableArrangements.map((arr, idx) => (
              <button
                key={arr.id}
                className={`px-4 py-2 text-sm font-medium focus:outline-none transition-colors ${
                  idx === currentArrangementIndex
                    ? 'bg-blue-600 text-white'
                    : 'text-blue-700 hover:bg-blue-50'
                }`}
                onClick={() => switchArrangementScenario(idx)}
              >
                {arr.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListHeader;
