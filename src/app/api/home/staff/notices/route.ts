import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    
    // Get authentication token
    const authToken = request.headers.get('authorization');
    
    if (!authToken) {
      return NextResponse.json({ error: 'Token de autenticação não fornecido' }, { status: 401 });
    }
        
      const response = await fetch(`${apiUrl}/sistema/avisos`, {
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
            
      return NextResponse.json({ notices: data.notices || [] });
    
  } catch (error) {
    console.error("Erro ao buscar avisos do sistema:", error);
    return NextResponse.json({ 
      error: "Erro interno do servidor ao buscar avisos do sistema" 
    }, { status: 500 });
  }
}
