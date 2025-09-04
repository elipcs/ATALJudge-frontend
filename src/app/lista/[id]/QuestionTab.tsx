"use client";
import React from "react";
import dynamic from "next/dynamic";

const SubmitModal = dynamic(() => import("./SubmitModal"), { ssr: false });
const SubmissionStatusModal = dynamic(() => import("./SubmissionStatusModal"), { ssr: false });

interface QuestionTabProps {
  questions: any[];
  selectedIdx: number;
  showStatusModal?: boolean;
  setShowStatusModal?: (open: boolean) => void;
  submissionInfo?: any;
  setSubmissionInfo?: (info: any) => void;
  userName?: string;
}

export default function QuestionTab({ questions, selectedIdx, showStatusModal, setShowStatusModal, submissionInfo, setSubmissionInfo, userName }: QuestionTabProps) {
  const [showSubmitModal, setShowSubmitModal] = React.useState(false);
  const q = questions[selectedIdx];

  // Handler para submissão
  function handleSubmission({ lang, code, file }: { lang: string; code: string; file: File | null }) {
    if (!setSubmissionInfo || !setShowStatusModal) return;
    const now = new Date();
    setSubmissionInfo({
      status: "Pending",
      length: code ? code.length : file?.size || 0,
      language: lang,
      sentAt: now.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }),
      code: code || (file ? `Arquivo: ${file.name}` : ""),
      userName: userName || 'Você'
    });
    setShowStatusModal(true);

    // Simula processamento da submissão
    setTimeout(() => {
      setSubmissionInfo((prev: typeof submissionInfo) => prev && {
        ...prev,
        status: "Accepted",
        time: "0.123s",
        memory: "12.3MB"
      });
    }, 2000);
  }

  if (!q) return <div className="text-muted-foreground">Nenhuma questão selecionada.</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-3xl md:text-4xl font-extrabold text-primary mr-2">{q.letter}</span>
            <span className="font-bold text-2xl md:text-3xl text-foreground">{q.title}</span>
          </div>
          <button
            className="px-4 py-2 rounded bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition border border-primary"
            onClick={() => setShowSubmitModal(true)}
          >Submeter Questão</button>
        </div>
        <div className="flex flex-col gap-3">
          <div className="bg-card rounded-lg p-4 border border-border">
            <div className="font-semibold text-sm mb-1">Enunciado</div>
            <div className="text-sm whitespace-pre-line">{q.statement}</div>
          </div>
          <div className="bg-card rounded-lg p-4 border border-border">
            <div className="font-semibold text-sm mb-1">Input</div>
            <div className="text-sm whitespace-pre-line">{q.input}</div>
          </div>
          <div className="bg-card rounded-lg p-4 border border-border">
            <div className="font-semibold text-sm mb-1">Output</div>
            <div className="text-sm whitespace-pre-line">{q.output}</div>
          </div>
          {q.examples && q.examples.length > 0 && (
            <div className="bg-card rounded-lg p-4 border border-border">
              <div className="font-semibold text-sm mb-1">Exemplos</div>
              <div className="flex flex-col gap-2">
                {q.examples.map((ex: any, i: number) => (
                  <div key={i} className="flex flex-col md:flex-row gap-2 mb-2">
                    <div className="flex-1 bg-muted rounded p-2">
                      <div className="font-semibold text-xs mb-1">Entrada</div>
                      <pre className="whitespace-pre-wrap text-xs">{ex.input}</pre>
                    </div>
                    <div className="flex-1 bg-muted rounded p-2">
                      <div className="font-semibold text-xs mb-1">Saída</div>
                      <pre className="whitespace-pre-wrap text-xs">{ex.output}</pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="bg-card rounded-lg p-4 border border-border">
            <div className="font-semibold text-sm mb-1">Notas</div>
            <div className="text-sm whitespace-pre-line">{q.notes || 'Sem notas.'}</div>
          </div>
        </div>
      </div>
      <SubmitModal
        open={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        questionTitle={q.title}
        onSubmit={({ lang, code, file }: { lang: string; code: string; file: File | null }) => {
          setShowSubmitModal(false);
          handleSubmission({ lang, code, file });
        }}
      />
  {/* O modal de status agora é controlado pelo componente pai (ListaIdClient) */}
    </div>
  );
}
