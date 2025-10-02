import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    
    // Obter o token do header Authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Token de autenticação não fornecido" }, { status: 401 });
    }
    
    // Obter o corpo da requisição para pegar o refresh_token
    const body = await request.json().catch(() => ({}));
    
    
    const res = await fetch(`${apiUrl}/auth/logout`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": authHeader
      },
      body: JSON.stringify(body),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      return NextResponse.json({ 
        error: data.message || data.error || "Erro ao fazer logout no servidor" 
      }, { status: res.status });
    }
    
    
    return NextResponse.json({ 
      success: true, 
      message: "Logout realizado com sucesso" 
    });
    
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    return NextResponse.json({ 
      error: "Erro interno do servidor ao fazer logout" 
    }, { status: 500 });
  }
}
