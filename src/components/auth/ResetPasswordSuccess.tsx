import Link from "next/link";
import { AuthLayout } from "./index";
import { Button } from "../ui/button";

export function ResetPasswordSuccess() {
  return (
    <AuthLayout 
      title="Senha redefinida com sucesso!"
      subtitle="Você será redirecionado para a página de login em alguns segundos..."
      showLogo={false}
    >
      <div className="text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <Link href="/login">
          <Button size="lg" className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
            Ir para o login agora
          </Button>
        </Link>
      </div>
    </AuthLayout>
  );
}
