"use client";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { mockLists } from "../../../mocks/list";
import { Button } from "../../../components/ui/button";
import NavBar from "../../../components/NavBar";
import React from "react";

const StatusTable = dynamic(() => import("./StatusTable"), { ssr: false });
const SubmissionStatusModal = dynamic(() => import("./SubmissionStatusModal"), { ssr: false });
const QuestionTab = dynamic(() => import("./QuestionTab"), { ssr: false });

import { mockSubmissions } from "../../../mocks/submission";

export default function ListaIdClient() {
  const { id } = useParams();
  const user = { id: "1", avatar: "/profile-default.svg" };
  const list = mockLists.find(l => l.id === String(id));
  const [tab, setTab] = React.useState<'visao' | 'questao' | 'status'>('visao');
  const [selectedIdx, setSelectedIdx] = React.useState(0);
  // Modal de status da submissão da aba de questão
  const [showQuestionStatusModal, setShowQuestionStatusModal] = React.useState(false);
  const [questionSubmissionInfo, setQuestionSubmissionInfo] = React.useState<any>(null);
  // Modal de detalhes da submissão da aba de status
  const [showTableStatusModal, setShowTableStatusModal] = React.useState(false);
  const [tableSubmissionInfo, setTableSubmissionInfo] = React.useState<any>(null);

  // Cálculo do tempo restante para a barra de progresso
  const parseDate = (str: string) => {
    if (!str) return null;
    const [date, time] = str.split(' ');
    if (!date || !time) return null;
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute);
  };
  const start = parseDate(list?.startDate);
  const end = parseDate(list?.endDate);
  const now = new Date();
  let percent = 100;
  let timeLeftStr = 'Finalizada';
  if (start && end && now < end) {
    const total = +end - +start;
    const elapsed = +now - +start;
    percent = Math.max(0, Math.min(100, (elapsed / total) * 100));
    const msLeft = +end - +now;
    const hours = Math.floor(msLeft / 1000 / 60 / 60);
    const minutes = Math.floor((msLeft / 1000 / 60) % 60);
    const seconds = Math.floor((msLeft / 1000) % 60);
    timeLeftStr = `${hours}h ${minutes}m ${seconds}s restantes`;
  } else if (start && end && now >= end) {
    percent = 100;
    timeLeftStr = 'Finalizada';
  }

  if (!list) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar user={user} />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-gray-600 text-lg">Lista não encontrada.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavBar user={user} />
      <main className="flex flex-1 flex-col items-center justify-start p-4">
        <div className="w-full max-w-4xl bg-muted rounded-2xl shadow-xl p-6 sm:p-10 flex flex-col gap-6">
          {/* Header com datas e progresso */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-card rounded-xl p-4 border border-border">
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <span className="font-semibold text-base text-foreground">Início:</span>
              <span className="text-sm text-muted-foreground">{list.startDate} UTC-3</span>
            </div>
            <div className="text-2xl font-bold text-primary flex items-center">{list.title}</div>
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <span className="font-semibold text-base text-foreground">Fim:</span>
              <span className="text-sm text-muted-foreground">{list.endDate} UTC-3</span>
            </div>
          </div>
          {/* Barra de progresso e contador de tempo */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-full h-4 bg-card rounded-full overflow-hidden">
              <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${percent}%` }} />
            </div>
            <span className="text-green-500 font-semibold text-lg">{timeLeftStr}</span>
          </div>
          {/* Abas */}
          <div className="w-full">
            <div className="flex gap-2 border-b border-border mb-4">
              <button onClick={() => setTab('visao')} className={`px-4 py-2 text-sm font-semibold ${tab === 'visao' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'} bg-transparent`}>Visão Geral</button>
              <button onClick={() => setTab('questao')} className={`px-4 py-2 text-sm font-semibold ${tab === 'questao' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'} bg-transparent`}>Questão</button>
              <button onClick={() => setTab('status')} className={`px-4 py-2 text-sm font-semibold ${tab === 'status' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'} bg-transparent`}>Status</button>
            </div>
            {/* Conteúdo das abas */}
            {tab === 'visao' && (
              <div className="overflow-x-auto rounded-xl">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-secondary text-foreground">
                      <th className="px-1 py-2 font-bold w-40">Pontuação</th>
                      <th className="px-2 py-2 font-bold">#</th>
                      <th className="px-2 py-2 font-bold">Título</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.questions.map((q, idx) => (
                      <tr key={q.id} className="border-b border-border last:border-0">
                        <td className="px-1 py-2 text-center w-40">
                          {/* Label de status */}
                          {(() => {
                            let label = "Não tentado";
                            let color = "bg-gray-300 text-gray-700";
                            if (typeof q.lastScore === "number") {
                              if (q.lastScore === 10) {
                                label = "Perfeito";
                                color = "bg-green-700 text-white";
                              } else if (q.lastScore >= 7) {
                                label = "Resolvido";
                                color = "bg-green-400 text-white";
                              } else if (q.lastScore > 0) {
                                label = "Tentado";
                                color = "bg-yellow-400 text-black";
                              }
                            }
                            return (
                              <span className={`block rounded px-2 py-0.5 text-xs font-semibold mb-1 ${color}`}>{label}</span>
                            );
                          })()}
                          {/* Pontuação */}
                          <span className="text-blue-500 font-bold">{q.lastScore ?? 0}</span>
                          <span className="text-foreground">/10</span>
                        </td>
                        <td className="px-2 py-2 font-mono font-bold text-center">{q.letter}</td>
                        <td className="px-2 py-2">
                          <span className="font-semibold text-primary hover:underline cursor-pointer">{q.title}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {tab === 'questao' && (
              <div className="flex flex-col md:flex-row gap-6">
                {/* Coluna de seleção de questão */}
                <div className="flex md:flex-col gap-2 md:min-w-[48px]">
                  {list.questions.map((q, idx) => (
                    <button
                      key={q.id}
                      onClick={() => setSelectedIdx(idx)}
                      className={`w-10 h-10 rounded-lg font-bold text-lg border-2 flex items-center justify-center transition-all ${selectedIdx === idx ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary text-foreground border-border hover:border-primary'}`}
                      title={q.title}
                    >
                      {q.letter ?? String.fromCharCode(65 + idx)}
                    </button>
                  ))}
                </div>
                {/* Conteúdo da questão */}
                <div className="flex-1">
                  <QuestionTab
                    questions={list.questions}
                    selectedIdx={selectedIdx}
                    showStatusModal={showQuestionStatusModal}
                    setShowStatusModal={setShowQuestionStatusModal}
                    submissionInfo={questionSubmissionInfo}
                    setSubmissionInfo={setQuestionSubmissionInfo}
                    userName={user.id === "1" ? "Você" : "Usuário"}
                  />
                </div>
              </div>
            )}
            {tab === 'status' && (
              <StatusTable
                list={list}
                onSubmissionClick={(subId: string) => {
                  const sub = mockSubmissions.find(s => s.id === subId);
                  if (sub) {
                    setTableSubmissionInfo({
                      status: sub.result,
                      language: sub.language,
                      sentAt: new Date(sub.submittedAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
                      code: sub.code,
                      time: sub.time,
                      memory: sub.memory,
                      userName: sub.userName || 'Usuário'
                    });
                    setShowTableStatusModal(true);
                  }
                }}
              />
            )}
            {/* Modal da submissão feita na aba de questão */}
            <SubmissionStatusModal open={showQuestionStatusModal} onClose={() => setShowQuestionStatusModal(false)} submission={questionSubmissionInfo} />
            {/* Modal de detalhes da submissão da tabela de status */}
            <SubmissionStatusModal open={showTableStatusModal} onClose={() => setShowTableStatusModal(false)} submission={tableSubmissionInfo} />
          </div>
          <div className="flex justify-end w-full mt-2">
            <a href="/lista">
              <Button variant="outline">Voltar para Listas</Button>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
