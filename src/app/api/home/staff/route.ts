import { NextRequest, NextResponse } from "next/server";

import { Student, Submission } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    
    // Get authentication token
    const authToken = request.headers.get('authorization');
    
    if (!authToken) {
      return NextResponse.json({ error: 'Token de autenticação não fornecido' }, { status: 401 });
    }
        
    // Buscar turmas gerenciadas
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
    
    const classes = classesData.data || [];

    // Buscar todos os estudantes das turmas
    const allStudents: Student[] = [];
    for (const classObj of classes) {
      if (classObj.students) {
        allStudents.push(...classObj.students);
      }
    }

    // Buscar submissões recentes (se houver endpoint)
    let submissions: Submission[] = [];
    try {
      const submissionsResponse = await fetch(`${apiUrl}/submissions`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": authToken
        },
      });
      
      if (submissionsResponse.ok) {
        const submissionsData = await submissionsResponse.json();
        submissions = submissionsData.data || [];
      }
    } catch (submissionError) {
      console.warn('Erro ao buscar submissões:', submissionError);
    }

    const result = {
      classes: classes,
      students: allStudents,
      submissions: submissions,
      systemNotices: [] // TODO: Implementar quando houver API de avisos
    };
        
    return NextResponse.json(result);
    
  } catch (error) {
    console.error("Erro ao buscar dados do staff:", error);
    return NextResponse.json({ 
      error: "Erro interno do servidor ao buscar dados do staff" 
    }, { status: 500 });
  }
}
