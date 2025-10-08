import { NextResponse } from "next/server";
import { API_ENDPOINTS } from "../../../../config/api";

export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(req: Request) {

  try {
    const cType = req.headers.get('content-type');
    
    if (!cType || !cType.includes('application/json')) {
      return NextResponse.json({error: "Content-Type deve ser application/json"}, { status: 400 });
    }

    const contentLength = req.headers.get('content-length');
    
    if (!contentLength || contentLength === '0') {
      return NextResponse.json({ 
        error: "Corpo da requisição não pode estar vazio" 
      }, { status: 400 });
    }

    const body = await req.json();

    if (!body.email || !body.password) {
      return NextResponse.json({ 
        error: "Email e senha são obrigatórios" 
      }, { status: 400 });
    }

    const res = await fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.ENDPOINTS.AUTH.LOGIN}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    
    console.log('🔍 Debug - Resposta do backend:', { status: res.status, data });

    if (!res.ok) {
      let errorMessage = "Email ou senha incorretos";
      
      if (res.status === 401) {
        errorMessage = "Email ou senha incorretos";
      } else if (res.status === 404) {
        errorMessage = "Usuário não encontrado";
      } else if (res.status === 403) {
        errorMessage = "Conta desativada ou bloqueada";
      } else if (data.message && data.message.toLowerCase().includes('password')) {
        errorMessage = "Senha incorreta";
      } else if (data.message && data.message.toLowerCase().includes('email')) {
        errorMessage = "Email não encontrado";
      } else if (data.message && data.message.toLowerCase().includes('invalid')) {
        errorMessage = "Email ou senha incorretos";
      } else if (data.message) {
        errorMessage = data.message;
      }
      
      return NextResponse.json({ 
        error: errorMessage
      }, { status: res.status });
    }
    
    const responseData = {
      user: data.data.user,
      accessToken: data.data.access_token,
      refreshToken: data.data.refresh_token
    };
    
    if (!responseData.accessToken) {
      return NextResponse.json({ error: "Token de acesso não fornecido pelo backend" }, { status: 500 });
    }

    if (!responseData.refreshToken) {
      return NextResponse.json({ error: "Token de refresh não fornecido pelo backend" }, { status: 500 });
    }
    
    return NextResponse.json(responseData);
  } catch (error) {
    return NextResponse.json({ 
      error: "Erro interno do servidor: " + error 
    }, { status: 500 });
  }
}
