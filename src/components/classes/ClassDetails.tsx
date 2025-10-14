"use client";

import React from "react";

import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Class, Student } from "../../types";
import { useListsData } from "../../hooks/useListsData";
import { QuestionList } from "../../types";
import { InlineLoading } from "../PageLoading";

interface ClassDetailsProps {
  classDetails: {
    cls: Class;
    students: Student[];
  };
  userRole: string;
  onBack: () => void;
  onEditClass?: (cls: Class) => void;
  onDeleteClass?: (cls: Class) => void;
  loading?: boolean;
}

export default function ClassDetails({ 
  classDetails, 
  userRole, 
  onBack,
  onEditClass,
  onDeleteClass,
  loading = false 
}: ClassDetailsProps) {
  const { cls, students } = classDetails;
  const { lists: allLists, loading: listsLoading } = useListsData();
  const questionLists = allLists.filter((list: QuestionList) =>
    list.classIds && list.classIds.includes(cls.id)
  );



  const exportToCSV = () => {
    const headers = ['Nome', 'Email', 'Matrícula', 'Média Geral'];
    questionLists.forEach(list => {
      headers.push(list.title);
    });
    headers.push('Data de Matrícula');

    const csvContent = [
      headers.join(','),
      ...students.map(student => {
        const row = [
          `"${student.name}"`,
          `"${student.email}"`,
          `"${student.studentRegistration}"`,
          calculateAverageGrade(student.grades).toFixed(1)
        ];
        
        questionLists.forEach(list => {
          const gradeObj = student.grades?.find(g => g.questionListId === list.id);
          const grade = gradeObj?.score || 0;
          row.push(grade.toFixed(1));
        });
        
        row.push(`"${new Date(student.created_at).toLocaleDateString('pt-BR')}"`);
        return row.join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `turma_${cls.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading || listsLoading) {
    return <InlineLoading message="Carregando detalhes..." />;
  }

  const calculateAverageGrade = (grades: { questionListId: string; score: number }[] = []) => {
    if (grades.length === 0) return 0;
    return grades.reduce((sum, grade) => sum + grade.score, 0) / grades.length;
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho com botões de ação */}
      <div className="flex items-center justify-between">
        {userRole !== 'student' && (
          <Button 
            onClick={onBack}
            variant="outline"
            className="flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </Button>
        )}
        {userRole === 'professor' || userRole === 'assistant' ? (
          <div className="flex gap-2">
            {onEditClass && (
              <Button 
                onClick={() => onEditClass(cls)}
                variant="outline"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar Turma
              </Button>
            )}
              {onDeleteClass && (
              <Button 
                onClick={() => onDeleteClass(cls)}
                variant="outline"
                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Excluir Turma
              </Button>
            )}
          </div>
        ) : null}
      </div>

      {/* Lista de alunos */}
      <Card className="bg-white border-slate-200 rounded-3xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">
            Alunos da Turma ({students.length})
          </h2>
          {(userRole === 'professor' || userRole === 'assistant') && students.length > 0 && (
            <Button 
              onClick={exportToCSV}
              className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200 shadow-sm hover:shadow-md font-semibold transition-all duration-200 transform hover:scale-[1.02] rounded-xl"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar
            </Button>
          )}
        </div>


        {students.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 text-slate-600 rounded-xl shadow-lg border border-slate-200 mx-auto mb-6 w-fit">
              <svg className="w-16 h-16 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Nenhum aluno matriculado</h3>
            <p className="text-slate-600 text-lg leading-relaxed max-w-lg mx-auto">Esta turma ainda não possui alunos matriculados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">Nome</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">Email</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">Matrícula</th>
                  {userRole === 'student' ? (
                    questionLists.map((list) => (
                      <th key={list.id} className="text-left py-4 px-6 font-semibold text-slate-700">
                        <div className="max-w-24">
                          <div className="text-xs text-slate-500 truncate" title={list.title}>
                            {list.title}
                          </div>
                        </div>
                      </th>
                    ))
                  ) : (
                    questionLists.map((list) => (
                      <th key={list.id} className="text-left py-4 px-6 font-semibold text-slate-700">
                        <div className="max-w-24">
                          <div className="text-xs text-slate-500 truncate" title={list.title}>
                            {list.title}
                          </div>
                        </div>
                      </th>
                    ))
                  )}
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">Média</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const average = calculateAverageGrade(student.grades);
                  return (
                    <tr key={student.id} className="border-b border-slate-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-200">
                            <span className="text-blue-600 font-semibold text-sm">
                              {student.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="font-semibold text-slate-900">{student.name}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-900">{student.email}</td>
                      <td className="py-4 px-6 text-slate-900">{student.studentRegistration}</td>
                      {questionLists.map((list) => {
                        const gradeObj = student.grades?.find(g => g.questionListId === list.id);
                        const grade = gradeObj?.score || 0;
                        return (
                          <td key={list.id} className="py-4 px-6">
                            <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-medium ${
                              grade >= 7 ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200' :
                              grade >= 5 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-700 border border-yellow-200' :
                              grade > 0 ? 'bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border border-red-200' :
                              'bg-gradient-to-r from-slate-50 to-slate-100 text-slate-500 border border-slate-200'
                            }`}>
                              {grade > 0 ? grade.toFixed(1) : '-'}
                            </span>
                          </td>
                        );
                      })}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-medium ${
                          average >= 7 ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200' :
                          average >= 5 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-700 border border-yellow-200' :
                          'bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border border-red-200'
                        }`}>
                          {average.toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Rodapé com informações da turma */}
      <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="font-medium">{students.length} aluno{students.length !== 1 ? 's' : ''}</span>
            </div>
            {userRole !== 'student' && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">
                  Média geral: {students.length > 0 
                    ? (students.reduce((sum, student) => sum + calculateAverageGrade(student.grades), 0) / students.length).toFixed(1)
                    : '0.0'
                  }
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Criada em {new Date(cls.created_at).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
