import { NextRequest, NextResponse } from "next/server";

import { getMockData } from '../../../../../services/mockData';

// GET /api/turmas/[id]/alunos - Listar alunos de uma turma específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: turmaId } = await params;

    if (!turmaId) {
      return NextResponse.json({ error: 'ID da turma não fornecido' }, { status: 400 });
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    
    // Get authentication token
    const authToken = request.headers.get('authorization');
    
    if (!authToken) {
      return NextResponse.json({ error: 'Token de autenticação não fornecido' }, { status: 401 });
    }
    
    try {
      // Buscar alunos da turma no backend
      const res = await fetch(`${apiUrl}/classes/${turmaId}/students/`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          ...(authToken && { 'Authorization': authToken })
        },
      });
      
      const data = await res.json();
      
      // Log removido - problema resolvido
      
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Erro ao buscar alunos da turma');
      }
      
      // Verificar se a resposta tem o formato esperado com success
      if (!data.success) {
        throw new Error(data.message || 'Erro ao buscar alunos da turma');
      }
      
      
      // Ensure data.data.students is an array
      const studentsData = Array.isArray(data.data.students) ? data.data.students : [];
      
      // Log removido - problema resolvido
      
      // Convert backend response to frontend format
      const alunosInfo = studentsData.map((student: unknown) => {
        const studentData = student as Record<string, unknown>;
        
        return {
          id: studentData.id,
          studentRegistration: studentData.student_registration,
          name: studentData.name,
          email: studentData.email,
          avatar: studentData.avatar_url || studentData.avatar || '/profile-default.svg',
          role: 'student',
          classId: turmaId,
          grades: studentData.grades || [],
          created_at: studentData.created_at,
        };
      });

      return NextResponse.json(alunosInfo);
      
    } catch (fetchError) {
      console.warn('Backend não disponível, usando dados mockados para alunos:', fetchError);
      
      // Fallback para dados mockados quando o backend não estiver disponível
      const mockClasses = getMockData.classes() || [];
      const mockClass = mockClasses.find((cls: unknown) => {
        const classData = cls as Record<string, unknown>;
        return classData.id === turmaId;
      });
      
      if (!mockClass) {
        return NextResponse.json([]);
      }
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 200));
      return NextResponse.json(mockClass.students || []);
    }

  } catch (error) {
    console.error('Erro ao buscar alunos da turma:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
