"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import Image from "next/image";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) throw new Error("Erro ao cadastrar");
      setSuccess("Cadastro realizado! Faça login.");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: any) {
      setError(err.message || "Erro ao cadastrar");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-indigo-200">
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 sm:p-10 flex flex-col items-center">
  <span className="mb-2" style={{ width: 180, height: 60, display: 'inline-block' }}>
          {/* Inline SVG Logo */}
          <svg viewBox="0 0 666 375" width="180" height="60" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(0,375) scale(0.1,-0.1)">
              <path d="M1267 2914c-60-40-97-99-97-153l0-45 258-259c141-142 269-265 284-273 15-8 43-14 63-14 32 0 47 9 106 66 75 73 91 111 69 163-6 16-71 85-143 153-268 252-393 365-414 376-36 19-86 14-126-14z"/>
              <path d="M3016 2802c-3-5-66-171-141-368-74-198-140-370-146-384-19-43-79-212-79-221 0-5 51-9 114-9l114 0 35 98 35 97 192 0 193 0 32-95 32-95 122-3c114-2 122-1 117 15-3 10-86 232-184 493l-179 475-126 3c-69 1-128-1-131-6z m193-414c32-97 57-179 53-182-3-3-59-6-124-6-89 0-118 3-118 13 0 15 105 330 115 347 4 6 9 10 11 8 2-2 30-83 63-180z"/>
              <path d="M3560 2715l0-95 150 0 150 0 0-400 0-400 115 0 115 0 0 400 0 400 145 0 145 0 0 95 0 95-410 0-410 0 0-95z"/>
              <path d="M4675 2768c-9-24-75-196-145-383-70-187-147-388-169-448-23-59-41-110-41-112 0-3 52-4 116-3l116 3 35 98 35 97 193 0 193 0 33-100 33-100 118 0c78 0 118 4 118 11 0 9-40 118-235 629-35 91-78 207-96 257l-34 93-126 0-127 0-17-42z m204-372c33-99 58-183 55-188-6-10-244-11-244 0 0 12 122 373 126 370 1-2 30-84 63-182z"/>
              <path d="M5440 2315l0-495 340 0 340 0 0 95 0 95-225 0-225 0 0 400 0 400-115 0-115 0 0-495z"/>
              <path d="M957 2392l-207-207 214-214c117-117 218-212 224-210 18 7 422 391 422 402 0 10-430 436-440 437-3 0-99-93-213-208z"/>
              <path d="M473 2107c-62-63-73-78-73-108 0-19 7-46 17-59 28-42 506-521 535-536 60-31 107-13 186 69 43 46 52 62 52 92 0 20-6 48-14 63-22 41-517 529-549 541-58 22-77 15-154-62z"/>
              <path d="M1447 1902l-88-88 248-265c136-145 297-315 358-376l110-113 53 0c49 0 56 3 103 47 58 55 79 89 79 133 0 49-23 81-112 161-45 41-139 126-208 189-310 284-441 400-448 400-4 0-47-40-95-88z"/>
              <path d="M5054 1561c-58-15-128-55-171-97-149-149-149-436 0-585 85-86 204-122 328-101 84 15 131 37 182 89 66 65 90 124 95 231l4 92-171 0-171 0 0-60 0-60 90 0c87 0 90-1 90-23 0-31-43-88-83-109-45-24-137-23-186 2-114 58-154 227-87 364 36 74 88 109 170 114 52 3 66 0 96-20 19-13 44-38 55-55 20-32 20-32 108-33l87 0-6 28c-20 88-73 151-167 199-42 21-68 27-142 29-49 2-104 0-121-5z"/>
              <path d="M2888 1254l-3-296-24-19c-31-26-95-25-121 1-11 11-23 38-26 60l-7 41-76-3-76-3-3-32c-9-96 69-199 168-223 138-33 292 34 320 140 5 19 10 169 12 333l3 297-82 0-82 0-3-296z"/>
              <path d="M3202 1263c3-278 4-290 26-335 30-60 90-112 156-135 76-27 245-25 306 3 66 31 110 72 136 129 23 49 24 57 24 338l0 287-80 0-80 0 0-265c0-293-4-315-64-351-42-26-160-27-199-1-61 40-61 44-58 343l2 274-86 0-87 0 4-287z"/>
              <path d="M4000 1166l0-386 153 0c83 0 179 4 211 10 126 20 226 95 280 210 27 59 30 75 31 165 0 80-4 112-23 160-32 85-86 145-169 186l-68 34-207 3-208 4 0-386z m392 216c89-44 135-162 109-283-25-117-105-169-263-169l-78 0 0 233c0 129 3 237 8 241 4 5 45 6 92 4 62-3 98-10 132-26z"/>
              <path d="M5630 1165l0-385 243 0c134 0 246 2 248 4 2 2 3 36 1 75l-4 71-169 0-169 0 0 80 0 80 149 0 149 0 6 31c3 17 6 49 6 70l0 39-150 0-150 0 0 90 0 90 164 0 163 0 7 38c3 20 6 52 6 70l0 32-250 0-250 0 0-385z"/>
              <path d="M516 1134c-12-11-16-36-16-90l0-74-44 0c-63 0-76-22-76-123 0-130-67-117 585-117 653 0 585-14 585 123 0 99-12 117-78 117l-42 0 0 74c0 54-4 79-16 90-14 14-68 16-449 16-381 0-435-2-449-16z"/>
            </g>
          </svg>
        </span>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2 text-center">Criar conta</h1>
        <p className="text-gray-600 mb-6 text-center">Preencha os campos para se cadastrar</p>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <Input
            type="text"
            placeholder="Nome"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="bg-indigo-50 focus:bg-white border border-indigo-200 focus:border-indigo-500 text-gray-900"
          />
          <Input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="bg-indigo-50 focus:bg-white border border-indigo-200 focus:border-indigo-500 text-gray-900"
          />
          <Input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="bg-indigo-50 focus:bg-white border border-indigo-200 focus:border-indigo-500 text-gray-900"
          />
          <Input
            type="password"
            placeholder="Confirme a senha"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            className="bg-indigo-50 focus:bg-white border border-indigo-200 focus:border-indigo-500 text-gray-900"
          />
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          {success && <div className="text-green-600 text-sm text-center">{success}</div>}
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2 text-lg rounded-md mt-2">Cadastrar</Button>
        </form>
        <div className="w-full flex justify-between mt-4 text-sm">
          <button type="button" className="text-indigo-600 hover:underline" onClick={() => router.push("/login")}>Já tenho conta</button>
        </div>
      </div>
    </div>
  );
}
