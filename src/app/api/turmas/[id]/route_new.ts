import { NextRequest, NextResponse } from "next/server";
import classes from "@/mocks/classes.json";
import users from "@/mocks/users.json";
import students from "@/mocks/students.json";

// GET /api/turmas/[id] - Buscar turma específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: turmaId } = await params;

    if (!turmaId) {
      return NextResponse.json({ error: 'ID da turma não fornecido' }, { status: 400 });
    }

    // Buscar turma por ID
    const turma = classes.find(t => t._id.$oid === turmaId);
    if (!turma) {
      return NextResponse.json({ error: 'Turma não encontrada' }, { status: 404 });
    }

    // Buscar professor
    const professor = users.find(u => u._id.$oid === turma.teacher_id.$oid);
    
    // Buscar alunos da turma
    const alunosDaTurma = students.filter(s => s.class_id.$oid === turma._id.$oid);
    
    // Buscar dados dos usuários alunos
    const alunosInfo = alunosDaTurma.map(student => {
      const usuario = users.find(u => u._id.$oid === student.user_id.$oid);
      return {
        _id: student._id,
        user_id: student.user_id,
        studentID: student.studentID,
        name: usuario?.name || 'Nome não encontrado',
        email: usuario?.email || 'Email não encontrado',
        grades: student.grades,
        created_at: student.created_at,
        active: student.active
      };
    });

    const turmaWithInfo = {
      _id: turma._id,
      name: turma.name,
      teacher_id: turma.teacher_id,
      teacher_name: professor?.name || 'Professor não encontrado',
      created_at: turma.created_at,
      students: alunosInfo,
      students_count: alunosInfo.length
    };

    return NextResponse.json(turmaWithInfo);

  } catch (error) {
    console.error('Erro ao buscar turma:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT /api/turmas/[id] - Atualizar turma (ativar/desativar, renomear)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: turmaId } = await params;
    const body = await request.json();

    if (!turmaId) {
      return NextResponse.json({ error: 'ID da turma não fornecido' }, { status: 400 });
    }

    // Buscar turma por ID
    const turma = classes.find(t => t._id.$oid === turmaId);
    if (!turma) {
      return NextResponse.json({ error: 'Turma não encontrada' }, { status: 404 });
    }

    // Em um cenário real, você atualizaria no banco de dados aqui
    // Para este mock, retornamos a turma "atualizada"
    const turmaAtualizada = {
      ...turma,
      ...body,
      _id: turma._id, // Manter o ID original
      teacher_id: turma.teacher_id // Manter o teacher_id original
    };

    return NextResponse.json(turmaAtualizada);

  } catch (error) {
    console.error('Erro ao atualizar turma:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE /api/turmas/[id] - Excluir turma
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: turmaId } = await params;

    if (!turmaId) {
      return NextResponse.json({ error: 'ID da turma não fornecido' }, { status: 400 });
    }

    // Buscar turma por ID
    const turma = classes.find(t => t._id.$oid === turmaId);
    if (!turma) {
      return NextResponse.json({ error: 'Turma não encontrada' }, { status: 404 });
    }

    // Em um cenário real, você excluiria do banco de dados aqui
    // Para este mock, retornamos sucesso simulado
    return NextResponse.json({ 
      success: true, 
      message: 'Turma excluída com sucesso',
      turmaId: turmaId 
    });

  } catch (error) {
    console.error('Erro ao excluir turma:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}