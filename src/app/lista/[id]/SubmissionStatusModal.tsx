"use client";
import React from "react";

interface SubmissionStatusModalProps {
  open: boolean;
  onClose: () => void;
  submission: {
    status: string;
    length: number;
    language: string;
    sentAt: string;
    code: string;
    time?: string;
    memory?: string;
    userName?: string;
  } | null;
}

export default function SubmissionStatusModal({ open, onClose, submission }: SubmissionStatusModalProps) {
  if (!open || !submission) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-background rounded-xl shadow-xl p-6 w-full max-w-2xl relative">
        <button className="absolute top-2 right-2 text-xl font-bold text-muted-foreground hover:text-foreground" onClick={onClose}>&times;</button>
        <div className="mb-2 text-base font-semibold text-primary">
          Submissão de {submission.userName ?? 'Usuário'}
        </div>
        <table className="w-full text-xs mb-4 text-center">
          <thead>
            <tr className="bg-secondary text-foreground">
              <th className="px-2 py-1">Status</th>
              <th className="px-2 py-1">Tempo</th>
              <th className="px-2 py-1">Memória</th>
              <th className="px-2 py-1">Linguagem</th>
              <th className="px-2 py-1">Enviado</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-2 py-1 font-semibold">{submission.status}</td>
              <td className="px-2 py-1">{submission.time ?? '-'}</td>
              <td className="px-2 py-1">{submission.memory ?? '-'}</td>
              <td className="px-2 py-1">{submission.language}</td>
              <td className="px-2 py-1">{submission.sentAt}</td>
            </tr>
          </tbody>
        </table>
        <div className="mb-2 font-semibold">Código enviado:</div>
        <pre className="bg-muted rounded p-2 text-xs overflow-x-auto mb-2">{submission.code}</pre>
        <button className="mt-2 px-4 py-2 rounded bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition border border-primary" onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
}
