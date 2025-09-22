import { NextRequest, NextResponse } from "next/server";
import classes from "@/mocks/classes.json";
import users from "@/mocks/users.json";
import students from "@/mocks/students.json";

// GET /api/turmas - Listar turmas
export async function GET(request: NextRequest) {
  try {
    // Buscar todas as turmas com informações de professor e alunos
    const turmasWithInfo = classes.map(turma => {
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

      return {
        _id: turma._id,
        name: turma.name,
        teacher_id: turma.teacher_id,
        teacher_name: professor?.name || 'Professor não encontrado',
        created_at: turma.created_at,
        students: alunosInfo,
        students_count: alunosInfo.length
      };
    });

    return NextResponse.json(turmasWithInfo);

  } catch (error) {
    console.error('Erro ao buscar turmas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST /api/turmas - Criar nova turma
export async function POST(request: NextRequest) {
  try {
    const { nome, teacher_id } = await request.json();

    if (!nome || !nome.trim()) {
      return NextResponse.json({ error: 'Nome da turma é obrigatório' }, { status: 400 });
    }

    if (!teacher_id) {
      return NextResponse.json({ error: 'ID do professor é obrigatório' }, { status: 400 });
    }

    // Verificar se professor existe
    const professor = users.find(u => u._id.$oid === teacher_id && u.role === 'teacher');
    if (!professor) {
      return NextResponse.json({ error: 'Professor não encontrado' }, { status: 404 });
    }

    // Gerar novo ID para a turma
    const newTurmaId = `65000000000000000030${String(classes.length + 1).padStart(2, '0')}`;

    const novaTurma = {
      _id: { $oid: newTurmaId },
      name: nome.trim(),
      teacher_id: { $oid: teacher_id },
      created_at: new Date().toISOString(),
      students: []
    };

    // Em um cenário real, você salvaria no banco de dados aqui
    // Para este mock, retornamos a turma criada

    return NextResponse.json({
      ...novaTurma,
      teacher_name: professor.name,
      students_count: 0
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar turma:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}