import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    
    // Get authentication token
    const authToken = request.headers.get('authorization');
    
    if (!authToken) {
      return NextResponse.json({ error: 'Token de autenticação não fornecido' }, { status: 401 });
    }
    
    // Get query parameters
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const limit = url.searchParams.get('limit') || '5';
    
    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 });
    }
        
    const response = await fetch(`${apiUrl}/submissions?userId=${userId}&limit=${limit}`, {
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
        
    return NextResponse.json({ submissions: data.submissions || [] });
    
  } catch (error) {
    console.error("Erro ao buscar submissões do estudante:", error);
    return NextResponse.json({ 
      error: "Erro interno do servidor ao buscar submissões do estudante" 
    }, { status: 500 });
  }
}

