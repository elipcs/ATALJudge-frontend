"use client";
import { mockSubmissions } from "../../../mocks/submission";
import React from "react";
import { useRouter } from "next/navigation";

interface StatusTableProps {
  list: any;
  onSubmissionClick?: (subId: string) => void;
}

export default function StatusTable({ list, onSubmissionClick }: StatusTableProps) {
  const router = useRouter();
  const [problemFilter, setProblemFilter] = React.useState('All');
  const [langFilter, setLangFilter] = React.useState('All');
  const [page, setPage] = React.useState(1);
  const perPage = 10;
  const problems = Array.from(new Set(list.questions.map(q => q.letter)));
  const languages = ['Python', 'Java'];
  let filtered = mockSubmissions.filter(s => s.userId === "1" && problems.includes(s.problemLetter));
  if (problemFilter !== 'All') filtered = filtered.filter(s => s.problemLetter === problemFilter);
  if (langFilter !== 'All') filtered = filtered.filter(s => s.language === langFilter);
  filtered = filtered.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  return (
    <div className="space-y-2">
      <div className="text-base font-semibold text-foreground mb-2">Últimas Submissões</div>
      <div className="flex flex-wrap gap-2 mb-2">
        <label className="text-xs font-semibold">Problema:
          <select className="ml-1 px-1 py-0.5 rounded border border-border bg-background" value={problemFilter} onChange={e => { setProblemFilter(e.target.value); setPage(1); }}>
            <option value="All">Todos</option>
            {problems.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold">Linguagem:
          <select className="ml-1 px-1 py-0.5 rounded border border-border bg-background" value={langFilter} onChange={e => { setLangFilter(e.target.value); setPage(1); }}>
            <option value="All">Todas</option>
            {languages.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </label>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="bg-secondary text-foreground">
              <th className="px-2 py-2 font-bold text-center">ID</th>
              <th className="px-2 py-2 font-bold text-center">Problema</th>
              <th className="px-2 py-2 font-bold text-center">Resultado</th>
              <th className="px-2 py-2 font-bold text-center">Tempo (ms)</th>
              <th className="px-2 py-2 font-bold text-center">Memória (MB)</th>
              <th className="px-2 py-2 font-bold text-center">Linguagem</th>
              <th className="px-2 py-2 font-bold text-center">Hora de Envio</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(sub => (
              <tr
                key={sub.id}
                className="border-b border-border last:border-0 cursor-pointer hover:bg-accent transition"
                onClick={() => onSubmissionClick ? onSubmissionClick(sub.id) : router.push(`/submissao/${sub.id}`)}
                title="Ver detalhes da submissão"
              >
                <td className="px-2 py-1 font-mono text-center">{sub.id}</td>
                <td className="px-2 py-1 text-center">{sub.problemLetter}</td>
                <td className={`px-2 py-1 font-semibold text-center ${sub.result === 'Accepted' ? 'text-green-500' : sub.result === 'Time limit' ? 'text-red-500' : sub.result.startsWith('Wrong answer') ? 'text-red-500' : sub.result.startsWith('Runtime error') ? 'text-orange-500' : ''}`}>{sub.result}</td>
                <td className="px-2 py-1 text-center">{sub.time}</td>
                <td className="px-2 py-1 text-center">{sub.memory}</td>
                <td className="px-2 py-1 text-green-500 text-center">{sub.language}</td>
                <td className="px-2 py-1 text-muted-foreground text-center">{new Date(sub.submittedAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Paginação */}
      <div className="flex gap-1 justify-center items-center mt-2">
        <button className="px-2 py-1 rounded bg-secondary text-foreground border border-border disabled:opacity-50" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Anterior</button>
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            className={`px-2 py-1 rounded border ${page === i + 1 ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary text-foreground border-border'}`}
            onClick={() => setPage(i + 1)}
          >{i + 1}</button>
        ))}
        <button className="px-2 py-1 rounded bg-secondary text-foreground border border-border disabled:opacity-50" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Próximo</button>
      </div>
    </div>
  );
}
