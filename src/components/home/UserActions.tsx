"use client";

import React from "react";

import { QuickAction, UserActionsProps } from "../../types";

import QuickActions from "./QuickActions";

export default function UserActions({ userRole }: UserActionsProps) {
  const getActionsForRole = (role: string): QuickAction[] => {
    switch (role) {
      case 'professor':
        return [
          {
            href: "/turmas",
            icon: <svg className="w-6 h-6 text-blue-600 group-hover:text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>,
            title: "Gerenciar Turmas",
            description: "Criar e administrar turmas",
            hoverColor: "hover:border-blue-300",
            iconColor: "text-blue-600"
          },
          {
            href: "/listas",
            icon: <svg className="w-6 h-6 text-green-600 group-hover:text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>,
            title: "Criar Listas",
            description: "Adicionar novas listas de exercícios",
            hoverColor: "hover:border-green-300",
            iconColor: "text-green-600"
          },
          {
            href: "/convites",
            icon: <svg className="w-6 h-6 text-purple-600 group-hover:text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>,
            title: "Convidar Alunos",
            description: "Gerar códigos de convite",
            hoverColor: "hover:border-purple-300",
            iconColor: "text-purple-600"
          }
        ];

      case 'assistant':
        return [
          {
            href: "/submissoes",
            icon: <svg className="w-6 h-6 text-red-600 group-hover:text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>,
            title: "Corrigir Submissões",
            description: "12 pendentes",
            hoverColor: "hover:border-red-300",
            iconColor: "text-red-600"
          },
          {
            href: "/listas",
            icon: <svg className="w-6 h-6 text-green-600 group-hover:text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>,
            title: "Criar Listas",
            description: "Adicionar novas listas de exercícios",
            hoverColor: "hover:border-green-300",
            iconColor: "text-green-600"
          },
          {
            href: "/turmas",
            icon: <svg className="w-6 h-6 text-blue-600 group-hover:text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>,
            title: "Acompanhar Turmas",
            description: "Ver progresso dos alunos",
            hoverColor: "hover:border-blue-300",
            iconColor: "text-blue-600"
          }
        ];

      default:
        return [];
    }
  };

  const actions = getActionsForRole(userRole);

  if (actions.length === 0) {
    return null;
  }

  return <QuickActions actions={actions} />;
}
