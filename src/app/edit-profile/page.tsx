"use client";import Image from "next/image";
import { Button } from "../../components/ui/button";
import { useState } from "react";

export default function EditProfilePage() {
  const [name, setName] = useState("João da Silva");
  const [avatar, setAvatar] = useState("/profile-default.svg");
  const [email] = useState("joao@email.com");
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
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-indigo-200 flex flex-col items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md flex flex-col items-center gap-4">
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
        <label className="w-full">
          <span className="block text-sm font-medium text-gray-700 mb-1">E-mail</span>
          <input
            type="email"
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-400 cursor-not-allowed"
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

