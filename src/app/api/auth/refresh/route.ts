// Proxy de refresh token Next.js para backend Python
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    
    // Obter o token do header Authorization
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Token de refresh não fornecido" }, { status: 401 });
    }
    
    const res = await fetch(`${apiUrl}/auth/refresh`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": authHeader
      },
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      return NextResponse.json({ 
        error: data.message || data.error || "Falha ao renovar token" 
      }, { status: res.status });
    }
    
    // Verificar se a resposta tem o formato esperado com success
    if (!data.success) {
      return NextResponse.json({ 
        error: data.message || "Falha ao renovar token" 
      }, { status: 400 });
    }
    
    // O backend agora retorna token dentro de data
    const responseData = {
      access_token: data.token
    };
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Erro ao renovar token:", error);
    return NextResponse.json({ 
      error: "Erro interno do servidor ao renovar token" 
    }, { status: 500 });
  }
}
