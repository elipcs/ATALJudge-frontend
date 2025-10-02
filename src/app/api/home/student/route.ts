import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    
    // Get authentication token
    const authToken = request.headers.get('authorization');
    
    if (!authToken) {
      return NextResponse.json({ error: 'Token de autenticação não fornecido' }, { status: 401 });
    }
    
    
    // Buscar perfil do usuário
    const userResponse = await fetch(`${apiUrl}/users/profile`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": authToken
      },
    });

    if (!userResponse.ok) {
      throw new Error(`Erro ao buscar perfil: ${userResponse.status}`);
    }

    await userResponse.json();

    // Buscar turmas do usuário
    const classesResponse = await fetch(`${apiUrl}/classes/`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": authToken
      },
    });

    if (!classesResponse.ok) {
      throw new Error(`Erro ao buscar turmas: ${classesResponse.status}`);
    }

    const classesData = await classesResponse.json();
    
    // Verificar se a resposta tem o formato esperado
    if (!classesData.success) {
      throw new Error('Formato de resposta inválido do backend');
    }
    
    // Para estudantes, assumir que estão na primeira turma
    const currentClass = classesData.data?.[0] || null;

    if (!currentClass) {
      return NextResponse.json({
        currentClass: null,
        availableLists: [],
        classParticipants: []
      });
    }

    // Os dados da turma já vêm completos do backend com o novo formato
    const classParticipants = currentClass.students || [];
    const professorName = currentClass.professor?.name || "Professor";

    const result = {
      currentClass: {
        id: currentClass.id,
        name: currentClass.name,
        professorId: currentClass.professor?.id || null,
        professorName: professorName
      },
      availableLists: [], // TODO: Implementar quando houver API de listas
      classParticipants: classParticipants
    };
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error("Erro ao buscar dados do estudante:", error);
    return NextResponse.json({ 
      error: "Erro interno do servidor ao buscar dados do estudante" 
    }, { status: 500 });
  }
}
