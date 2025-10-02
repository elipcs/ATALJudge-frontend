"use client";

import React, { useState } from "react";
import Link from "next/link";

import { Button } from "../ui/button";
import { SubmissionsTableProps } from "../../types";
import { normalizeStatus, getSubmissionStatusColor } from "../../utils/statusUtils";

export default function SubmissionsTable({ submissions, showActions = false }: SubmissionsTableProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionsTableProps["submissions"][number] | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Garantir que submissions seja sempre um array
  const safeSubmissions = Array.isArray(submissions) ? submissions : [];

  const openModal = (submission: SubmissionsTableProps["submissions"][number]) => {
    setSelectedSubmission(submission);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedSubmission(null);
    setShowModal(false);
  };


  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Últimas Submissões</h3>
      {safeSubmissions.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-medium text-gray-600 mb-2">Nenhuma submissão encontrada</p>
            <p className="text-sm text-gray-500">Não há submissões disponíveis no momento.</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-700">Aluno</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Lista</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Questão</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
              {showActions && (
                <th className="text-left py-3 px-4 font-medium text-gray-700">Ações</th>
              )}
            </tr>
          </thead>
          <tbody>
            {safeSubmissions.slice(0, 5).map((submission, index) => {
              // Usar a nova estrutura do mock
              const studentName = submission.student?.name || 'Aluno';
              const listTitle = submission.questionList?.name || 'Lista desconhecida';
              const questionTitle = submission.question?.name || 'Questão desconhecida';
              const listId = submission.questionList?.id;
              const questionId = submission.question?.id;
              
              return (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{studentName}</div>
                  </td>
                  <td className="py-3 px-4 text-gray-900">
                    {listId ? (
                      <Link href={`/listas/${listId}`} className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
                        {listTitle}
                      </Link>
                    ) : listTitle}
                  </td>
                  <td className="py-3 px-4 text-gray-900">
                    {listId && questionId ? (
                      <Link href={`/listas/${listId}/questoes/${questionId}`} className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
                        {questionTitle}
                      </Link>
                    ) : questionTitle}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSubmissionStatusColor(submission.status)}`}>
                      {normalizeStatus(submission.status)}
                    </span>
                  </td>
                  {showActions && (
                    <td className="py-3 px-4">
                      <Button
                        onClick={() => openModal(submission)}
                        variant="outline"
                        size="sm"
                      >
                        Ver detalhes
                      </Button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      )}
      
      {/* Modal de detalhes da submissão */}
      {showModal && selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40" onClick={closeModal}></div>
          <div className="relative bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Detalhes da Submissão</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-gray-600">Aluno</div>
                <div className="font-medium">{selectedSubmission.student?.name || 'Aluno'}</div>
              </div>
              <div>
                <div className="text-gray-600">Status</div>
                <div className="font-medium">{selectedSubmission.status || selectedSubmission.verdict || '-'}</div>
              </div>
              <div>
                <div className="text-gray-600">Veredito</div>
                <div className="font-medium">{selectedSubmission.verdict || '-'}</div>
              </div>
              <div>
                <div className="text-gray-600">Pontuação</div>
                <div className="font-medium">{selectedSubmission.score ?? '-'}</div>
              </div>
              <div>
                <div className="text-gray-600">Linguagem</div>
                <div className="font-medium">{selectedSubmission.language || '-'}</div>
              </div>
              <div>
                <div className="text-gray-600">Enviado em</div>
                <div className="font-medium">{new Date(selectedSubmission.submittedAt).toLocaleString('pt-BR')}</div>
              </div>
            </div>

            <div>
              <div className="text-gray-600 mb-2">Código</div>
              <pre className="bg-gray-100 rounded p-3 text-xs overflow-x-auto max-h-64">{selectedSubmission.code}</pre>
            </div>

            <div className="mt-4 text-right">
              <Button onClick={closeModal} variant="outline">
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
