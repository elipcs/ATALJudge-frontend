import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    
    // Get authentication token
    const authToken = request.headers.get('authorization');
    
    if (!authToken) {
      return NextResponse.json({ error: 'Token de autenticação não fornecido' }, { status: 401 });
    }
        
    try {
      // Buscar listas de questões
      const listsResponse = await fetch(`${apiUrl}/question-lists`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": authToken
        },
      });

      if (!listsResponse.ok) {
        throw new Error(`Erro ao buscar listas: ${listsResponse.status}`);
      }

      const listsData = await listsResponse.json();
      
      // Verificar se a resposta tem o formato esperado
      if (!listsData.success) {
        throw new Error('Formato de resposta inválido do backend');
      }
      
      const lists = listsData.data || [];

      const result = {
        lists: lists
      };
      
      
      return NextResponse.json(result);

    } catch (fetchError) {
      console.error("Erro ao buscar listas:", fetchError);
      return NextResponse.json({ 
        error: "Erro interno do servidor ao buscar listas" 
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error("Erro ao buscar listas:", error);
    return NextResponse.json({ 
      error: "Erro interno do servidor ao buscar listas" 
    }, { status: 500 });
  }
}
