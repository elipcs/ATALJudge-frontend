
"use client";
import Image from "next/image";
import { Button } from "../../components/ui/button";
import { useState } from "react";
import { mockUsers } from "../../mocks/user";
import NavBar from "../../components/NavBar";


function EditProfileModal({ open, onClose, name, setName, avatar, setAvatar, role, matricula, setMatricula }: any) {
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
		if (role === "estudante" && (!matricula || !/^[0-9]{9,11}$/.test(matricula))) {
			setError("Matrícula deve ter pelo menos 9 dígitos.");
			return;
		}
		setSuccess("Perfil atualizado com sucesso!");
		setTimeout(onClose, 1000);
	}
	if (!open) return null;
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
			<form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md flex flex-col items-center gap-4 relative">
				<button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl" onClick={onClose}>&times;</button>
				<Image src={avatar} alt="Avatar" width={80} height={80} className="rounded-full mb-2" />
				{/* Futuramente: upload de avatar */}
				<label className="w-full">
					<span className="block text-sm font-medium text-gray-700 mb-1">Nome</span>
					<input
						type="text"
						className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
						value={name}
						onChange={e => setName(e.target.value)}
						required
					/>
				</label>
				{role === "estudante" && (
					<label className="w-full">
						<span className="block text-sm font-medium text-gray-700 mb-1">Matrícula</span>
						<input
							type="text"
							className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-mono"
							value={matricula}
							onChange={e => setMatricula(e.target.value)}
							required
							minLength={9}
							maxLength={11}
							pattern="[0-9]{9,11}"
							inputMode="numeric"
						/>
					</label>
				)}
				{error && <div className="text-red-500 text-sm w-full text-center">{error}</div>}
				{success && <div className="text-green-600 text-sm w-full text-center">{success}</div>}
				<Button type="submit" className="w-full">Salvar alterações</Button>
			</form>
		</div>
	);
}

export default function ProfilePage() {
	// Usuário autenticado mock (id 1)
	const userData = mockUsers["1"];
	const [name, setName] = useState(userData.name);
	const [avatar, setAvatar] = useState(userData.avatar);
	const email = userData.email;
	const role = userData.role;
	const matricula = userData.matricula;
	const [editOpen, setEditOpen] = useState(false);
	const [matriculaState, setMatricula] = useState(matricula || "");

	function getRoleLabel(role: string) {
		const r = String(role || "").trim().toLowerCase();
		if (r === "student" || r === "estudante") return "Estudante";
		if (r === "teacher" || r === "professor") return "Professor";
		if (r === "admin" || r === "administrador") return "Administrador";
		return "Usuário";
	}

	// Usuário autenticado mock para NavBar
	const user = { id: "1", avatar };
	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-indigo-200 flex flex-col">
			<NavBar user={user} />
			<div className="flex flex-1 flex-col items-center justify-center p-4">
				<div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md flex flex-col items-center gap-4">
					<Image src={avatar} alt="Avatar" width={80} height={80} className="rounded-full mb-2" />
					<div className="font-bold text-lg mt-2">{name}</div>
					<div className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-700 font-semibold mb-1">
						{getRoleLabel(role)}
					</div>
					<div className="text-gray-500 text-sm mb-2">{email}</div>
					{role === "estudante" && (
						<div className="text-gray-700 text-sm mb-2">Matrícula: <span className="font-mono">{matriculaState}</span></div>
					)}
					<Button className="w-full" variant="outline" onClick={() => setEditOpen(true)}>
						Editar perfil
					</Button>
				</div>
				<EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} name={name} setName={setName} avatar={avatar} setAvatar={setAvatar} role={role} matricula={matriculaState} setMatricula={setMatricula} />
			</div>
		</div>
	);
}
