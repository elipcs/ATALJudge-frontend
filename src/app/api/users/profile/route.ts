import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS } from "../../../../config/api";

export async function GET(request: NextRequest) {
  try {
        // Obter o token do header Authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Token de autenticação não fornecido" }, { status: 401 });
    }
        
    const res = await fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.ENDPOINTS.USERS.PROFILE}`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": authHeader
      },
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      return NextResponse.json({ 
        error: data.error || data.message || "Erro ao buscar perfil" 
      }, { status: res.status });
    }
        
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return NextResponse.json({ 
      error: "Erro interno do servidor ao buscar perfil" 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
        // Obter o token do header Authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Token de autenticação não fornecido" }, { status: 401 });
    }
    
    // Obter o corpo da requisição
    const body = await request.json();
        
    const res = await fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.ENDPOINTS.USERS.PROFILE}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": authHeader
      },
      body: JSON.stringify(body),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      return NextResponse.json({ 
        error: data.error || data.message || "Erro ao atualizar perfil" 
      }, { status: res.status });
    }
        
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return NextResponse.json({ 
      error: "Erro interno do servidor ao atualizar perfil" 
    }, { status: 500 });
  }
}