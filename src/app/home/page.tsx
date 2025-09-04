"use client";
import NavBar from "../../components/NavBar";
import Image from "next/image";
import { Button } from "../../components/ui/button";
import { Tabs } from "../../components/ui/tabs";

import { mockLists } from "../../mocks/list";
import { mockStudents } from "../../mocks/student";
import { useState } from "react";

function EditProfileModal({ open, onClose, name, setName, avatar, setAvatar, email }: any) {
	const [success, setSuccess] = useState("");
	const [error, setError] = useState("");
	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setSuccess("");
		setError("");
			if (!name.trim()) {
				setError("Preencha o nome.");
				return;
			}
			setSuccess("Perfil atualizado com sucesso!");
			setTimeout(onClose, 1000);
	}
	if (!open) return null;
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
			<form onSubmit={handleSubmit} className="bg-secondary rounded-2xl shadow-xl p-8 w-full max-w-md flex flex-col items-center gap-4 relative">
				<button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl" onClick={onClose}>&times;</button>
				<Image src={avatar} alt="Avatar" width={80} height={80} className="rounded-full mb-2" />
				{/* Futuramente: upload de avatar */}
				<label className="w-full">
					<span className="block text-sm font-medium text-gray-700 mb-1">Nome</span>
					<input
						type="text"
						className="w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
						value={name}
						onChange={e => setName(e.target.value)}
						required
					/>
				</label>
				<label className="w-full">
					<span className="block text-sm font-medium text-gray-700 mb-1">E-mail</span>
					<input
						type="email"
						className="w-full border border-border rounded-md px-3 py-2 bg-secondary text-gray-400 cursor-not-allowed"
						value={email}
						disabled
					/>
				</label>
				{error && <div className="text-red-500 text-sm w-full text-center">{error}</div>}
				{success && <div className="text-green-600 text-sm w-full text-center">{success}</div>}
				<Button type="submit" className="w-full">Salvar alterações</Button>
			</form>
		</div>
	);
}

function UserProfile() {
	const name = "João da Silva";
	const avatar = "/profile-default.svg";
	const email = "joao@email.com";
	return (
		<div className="bg-secondary rounded-xl shadow p-6 flex flex-col items-center">
			<Image src={avatar} alt="Avatar" width={64} height={64} className="mb-2 rounded-full" />
			<div className="font-bold text-lg mt-2">{name}</div>
			<div className="text-gray-500 text-sm">{email}</div>
			<a href="/profile" className="w-full mt-4">
				<Button className="w-full" variant="outline">Ver Perfil</Button>
			</a>
		</div>
	);
}

function ClassName() {
	return (
		<div className="bg-secondary rounded-xl shadow p-6 flex flex-col items-center mb-6">
			<div className="text-gray-500 text-sm mb-1">Turma</div>
			<div className="font-bold text-xl text-primary">ATAL 2025.1</div>
		</div>
	);
}

function formatDateBR(dateStr: string) {
	if (!dateStr) return "-";
	const d = new Date(dateStr.replace(/-/g, "/"));
	if (isNaN(d.getTime())) return dateStr;
	return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function ListsComponent() {
	return (
		<div className="bg-secondary rounded-xl shadow p-6 mb-6">
					<div className="font-semibold text-lg mb-2">
						<a href="/lista" className="hover:underline text-primary">Listas</a>
					</div>
			<div className="overflow-x-auto">
				<table className="min-w-full text-sm text-left">
					<thead className="bg-secondary">
						<tr>
							<th className="px-2 py-2 font-bold">Título</th>
							<th className="px-2 py-2 font-bold">Início</th>
							<th className="px-2 py-2 font-bold">Fim</th>
							<th className="px-2 py-2 font-bold">Questões</th>
						</tr>
					</thead>
					<tbody>
						{mockLists.map(list => (
							<tr key={list.id}>
								<td className="px-2 py-2">
									<a href={`/lista/${list.id}`} className="text-primary hover:underline font-medium">{list.title}</a>
								</td>
								<td className="px-2 py-2">{formatDateBR(list.startDate)}</td>
								<td className="px-2 py-2">{formatDateBR(list.endDate)}</td>
								<td className="px-2 py-2">{list.questions.length}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

function StudentsComponent() {
	return (
		<div className="bg-secondary rounded-xl shadow p-6">
					<div className="font-semibold text-lg mb-2">
						<a href="/alunos" className="hover:underline text-primary">Alunos</a>
					</div>
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
	);
}

export default function HomePage() {
  // Usuário autenticado mock
  const user = { id: "1", avatar: "/profile-default.svg" };
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-indigo-200 flex flex-col">
      <NavBar user={user} />
      <div className="flex flex-1 flex-col md:flex-row gap-8 p-6 md:p-12 max-w-6xl mx-auto w-full">
        {/* Perfil do usuário à esquerda */}
        <aside className="md:w-1/4 w-full mb-8 md:mb-0 flex-shrink-0">
          <UserProfile />
        </aside>
        {/* Dashboard principal com abas */}
        <main className="flex-1 flex flex-col">
          <ClassName />
          <Tabs
            tabs={[
			  { label: "Lista", content: <ListsComponent /> },
              { label: "Alunos", content: <StudentsComponent /> },
            ]}
          />
        </main>
      </div>
    </div>
  );
}
