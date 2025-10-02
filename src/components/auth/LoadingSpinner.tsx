"use client";
import { memo } from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export const LoadingSpinner = memo(function LoadingSpinner({ 
  size = "md", 
  className = "",
  text 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-slate-300 border-t-slate-800 ${sizeClasses[size]}`} />
      {text && (
        <p className="mt-2 text-sm text-slate-600">{text}</p>
      )}
    </div>
  );
});
