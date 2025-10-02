import React from 'react';

interface SkeletonProps {
  className?: string;
  lines?: number;
}

export const Skeleton = ({ className = '' }: SkeletonProps) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

export const CardSkeleton = () => (
  <div className="p-6 bg-white rounded-lg border border-gray-200">
    <div className="space-y-4">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  </div>
);

export const TableSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex space-x-4">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/6" />
      </div>
    ))}
  </div>
);

export const HomePageSkeleton = () => (
  <div className="space-y-6">
    {/* Header skeleton */}
    <div className="bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 bg-slate-400" />
          <Skeleton className="h-4 w-48 bg-slate-300" />
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right space-y-1">
            <Skeleton className="h-4 w-32 bg-slate-300" />
            <Skeleton className="h-3 w-24 bg-slate-300" />
          </div>
          <Skeleton className="w-12 h-12 rounded-full bg-slate-300" />
        </div>
      </div>
    </div>

    {/* Actions skeleton */}
    <CardSkeleton />

    {/* Content skeleton */}
    <CardSkeleton />
  </div>
);
