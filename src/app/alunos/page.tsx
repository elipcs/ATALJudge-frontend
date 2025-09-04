"use client";
import Image from "next/image";
import NavBar from "../../components/NavBar";
import { mockStudents } from "../../mocks/student";

export default function AlunosPage() {
  // Usuário autenticado mock
  const user = { id: "1", avatar: "/profile-default.svg" };
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavBar user={user} />
      <div className="flex flex-1 flex-col items-center p-6 md:p-12 max-w-4xl mx-auto w-full">
        <div className="bg-secondary rounded-xl shadow p-6 w-full">
          <div className="font-semibold text-lg mb-4 text-primary">Alunos da Turma</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-2 py-2 font-bold">Nome</th>
                  <th className="px-2 py-2 font-bold">Matrícula</th>
                </tr>
              </thead>
              <tbody>
                {mockStudents.map(student => (
                  <tr key={student.id}>
                    <td className="px-2 py-2 flex items-center gap-2">
                      <Image src={student.avatar} alt={student.name} width={28} height={28} className="rounded-full" />
                      <span className="font-medium">{student.name}</span>
                    </td>
                    <td className="px-2 py-2 font-mono text-xs text-gray-700">{student.matricula}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
