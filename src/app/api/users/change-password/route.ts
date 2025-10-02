import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Token de autenticação não fornecido" }, { status: 401 });
    }
    
    const body = await request.json();
    
    // Extrair o ID do usuário do token JWT
    const token = authHeader.replace('Bearer ', '');
    let userId = body.userId; // Usar o userId do body se fornecido
    
    if (!userId) {
      try {
        // Decodificar o token JWT para extrair o userId
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.userId || payload.sub || payload.id;
      } catch (error) {
        return NextResponse.json({ error: "Token inválido" }, { status: 401 });
      }
    }
    
    // Adicionar o user_id ao body e converter campos para o formato esperado pelo backend
    const requestBody = {
      user_id: userId,
      current_password: body.currentPassword,
      new_password: body.newPassword
    };
    
    const backendUrl = `${apiUrl}/auth/change-password`;
    
    const res = await fetch(backendUrl, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": authHeader
      },
      body: JSON.stringify(requestBody),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      // Extrair a mensagem de erro do backend
      let errorMessage = "Erro ao alterar senha";
      
      if (data.message) {
        errorMessage = data.message;
      } else if (data.error) {
        errorMessage = data.error;
      } else if (typeof data === 'string') {
        errorMessage = data;
      }
      
      // Para erros de validação (400), sempre retornar status 400 mas preservar a mensagem
      if (res.status === 400) {
        return NextResponse.json({ 
          error: errorMessage
        }, { status: 400 });
      }
      
      // Para outros erros, retornar o status original
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