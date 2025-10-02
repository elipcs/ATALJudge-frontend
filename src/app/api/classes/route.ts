import { NextRequest, NextResponse } from "next/server";


// GET /api/turmas - Listar turmas
export async function GET(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    
    const authToken = request.headers.get('authorization');
    

    
    if (!authToken) {
      return NextResponse.json({ error: 'Token de autenticação não fornecido' }, { status: 401 });
    }
    
      const res = await fetch(`${apiUrl}/classes/`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          ...(authToken && { 'Authorization': authToken })
        },
      });
      
      
      const data = await res.json();
      
      // Log removido - problema resolvido
      
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Erro ao buscar turmas');
      }
      
      if (!data.success) {
        throw new Error(data.message || 'Erro ao buscar turmas');
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
            role: 'professor',
            avatar: (classData.professor as Record<string, unknown>).avatar_url || 
                   (classData.professor as Record<string, unknown>).avatar || '/profile-default.svg'
          } : (classData.professor_id ? {
            id: classData.professor_id,
            name: classData.professor_name || 'Professor',
            email: classData.professor_email || '',
            role: 'professor',
            avatar: '/profile-default.svg'
          } : null),
          students: ((classData.students as unknown[]) || []).map((student: unknown) => {
            const studentData = student as Record<string, unknown>;
            return {
              id: studentData.id,
              name: studentData.name,
              email: studentData.email,
              avatar: studentData.avatar_url || studentData.avatar || '/profile-default.svg',
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

// POST /api/turmas - Criar nova turma
export async function POST(request: NextRequest) {
  try {
    const { nome, professor_id } = await request.json();

    if (!nome || !nome.trim()) {
      return NextResponse.json({ error: 'Nome da turma é obrigatório' }, { status: 400 });
    }

    if (!professor_id) {
      return NextResponse.json({ error: 'ID do professor é obrigatório' }, { status: 400 });
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    
    // Get authentication token
    const authToken = request.headers.get('authorization');
    
    const res = await fetch(`${apiUrl}/classes/`, {
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
    
    // Verificar se a resposta tem o formato esperado com success
    if (!data.success) {
      return NextResponse.json({ 
        error: data.message || 'Erro ao criar turma' 
      }, { status: 400 });
    }
    
    // Convert backend response to frontend format
    const newClass = {
      id: data.data.id,
      name: data.data.name,
      professor: data.data.professor ? {
        id: data.data.professor.id,
        name: data.data.professor.name,
        email: data.data.professor.email,
        role: 'professor',
        avatar: data.data.professor.avatar || '/profile-default.svg'
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