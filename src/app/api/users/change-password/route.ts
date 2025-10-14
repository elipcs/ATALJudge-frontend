import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS } from "../../../../config/api";

export async function POST(request: NextRequest) {
  
  try {
        const authHeader = request.headers.get('authorization');
        const normalized = authHeader?.toLowerCase() || '';
        if (!authHeader || !normalized.startsWith('Bearer')) {
      return NextResponse.json({ error: "Token de autenticação não fornecido" }, { status: 401 });
    }
    
    const body = await request.json();
    
  const token = authHeader.replace(/^[Bb]earer\s+/, '');
    let userId = body.userId;
    
    if (!userId) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.userId || payload.sub || payload.id;
      } catch (error) {
        return NextResponse.json({ error: "Token inválido" }, { status: 401 });
      }
    }
    
    const requestBody = {
      user_id: userId,
      current_password: body.currentPassword,
      new_password: body.newPassword
    };
    
    const backendUrl = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.ENDPOINTS.AUTH.CHANGE_PASSWORD}`;
    
    const res = await fetch(backendUrl, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "authorization": `Bearer ${token}`
      },
      body: JSON.stringify(requestBody),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      let errorMessage = "Erro ao alterar senha";
      
      if (data.message) {
        errorMessage = data.message;
      } else if (data.error) {
        errorMessage = data.error;
      } else if (typeof data === 'string') {
        errorMessage = data;
      }
      
      if (res.status === 400) {
        return NextResponse.json({ 
          error: errorMessage
        }, { status: 400 });
      }
      
      return NextResponse.json({ 
        error: errorMessage
      }, { status: res.status });
    }
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    return NextResponse.json({ 
      error: "Erro interno do servidor ao alterar senha" 
    }, { status: 500 });
  }
}