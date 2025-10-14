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
    let authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (authHeader) {
      const match = authHeader.match(/^Bearer(.+)$/i);
      if (match) {
        authHeader = `Bearer ${match[1]}`;
      }
    }
     const hasBearer = authHeader ? /^[Bb]earer\s+/.test(authHeader) : false;
     if (!authHeader || !hasBearer) {
       return NextResponse.json({ error: "Token de autenticação não fornecido" }, { status: 401 });
     }
     const token = authHeader.replace(/^[Bb]earer\s+/, '');

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
      
      const classesArray = data.data?.classes || data.data || [];
      const classes = classesArray.map((cls: unknown) => {
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
  const token = authToken ? authToken.replace(/^[Bb]earer\s+/, '') : '';
    
    const res = await fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.ENDPOINTS.CLASSES.CREATE}`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...(authToken && { 'authorization': `Bearer ${token}` })
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
    
    const classData = data.data?.class || data.data;
    
    const newClass = {
      id: classData.id,
      name: classData.name,
      professor: classData.professor ? {
        id: classData.professor.id,
        name: classData.professor.name,
        email: classData.professor.email,
        role: 'professor'
      } : null,
      students: classData.students || [],
      student_count: classData.student_count || 0,
      created_at: classData.created_at,
      updated_at: classData.updated_at
    };

    return NextResponse.json({ class: newClass }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar turma:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
}
}