import { NextRequest, NextResponse } from "next/server";
import classes from "@/mocks/classes.json";
import users from "@/mocks/users.json";
import students from "@/mocks/students.json";

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

    // Verificar se turma existe
    const turma = classes.find(t => t._id.$oid === turmaId);
    if (!turma) {
      return NextResponse.json({ error: 'Turma não encontrada' }, { status: 404 });
    }

    // Buscar alunos da turma
    const alunosDaTurma = students.filter(s => s.class_id.$oid === turmaId);
    
    // Buscar dados dos usuários alunos
    const alunosInfo = alunosDaTurma.map(student => {
      const usuario = users.find(u => u._id.$oid === student.user_id.$oid);
      return {
        _id: student._id,
        user_id: student.user_id,
        studentID: student.studentID,
        name: usuario?.name || 'Nome não encontrado',
        email: usuario?.email || 'Email não encontrado',
        avatar: usuario?.avatar || '/profile-default.svg',
        grades: student.grades,
        created_at: student.created_at,
        active: student.active
      };
    });

    return NextResponse.json({
      turma: {
        _id: turma._id,
        name: turma.name,
        teacher_id: turma.teacher_id
      },
      alunos: alunosInfo,
      total: alunosInfo.length
    });

  } catch (error) {
    console.error('Erro ao buscar alunos da turma:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
