"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AuthLoadingTimeoutProps {
  timeoutMs?: number;
  message?: string;
  onTimeout?: () => void;
}

export default function AuthLoadingTimeout({ 
  timeoutMs = 10000, 
  message = "Verificando autenticação...",
  onTimeout 
}: AuthLoadingTimeoutProps) {
  const [timeLeft, setTimeLeft] = useState(Math.ceil(timeoutMs / 1000));
  const [showTimeout, setShowTimeout] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setShowTimeout(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleGoToLogin = () => {
    if (onTimeout) {
      onTimeout();
    } else {
      router.push("/login");
    }
  };

  if (showTimeout) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8 sm:p-12 text-center">
            <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 text-orange-600 rounded-xl shadow-lg border border-orange-200 mx-auto mb-6 w-fit">
              <svg className="w-16 h-16 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
              Timeout de Autenticação
            </h1>
            <p className="text-slate-600 text-lg sm:text-xl leading-relaxed max-w-lg mx-auto mb-8">
              A verificação de autenticação demorou muito para responder. Isso pode indicar problemas de conexão ou servidor.
            </p>
            <div className="space-y-4">
              <button
                onClick={handleGoToLogin}
                className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm hover:shadow-md font-semibold transition-all duration-200 transform hover:scale-[1.02] py-3 px-6 rounded-xl"
              >
                <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Ir para Login
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200 shadow-sm hover:shadow-md font-semibold transition-all duration-200 transform hover:scale-[1.02] py-3 px-6 rounded-xl"
              >
                <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Tentar Novamente
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8 sm:p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{message}</h1>
          <p className="text-slate-600 mb-4">Aguarde enquanto verificamos sua autenticação...</p>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center justify-center gap-2 text-sm text-blue-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Timeout em {timeLeft} segundo{timeLeft !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

