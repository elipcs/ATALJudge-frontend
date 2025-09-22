"use client";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ReactNode } from "react";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterConfig {
  label: string;
  value: string;
  type: 'text' | 'select' | 'date';
  placeholder?: string;
  options?: FilterOption[];
  onChange: (value: string) => void;
}

interface FilterBarProps {
  filters: FilterConfig[];
  onClear?: () => void;
  className?: string;
  children?: ReactNode; // Para filtros customizados adicionais
}

export default function FilterBar({ 
  filters, 
  onClear, 
  className = "",
  children 
}: FilterBarProps) {
  const gridCols = Math.min(filters.length + (children ? 1 : 0) + (onClear ? 1 : 0), 6);
  
  return (
    <Card className={`p-4 mb-6 ${className}`}>
      <div className={`grid grid-cols-1 gap-4 md:grid-cols-${gridCols}`}>
        {filters.map((filter, index) => (
          <div key={index}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {filter.label}
            </label>
            {filter.type === 'text' && (
              <Input
                placeholder={filter.placeholder || filter.label}
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
              />
            )}
            {filter.type === 'select' && (
              <select
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {filter.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
            {filter.type === 'date' && (
              <Input
                type="date"
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
              />
            )}
          </div>
        ))}
        
        {children}
        
        {onClear && (
          <div className="flex items-end">
            <Button 
              variant="outline" 
              onClick={onClear}
              className="w-full"
            >
              Limpar Filtros
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}