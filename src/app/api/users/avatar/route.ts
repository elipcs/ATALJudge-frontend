import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS } from "../../../../config/api";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Token de autenticação não fornecido" }, { status: 401 });
    }
    
    const formData = await request.formData();
    
    
    const res = await fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.ENDPOINTS.USERS.AVATAR}`, {
      method: "POST",
      headers: { 
        "Authorization": authHeader
      },
      body: formData,
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      return NextResponse.json({ 
        error: data.error || data.message || "Erro ao fazer upload do avatar" 
      }, { status: res.status });
    }
        
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("Erro ao fazer upload do avatar:", error);
    return NextResponse.json({ 
      error: "Erro interno do servidor ao fazer upload do avatar" 
    }, { status: 500 });
  }
}