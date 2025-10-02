// Proxy de registro Next.js para backend Python
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    
    const res = await fetch(`${apiUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    
    
    let data;
    try {
      data = await res.json();
    } catch (jsonError) {
      console.error('Erro ao fazer parse do JSON:', jsonError);
      const textResponse = await res.text();
      console.error('Resposta em texto:', textResponse);
      return NextResponse.json({ 
        error: `Erro no backend: ${res.status} - ${textResponse}` 
      }, { status: res.status });
    }
        
    if (!res.ok) {
      return NextResponse.json({ 
        error: data.message || data.error || "Erro ao registrar usuário" 
      }, { status: res.status });
    }
    
    // Verificar se a resposta tem o formato esperado com success
    if (!data.success) {
      return NextResponse.json({ 
        error: data.message || "Erro ao registrar usuário" 
      }, { status: 400 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return NextResponse.json({ 
      error: `Erro interno do servidor: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
    }, { status: 500 });
  }
}
