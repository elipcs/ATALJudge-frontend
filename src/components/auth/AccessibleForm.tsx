"use client";
import { ReactNode, useId } from "react";

interface AccessibleFormProps {
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  className?: string;
  'aria-label'?: string;
}

export function AccessibleForm({ 
  children, 
  onSubmit, 
  className = "",
  'aria-label': ariaLabel 
}: AccessibleFormProps) {
  const formId = useId();

  return (
    <form
      id={formId}
      onSubmit={onSubmit}
      className={className}
      aria-label={ariaLabel}
      noValidate
    >
      {children}
    </form>
  );
}

interface AccessibleFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function AccessibleField({ 
  label, 
  error, 
  required = false, 
  children, 
  className = "" 
}: AccessibleFieldProps) {
  const fieldId = useId();
  const errorId = useId();

  return (
    <div className={className}>
      <label 
        htmlFor={fieldId}
        className="block text-sm font-medium text-slate-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="obrigatório">*</span>}
      </label>
      
      <div className="relative">
        {children}
      </div>
      
      {error && (
        <div 
          id={errorId}
          className="mt-1 text-sm text-red-600"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}
    </div>
  );
}

interface AccessibleButtonProps {
  children: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  className?: string;
  'aria-label'?: string;
}

export function AccessibleButton({ 
  children, 
  loading = false, 
  disabled = false, 
  type = "button",
  onClick,
  className = "",
  'aria-label': ariaLabel
}: AccessibleButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
      aria-label={ariaLabel}
      aria-disabled={disabled || loading}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div 
            className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"
            aria-hidden="true"
          />
          <span>Processando...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}
