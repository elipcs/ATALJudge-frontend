/**
 * Utilitários para componentes de loading
 */

import React from 'react';

/**
 * Componente de loading spinner reutilizável
 */
interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ 
  message = "Carregando...", 
  size = 'md',
  className = "" 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  return (
    <div className={`flex flex-col items-center justify-center py-8 ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-gray-900 ${sizeClasses[size]} mb-4`}></div>
      {message && (
        <p className="text-gray-600 text-sm">{message}</p>
      )}
    </div>
  );
}

/**
 * Componente para loading de página inteira
 */
export function FullPageLoading({ message = "Carregando..." }: { message?: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <LoadingSpinner message={message} size="lg" />
    </div>
  );
}

/**
 * Componente de loading com skeleton
 */
export function LoadingSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
}

/**
 * Componente de loading para cards
 */
export function CardLoadingSkeleton() {
  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200">
      <div className="space-y-4">
        <LoadingSkeleton className="h-6 w-3/4" />
        <LoadingSkeleton className="h-4 w-1/2" />
        <div className="space-y-2">
          <LoadingSkeleton className="h-4 w-full" />
          <LoadingSkeleton className="h-4 w-5/6" />
        </div>
      </div>
    </div>
  );
}

/**
 * Componente de loading para tabelas
 */
export function TableLoadingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <LoadingSkeleton className="h-4 w-1/4" />
          <LoadingSkeleton className="h-4 w-1/3" />
          <LoadingSkeleton className="h-4 w-1/4" />
          <LoadingSkeleton className="h-4 w-1/6" />
        </div>
      ))}
    </div>
  );
}

/**
 * Componente de loading para página home
 */
export function HomePageLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <LoadingSkeleton className="h-8 w-64 bg-slate-400" />
            <LoadingSkeleton className="h-4 w-48 bg-slate-300" />
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right space-y-1">
              <LoadingSkeleton className="h-4 w-32 bg-slate-300" />
              <LoadingSkeleton className="h-3 w-24 bg-slate-300" />
            </div>
            <LoadingSkeleton className="w-12 h-12 rounded-full bg-slate-300" />
          </div>
        </div>
      </div>

      {/* Actions skeleton */}
      <CardLoadingSkeleton />

      {/* Content skeleton */}
      <CardLoadingSkeleton />
    </div>
  );
}

/**
 * Componente de loading para listas
 */
export function ListsLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {/* Estatísticas skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="animate-pulse">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-5 h-5 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-24"></div>
              </div>
              <div className="h-8 bg-gray-300 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros skeleton */}
      <div className="p-4 mb-6 bg-white rounded-lg border border-gray-200">
        <div className="animate-pulse">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="h-10 bg-gray-300 rounded"></div>
            </div>
            <div className="flex gap-4">
              <div className="h-10 bg-gray-300 rounded w-40"></div>
              <div className="h-10 bg-gray-300 rounded w-40"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Listas skeleton */}
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-6 bg-white rounded-lg border border-gray-200">
            <div className="animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-4 h-4 bg-gray-300 rounded"></div>
                    <div className="h-6 bg-gray-300 rounded w-48"></div>
                  </div>
                  <div className="h-4 bg-gray-300 rounded w-96 mb-3"></div>
                  <div className="flex items-center gap-6 mb-3">
                    <div className="h-4 bg-gray-300 rounded w-20"></div>
                    <div className="h-4 bg-gray-300 rounded w-24"></div>
                    <div className="h-4 bg-gray-300 rounded w-32"></div>
                  </div>
                  <div className="h-3 bg-gray-300 rounded w-64"></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-6 bg-gray-300 rounded w-20"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Componente de loading inline para suspensão
 */
export function SuspenseLoading({ message = "Carregando..." }: { message?: string }) {
  return (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-slate-600">{message}</p>
    </div>
  );
}
