"use client";

import React, { useMemo } from "react";
import Link from "next/link";

import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { useStudentHomeData } from "../../hooks/useHomeData";
import { Student, StudentHomeProps } from "../../types";
import { formatDateTime } from "../../utils/dateUtils";

import WelcomeHeader from "./WelcomeHeader";

export default function StudentHome({ currentUser }: StudentHomeProps) {
  const { data } = useStudentHomeData();


  // Memoizar cálculos pesados
  const { highlightList, currentStudent } = useMemo(() => {
    if (!data) {
      return { highlightList: null, currentStudent: null };
    }
    
    const { availableLists, classParticipants } = data;
    // Encontrar lista em destaque (publicada)
    let highlight = availableLists.find((l: { status: string }) => l.status === 'published');
    if (!highlight && availableLists.length > 0) {
      // Se não houver published, pega a primeira disponível
      highlight = availableLists[0];
    }

    // Dados do aluno atual - buscar pelo nome do usuário logado
    const student = classParticipants.find((classParticipant: Student) => classParticipant.name === currentUser.name) || {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      studentRegistration: '20241001',
    };

    return { highlightList: highlight, currentStudent: student };
  }, [data, currentUser]);
  
  // Se não há dados, usar dados vazios para evitar loading
  const currentClass = data?.currentClass || { id: '', name: 'Carregando...', professorId: '', professorName: 'Carregando...' };
  const classParticipants = data?.classParticipants || [];

  return (
    <div className="space-y-6">
      {/* Header com informações da turma e perfil */}
      <WelcomeHeader
        currentUser={currentUser}
        title={`Bem-vindo(a), ${currentUser.name.split(' ')[0]}!`}
        subtitle={currentClass.name}
        extraInfo={<span>Professor: {currentClass.professorName}</span>}
      />

      {/* Lista em destaque */}
      {highlightList && (
        <Card className="p-6 bg-white border-slate-200 rounded-3xl shadow-lg">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-green-50 to-emerald-50 text-green-600 rounded-xl border border-green-200">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Lista Disponível
                </h2>
              </div>
              <p className="text-slate-600">
                Você pode submeter suas soluções agora
              </p>
            </div>
            <span className="px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200">
              Disponível
            </span>
          </div>

          <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6 mb-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">{highlightList.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-slate-600">Início:</span>
                <span className="font-medium text-slate-900">
                  {formatDateTime(highlightList.startDate)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-slate-600">Fim:</span>
                <span className="font-medium text-slate-900">
                  {formatDateTime(highlightList.endDate)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Link href={`/listas/${highlightList.id}`}>
              <Button className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm hover:shadow-md font-semibold transition-all duration-200 transform hover:scale-[1.02]">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Acessar Lista
              </Button>
            </Link>
            <Link href={`/submissoes?lista=${highlightList.id}`}>
              <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition-all duration-200">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Ver Submissões
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Lista de Alunos da turma */}
      <Card className="p-6 bg-white border-slate-200 rounded-3xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-slate-50 to-slate-100 text-slate-600 rounded-xl border border-slate-200">
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Alunos da Turma</h2>
          </div>
          <span className="px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 border border-slate-200">
            {classParticipants.length} alunos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-4 px-4 font-semibold text-slate-700">Nome</th>
                <th className="text-left py-4 px-4 font-semibold text-slate-700">Matrícula</th>
              </tr>
            </thead>
            <tbody>
              {classParticipants.map((classParticipant: Student) => (
                <tr key={classParticipant.id} className={`border-b border-slate-100 ${classParticipant.id === currentStudent?.id ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : 'hover:bg-slate-50'}`}>
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 ${classParticipant.id === currentStudent?.id ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <div className={`font-semibold ${classParticipant.id === currentStudent?.id ? 'text-blue-700' : 'text-slate-900'}`}>
                          {classParticipant.name}
                          {classParticipant.id === currentStudent?.id && (
                            <span className="ml-2 text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                              Você
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-600">{classParticipant.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-slate-900 font-semibold">{classParticipant.studentRegistration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
