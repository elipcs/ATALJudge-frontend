"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { mockSubmissions } from "../../mocks/submission";

export default function SubmissionPage({ params }: { params: { id: string } }) {
  const submission = mockSubmissions.find(s => s.id === params.id);
  if (!submission) {
    return <div className="p-8 text-center text-lg">Submissão não encontrada.</div>;
  }
  return (
    <div className="max-w-2xl mx-auto p-6 bg-background rounded-xl shadow mt-8 border border-border">
      <h1 className="text-2xl font-bold mb-4">Detalhes da Submissão #{submission.id}</h1>
      <table className="w-full text-sm mb-4">
        <tbody>
          <tr><td className="font-semibold pr-2">Problema:</td><td>{submission.problemLetter}</td></tr>
          <tr><td className="font-semibold pr-2">Resultado:</td><td>{submission.result}</td></tr>
          <tr><td className="font-semibold pr-2">Tempo:</td><td>{submission.time}</td></tr>
          <tr><td className="font-semibold pr-2">Memória:</td><td>{submission.memory}</td></tr>
          <tr><td className="font-semibold pr-2">Linguagem:</td><td>{submission.language}</td></tr>
          <tr><td className="font-semibold pr-2">Enviado em:</td><td>{new Date(submission.submittedAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</td></tr>
        </tbody>
      </table>
      <div className="mb-2 font-semibold">Código enviado:</div>
      <pre className="bg-muted rounded p-4 text-xs overflow-x-auto border border-border mb-4"><code>{submission.code}</code></pre>
      {/* Adicione mais detalhes se necessário */}
    </div>
  );
}
