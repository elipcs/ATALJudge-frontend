import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS } from "../../../../../config/api";

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

    const authToken = request.headers.get('authorization');

    const res = await fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.ENDPOINTS.CLASSES.STUDENTS(turmaId)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authToken && { 'Authorization': authToken })
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({
        error: data.message || data.error || "Erro ao buscar alunos da turma"
      }, { status: res.status });
    }

    const studentsData = Array.isArray(data.data.students) ? data.data.students : [];

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
        createdAt: studentData.created_at,
      };
    });

    return NextResponse.json(alunosInfo);

  } catch (error) {
    console.error('Erro ao buscar alunos da turma:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
