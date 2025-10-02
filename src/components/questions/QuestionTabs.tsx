interface QuestionTabsProps {
  selectedTab: 'problem' | 'submissions';
  onTabChange: (tab: 'problem' | 'submissions') => void;
  submissionsCount: number;
}

export default function QuestionTabs({ selectedTab, onTabChange, submissionsCount }: QuestionTabsProps) {
  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8">
        <button
          onClick={() => onTabChange('problem')}
          className={`py-2 px-1 border-b-2 font-medium text-sm ${
            selectedTab === 'problem'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Problema
        </button>
        <button
          onClick={() => onTabChange('submissions')}
          className={`py-2 px-1 border-b-2 font-medium text-sm ${
            selectedTab === 'submissions'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Submissões ({submissionsCount})
        </button>
      </nav>
    </div>
  );
}






















