"use client";
import { ReactNode } from "react";
import { Button } from "./ui/button";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode; // Para botões ou outros elementos de ação
}

export default function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {title}
        </h1>
        {description && (
          <p className="text-gray-600 mt-1">
            {description}
          </p>
        )}
      </div>
      
      {children && (
        <div className="flex items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
}