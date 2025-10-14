import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LIST_STATUS_OPTIONS } from "@/constants";

interface ListsFiltersProps {
  search: string;
  statusFilter: 'all' | 'draft' | 'published';
  userRole: string;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: 'all' | 'draft' | 'published') => void;
  onClearFilters: () => void;
}

export default function ListsFilters({
  search,
  statusFilter,
  userRole,
  onSearchChange,
  onStatusFilterChange,
  onClearFilters
}: ListsFiltersProps) {
  const hasActiveFilters = search || (userRole !== 'student' && statusFilter !== 'all');

  return (
    <Card className="bg-white border-slate-200 rounded-3xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          {userRole === 'student' ? 'Buscar' : 'Filtros'}
        </h3>
        {hasActiveFilters && (
          <Button
            size="sm"
            variant="outline"
            onClick={onClearFilters}
            className="text-sm border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition-all duration-200 rounded-xl"
          >
            Limpar Filtros
          </Button>
        )}
      </div>
      
      <div className={userRole === 'student' ? 'grid grid-cols-1 gap-4' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}>
        <div>
          {userRole !== 'student' && (
            <label className="block text-sm font-medium text-slate-700 mb-2">Buscar</label>
          )}
          <Input
            placeholder="Buscar listas..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-10 text-sm bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 text-slate-900 placeholder:text-slate-500 rounded-xl"
          />
        </div>
        
        {/* Filtro de Status - apenas para professores e assistentes */}
        {userRole !== 'student' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value as 'all' | 'draft' | 'published')}
              className="w-full h-10 px-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-slate-900"
            >
              {LIST_STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </Card>
  );
}
