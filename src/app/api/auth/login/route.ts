// Proxy de autenticação Next.js para backend Python
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {

    
    // Verificar se a requisição tem conteúdo
    const cType = req.headers.get('content-type');
    
    if (!cType || !cType.includes('application/json')) {
      return NextResponse.json({ 
        error: "Content-Type deve ser application/json" 
      }, { status: 400 });
    }

    // Verificar se há corpo na requisição
    const contentLength = req.headers.get('content-length');
    
    if (!contentLength || contentLength === '0') {
      return NextResponse.json({ 
        error: "Corpo da requisição não pode estar vazio" 
      }, { status: 400 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ 
        error: "JSON inválido no corpo da requisição" 
      }, { status: 400 });
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ 
        error: "Corpo da requisição deve ser um objeto JSON válido" 
      }, { status: 400 });
    }

    if (!body.email || !body.password) {
      return NextResponse.json({ 
        error: "Email e senha são obrigatórios" 
      }, { status: 400 });
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    
    const res = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json({ 
        error: "Backend não está respondendo corretamente. Verifique se o servidor está rodando." 
      }, { status: 503 });
    }
    
    const data = await res.json();
    
    if (!res.ok) {
      return NextResponse.json({ 
        error: data.message || data.error || "Credenciais inválidas" 
      }, { status: res.status });
    }
    
    if (!data.success) {
      return NextResponse.json({ 
        error: data.message || "Credenciais inválidas" 
      }, { status: 400 });
    }
    
    const responseData = {
      user: data.user,
      access_token: data.token,
      refresh_token: data.refresh_token || null
    };
    
    if (!responseData.access_token) {
      return NextResponse.json({ error: "Token de acesso não fornecido pelo backend" }, { status: 500 });
    }
    
    return NextResponse.json(responseData);
  } catch {
    return NextResponse.json({ 
      error: "Erro interno do servidor" 
    }, { status: 500 });
  }
}
