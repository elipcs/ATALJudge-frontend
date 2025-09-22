"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import Link from "next/link";

function ResetarSenhaContent() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  function validatePassword(password: string) {
    return {
      minLength: password.length >= 8,
      hasLetters: /[a-zA-Z]/.test(password),
      hasNumbers: /[0-9]/.test(password),
      hasUppercase: /[A-Z]/.test(password)
    };
  }

  const passwordValidation = validatePassword(password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validações
    if (!passwordValidation.minLength) {
      setError("Senha deve ter pelo menos 8 caracteres");
      return;
    }
    if (!passwordValidation.hasLetters) {
      setError("Senha deve conter letras");
      return;
    }
    if (!passwordValidation.hasNumbers) {
      setError("Senha deve conter números");
      return;
    }
    if (!passwordValidation.hasUppercase) {
      setError("Senha deve conter pelo menos 1 letra maiúscula");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) throw new Error("Erro ao redefinir senha");
      setSuccess("Senha redefinida com sucesso!");
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      setError(err.message || "Erro ao redefinir senha");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-12">
          {/* Logo */}
          <div className="mb-4 sm:mb-6 flex justify-center text-slate-900">
            <svg 
              width="120" 
              height="45" 
              viewBox="0 0 666 375" 
              fill="currentColor" 
              className="w-24 h-9 sm:w-32 sm:h-12 md:w-40 md:h-15"
              xmlns="http://www.w3.org/2000/svg" 
              aria-label="Logo ATAL JUDGE"
            >
              <g transform="translate(0.000000,375.000000) scale(0.100000,-0.100000)" fill="currentColor" stroke="none">
                  <path d="M1267 2914 c-60 -40 -97 -99 -97 -153 l0 -45 258 -259 c141 -142 269-265 284-273 15-8 43-14 63-14 32 0 47 9 106 66 75 73 91 111 69 163 -6 16 -71 85 -143 153 -268 252-393 365-414 376-36 19-86 14-126-14z"/>
                  <path d="M3016 2802 c-3 -5 -66 -171 -141 -368 -74 -198 -140-370 -146-384-19 -43 -79 -212 -79 -221 0 -5 51 -9 114 -9 l114 0 35 98 35 97 192 0 193 0 32 -95 32 -95 122 -3 c114 -2 122 -1 117 15 -3 10 -86 232 -184 493 l-179 475-126 3 c-69 1-128-1-131-6z m193 -414 c32 -97 57 -179 53 -182 -3 -3 -59-6 -124-6 -89 0 -118 3 -118 13 0 15 105 330 115 347 4 6 9 10 11 8 2 -2 30-83 63-180z"/>
                  <path d="M3560 2715 l0 -95 150 0 150 0 0 -400 0 -400 115 0 115 0 0 400 0 400 145 0 145 0 0 95 0 95 -410 0 -410 0 0 -95z"/>
                  <path d="M4675 2768 c-9 -24 -75 -196 -145 -383 -70 -187 -147 -388 -169 -448-23 -59 -41 -110 -41 -112 0 -3 52 -4 116 -3 l116 3 35 98 35 97 193 0 193 0 33 -100 33 -100 118 0 c78 0 118 4 118 11 0 9 -40 118 -235 629-35 91-78 207-96 257 l-34 93-126 0 -127 0 -17 -42z m204 -372 c33 -99 58 -183 55 -188 -6 -10 -244 -11 -244 0 0 12 122 373 126 370 1 -2 30-84 63-182z"/>
                  <path d="M5440 2315 l0 -495 340 0 340 0 0 95 0 95 -225 0 -225 0 0 400 0 400-115 0 -115 0 0 -495z"/>
                  <path d="M957 2392 l-207 -207 214 -214 c117 -117 218 -212 224 -210 18 7 422 391 422 402 0 10 -430 436 -440 437-3 0 -99 -93 -213 -208z"/>
                  <path d="M473 2107 c-62 -63 -73 -78 -73 -108 0 -19 7 -46 17 -59 28 -42 506-521 535-536 60 -31 107 -13 186 69 43 46 52 62 52 92 0 20 -6 48 -14 63 -22 41 -517 529 -549 541-58 22-77 15-154 -62z"/>
                  <path d="M1447 1902 l-88 -88 248 -265 c136 -145 297 -315 358 -376 l110 -113 53 0 c49 0 56 3 103 47 58 55 79 89 79 133 0 49 -23 81 -112 161 -45 41 -139 126 -208 189-310 284-441 400-448 400-4 0 -47 -40 -95 -88z"/>
                  <path d="M5054 1561 c-58 -15 -128 -55 -171 -97 -149 -149 -149 -436 0 -585 85 -86 204 -122 328 -101 84 15 131 37 182 89 66 65 90 124 95 231 l4 92 -171 0 -171 0 0 -60 0 -60 90 0 c87 0 90 -1 90 -23 0 -31 -43 -88 -83 -109 -45 -24 -137 -23 -186 2 -114 58 -154 227 -87 364 36 74 88 109 170 114 52 3 66 0 96-20 19-13 44-38 55-55 20-32 20-32 108-33 l87 0 -6 28 c-20 88 -73 151-167 199-42 21-68 27-142 29-49 2-104 0-121-5z"/>
                  <path d="M2888 1254 l-3 -296 -24 -19 c-31 -26 -95 -25 -121 1 -11 11 -23 38 -26 60 l-7 41 -76 -3 -76 -3 -3 -32 c-9 -96 69 -199 168 -223 138 -33 292 34 320 140 5 19 10 169 12 333 l3 297 -82 0 -82 0 -3 -296z"/>
                  <path d="M3202 1263 c3 -278 4 -290 26 -335 30 -60 90 -112 156 -135 76 -27 245 -25 306 3 66 31 110 72 136 129 23 49 24 57 24 338 l0 287 -80 0 -80 0 0-265 c0-293-4-315-64-351-42-26-160-27-199-1-61 40-61 44-58 343 l2 274-86 0-87 0 4-287z"/>
                  <path d="M4000 1166 l0 -386 153 0 c83 0 179 4 211 10 126 20 226 95 280 210 27 59 30 75 31 165 0 80 -4 112 -23 160 -32 85 -86 145 -169 186 l-68 34-207 3-208 4 0 -386z m392 216 c89 -44 135 -162 109 -283-25-117-105-169-263-169 l-78 0 0 233 c0 129 3 237 8 241 4 5 45 6 92 4 62-3 98-10 132-26z"/>
                  <path d="M5630 1165 l0 -385 243 0 c134 0 246 2 248 4 2 2 3 36 1 75 l-4 71 -169 0 -169 0 0 80 0 80 149 0 149 0 6 31 c3 17 6 49 6 70 l0 39 -150 0 -150 0 0 90 0 90 164 0 163 0 7 38 c3 20 6 52 6 70 l0 32 -250 0 -250 0 0 -385z"/>
                  <path d="M516 1134 c-12 -11 -16 -36 -16 -90 l0 -74 -44 0 c-63 0 -76 -22 -76-123 0-130 -67-117 585-117 653 0 585-14 585 123 0 99-12 117-78 117l-42 0 0 74 c0 54-4 79-16 90-14 14-68 16-449 16-381 0-435-2-449-16z"/>
                </g>
              </svg>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
              Redefinir senha
            </h1>
            <p className="text-slate-600">
              Digite e confirme sua nova senha para acessar a plataforma
            </p>
          </div>

          {/* Success State */}
          {success ? (
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-green-900">Senha redefinida com sucesso!</h2>
                <p className="text-green-700">Você será redirecionado para a página de login em alguns segundos...</p>
              </div>

              <Link href="/login">
                <Button size="lg" className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                  Ir para o login agora
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Input
                      type="password"
                      placeholder="Nova senha"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      className="w-full h-12 bg-slate-50 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20 text-slate-900 placeholder:text-slate-500"
                    />
                    
                    {/* Password Requirements */}
                    {password && (
                      <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-sm font-medium text-slate-700 mb-2">Requisitos da senha:</p>
                        <div className="space-y-1">
                          <div className={`flex items-center gap-2 text-sm ${passwordValidation.minLength ? 'text-green-600' : 'text-red-600'}`}>
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${passwordValidation.minLength ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {passwordValidation.minLength ? '✓' : '✗'}
                            </span>
                            Mínimo 8 caracteres
                          </div>
                          <div className={`flex items-center gap-2 text-sm ${passwordValidation.hasLetters ? 'text-green-600' : 'text-red-600'}`}>
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${passwordValidation.hasLetters ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {passwordValidation.hasLetters ? '✓' : '✗'}
                            </span>
                            Deve conter letras
                          </div>
                          <div className={`flex items-center gap-2 text-sm ${passwordValidation.hasNumbers ? 'text-green-600' : 'text-red-600'}`}>
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${passwordValidation.hasNumbers ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {passwordValidation.hasNumbers ? '✓' : '✗'}
                            </span>
                            Deve conter números
                          </div>
                          <div className={`flex items-center gap-2 text-sm ${passwordValidation.hasUppercase ? 'text-green-600' : 'text-red-600'}`}>
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${passwordValidation.hasUppercase ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {passwordValidation.hasUppercase ? '✓' : '✗'}
                            </span>
                            Pelo menos 1 letra maiúscula
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Input
                      type="password"
                      placeholder="Confirme a nova senha"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                      className="w-full h-12 bg-slate-50 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20 text-slate-900 placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-red-700 text-sm font-medium">{error}</span>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  size="lg"
                  className="w-full bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-slate-950 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Redefinindo...
                    </div>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="white" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Redefinir senha
                    </>
                  )}
                </Button>
              </form>

          {/* Back to Login */}
            <div className="w-full flex justify-center mt-4 sm:mt-6">
              <Button 
                onClick={() => router.push('/login')} 
                variant="outline"
                size="lg"
                className="w-full border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Voltar para Login
              </Button>
            </div>    
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetarSenhaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando...</p>
        </div>
      </div>
    }>
      <ResetarSenhaContent />
    </Suspense>
  );
}
