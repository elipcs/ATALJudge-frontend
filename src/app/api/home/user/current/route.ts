import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    
    // Get authentication token
    const authToken = request.headers.get('authorization');
    
    if (!authToken) {
      return NextResponse.json({ error: 'Token de autenticação não fornecido' }, { status: 401 });
    }
        
    const response = await fetch(`${apiUrl}/users/profile`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": authToken
      },
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    
    // Transformar dados do backend para o formato esperado pelo frontend
    const user = {
      id: data.data.id,
      name: data.data.name,
      email: data.data.email,
      role: data.data.role,
      avatar: data.data.avatar || "/profile-default.svg"
    };
        
    return NextResponse.json(user);
    
  } catch (error) {
    console.error("Erro ao buscar dados do usuário:", error);
    return NextResponse.json({ 
      error: "Erro interno do servidor ao buscar dados do usuário" 
    }, { status: 500 });
  }
}
