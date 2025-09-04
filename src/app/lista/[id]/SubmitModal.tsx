"use client";
import React from "react";

interface SubmitModalProps {
  open: boolean;
  onClose: () => void;
  questionTitle: string;
  onSubmit?: (data: { lang: string; code: string; file: File | null }) => void;
}

export default function SubmitModal({ open, onClose, questionTitle, onSubmit }: SubmitModalProps) {
  const [submitLang, setSubmitLang] = React.useState("");
  const [submitCode, setSubmitCode] = React.useState("");
  const [submitFile, setSubmitFile] = React.useState<File | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!submitLang || (!submitCode && !submitFile)) {
      alert("Escolha a linguagem e preencha o código ou envie um arquivo antes de submeter.");
      return;
    }
    if (onSubmit) {
      onSubmit({ lang: submitLang, code: submitCode, file: submitFile });
    }
    onClose();
    setSubmitLang("");
    setSubmitCode("");
    setSubmitFile(null);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-background rounded-xl shadow-xl p-6 w-full max-w-md relative">
        <button className="absolute top-2 right-2 text-xl font-bold text-muted-foreground hover:text-foreground" onClick={onClose}>&times;</button>
        <h2 className="text-lg font-bold mb-4">Submeter Questão: {questionTitle}</h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="font-semibold text-sm">Linguagem:
            <select className="ml-2 px-2 py-1 rounded border border-border bg-background" value={submitLang} onChange={e => setSubmitLang(e.target.value)} required>
              <option value="">Selecione</option>
              <option value="Python">Python</option>
              <option value="Java">Java</option>
            </select>
          </label>
          <label className="font-semibold text-sm">Código:
            <textarea
              className="w-full min-h-[120px] mt-1 px-2 py-1 rounded border border-border bg-background font-mono"
              placeholder="Cole seu código aqui..."
              value={submitCode}
              onChange={e => setSubmitCode(e.target.value)}
              disabled={submitFile !== null}
            />
          </label>
          <div className="flex items-center gap-2">
            <label className="font-semibold text-sm">ou envie um arquivo:</label>
            <input
              id="file-upload"
              type="file"
              accept={submitLang === 'Python' ? '.py' : submitLang === 'Java' ? '.java' : '.py,.java'}
              onChange={e => setSubmitFile(e.target.files?.[0] || null)}
              disabled={!submitLang}
              className="hidden"
            />
            <label htmlFor="file-upload">
              <span
                className={`px-4 py-2 rounded bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition border border-primary cursor-pointer ${!submitLang ? 'opacity-50 pointer-events-none' : ''}`}
                tabIndex={0}
              >
                Escolher arquivo
              </span>
            </label>
            {submitFile && (
              <span className="text-xs text-muted-foreground">{submitFile.name}</span>
            )}
          </div>
          <button
            type="submit"
            className="mt-2 px-4 py-2 rounded bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition border border-primary"
            disabled={!submitLang || (!submitCode && !submitFile)}
          >Enviar</button>
        </form>
      </div>
    </div>
  );
}
