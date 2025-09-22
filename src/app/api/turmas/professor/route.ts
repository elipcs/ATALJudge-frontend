import { NextRequest, NextResponse } from "next/server";
import classes from "@/mocks/classes.json";
import users from "@/mocks/users.json";
import students from "@/mocks/students.json";

// GET /api/turmas/professor - Listar turmas do professor logado
export async function GET(request: NextRequest) {
  try {
    // Para este mock, vamos simular que o professor com ID "6500000000000000002001" (Melina) está logado
    // Em um cenário real, você obteria o ID do professor do token de autenticação
    const professorId = "6500000000000000002001";

    // Buscar turmas do professor
    const turmasDoProf = classes.filter(t => t.teacher_id.$oid === professorId);
    
    // Buscar informações completas para cada turma
    const turmasWithInfo = turmasDoProf.map(turma => {
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
    console.error('Erro ao buscar turmas do professor:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
