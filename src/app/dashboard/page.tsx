"use client";
import { Button } from "../../components/ui/button";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-indigo-200 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl flex flex-col items-center gap-6">
        <h1 className="text-3xl font-bold text-indigo-700 mb-2">Dashboard</h1>
        <div className="w-full flex flex-col md:flex-row gap-6">
          <div className="flex-1 bg-indigo-50 rounded-xl p-6 shadow flex flex-col items-center">
            <div className="text-2xl font-bold text-indigo-600 mb-1">3</div>
            <div className="text-gray-600">Lista de Exercícios</div>
          </div>
          <div className="flex-1 bg-indigo-50 rounded-xl p-6 shadow flex flex-col items-center">
            <div className="text-2xl font-bold text-indigo-600 mb-1">4</div>
            <div className="text-gray-600">Alunos</div>
          </div>
        </div>
        <a href="/home" className="w-full mt-4">
          <Button className="w-full" variant="outline">Voltar para Home</Button>
        </a>
      </div>
    </div>
  );
}
