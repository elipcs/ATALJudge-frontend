import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS } from "../../../../config/api";

export async function GET(request: NextRequest) {
  try {
      let authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
      if (authHeader) {
        const match = authHeader.match(/^Bearer(.+)$/i);
        if (match) {
          authHeader = `Bearer ${match[1]}`;
        }
      }
    const hasBearer = authHeader ? /^[Bb]earer\s+/.test(authHeader) : false;
    if (!authHeader || !hasBearer) {
      return NextResponse.json({ error: "Token de autenticação não fornecido" }, { status: 401 });
    }
    const token = authHeader.replace(/^[Bb]earer\s+/, '');
        
    const res = await fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.ENDPOINTS.USERS.PROFILE}`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
         "Authorization": `Bearer ${token}`
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
    const authHeader = request.headers.get('authorization');
    const hasBearer = authHeader ? /^[Bb]earer\s+/.test(authHeader) : false;
    if (!authHeader || !hasBearer) {
      return NextResponse.json({ error: "Token de autenticação não fornecido" }, { status: 401 });
    }
    const token = authHeader.replace(/^[Bb]earer\s+/, '');
    
    const body = await request.json();
        
    const res = await fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.ENDPOINTS.USERS.PROFILE}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "authorization": `Bearer ${token}`
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