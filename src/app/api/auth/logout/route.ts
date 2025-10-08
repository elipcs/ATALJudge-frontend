import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS } from "../../../../config/api";

export async function POST(request: NextRequest) {

  try {
    
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Token de autenticação não fornecido" }, { status: 401 });
    }
    
    const body = await request.json();
    const res = await fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.ENDPOINTS.AUTH.LOGOUT}`, {
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
