"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg">
        <Card className="p-6 sm:p-8 text-center">
          {/* 404 */}
          <div className="mb-8">
            <div className="text-7xl sm:text-8xl font-bold text-gray-300 mb-6">404</div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Página não encontrada
            </h1>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed px-2">
              Ops! A página que você está procurando não existe ou foi movida para outro lugar.

            </p>
          </div>

          {/* Botão Home */}
          <div>
            <Link href="/" className="inline-block">
              <Button size="lg" className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3">
                Voltar para Home
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}