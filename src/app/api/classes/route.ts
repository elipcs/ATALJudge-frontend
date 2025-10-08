import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS } from "../../../config/api";

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET(request: NextRequest) {
  try {
     const authHeader = request.headers.get('authorization');

     if (!authHeader || !authHeader.startsWith('Bearer ')) {
       return NextResponse.json({ error: "Token de autenticação não fornecido" }, { status: 401 });
     }

      const res = await fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.ENDPOINTS.CLASSES.BASE}`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": authHeader
        },
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || data.msg || data.error || 'Erro ao buscar turmas');
      }
      
      const classes = data.data.map((cls: unknown) => {
        const classData = cls as Record<string, unknown>;
        
        const processedClass = {
          id: classData.id,
          name: classData.name,
          professor: classData.professor ? {
            id: (classData.professor as Record<string, unknown>).id,
            name: (classData.professor as Record<string, unknown>).name,
            email: (classData.professor as Record<string, unknown>).email,
            role: 'professor'
          } : (classData.professor_id ? {
            id: classData.professor_id,
            name: classData.professor_name || 'Professor',
            email: classData.professor_email || '',
            role: 'professor'
          } : null),
          students: ((classData.students as unknown[]) || []).map((student: unknown) => {
            const studentData = student as Record<string, unknown>;
            return {
              id: studentData.id,
              name: studentData.name,
              email: studentData.email,
              studentRegistration: studentData.student_registration,
              role: 'student',
              classId: classData.id,
              grades: studentData.grades || [],
              created_at: studentData.created_at
            };
          }),
          student_count: classData.student_count || (classData.students as unknown[])?.length || 0,
          created_at: classData.created_at,
          updated_at: classData.updated_at
        };
        
        return processedClass;
      });
      
      return NextResponse.json(classes);

  } catch (error) {
    console.error('Erro ao buscar turmas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
}
}

export async function POST(request: NextRequest) {
  try {
    const { nome, professor_id } = await request.json();

    if (!nome || !nome.trim()) {
      return NextResponse.json({ error: 'Nome da turma é obrigatório' }, { status: 400 });
    }

    if (!professor_id) {
      return NextResponse.json({ error: 'ID do professor é obrigatório' }, { status: 400 });
    }

    const authToken = request.headers.get('authorization');
    
    const res = await fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.ENDPOINTS.CLASSES.CREATE}`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...(authToken && { 'Authorization': authToken })
      },
      body: JSON.stringify({
        name: nome.trim(),
        professor_id: professor_id
      }),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      return NextResponse.json({ 
        error: data.message || data.error || 'Erro ao criar turma' 
      }, { status: res.status });
    }
    
    const newClass = {
      id: data.data.id,
      name: data.data.name,
      professor: data.data.professor ? {
        id: data.data.professor.id,
        name: data.data.professor.name,
        email: data.data.professor.email,
        role: 'professor'
      } : null,
      students: data.data.students || [],
      student_count: data.data.student_count || 0,
      created_at: data.data.created_at,
      updated_at: data.data.updated_at
    };

    return NextResponse.json(newClass, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar turma:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
}
}