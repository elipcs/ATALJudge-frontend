import { NextRequest, NextResponse } from "next/server";


// GET /api/turmas/[id] - Buscar turma específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classId } = await params;

    if (!classId) {
      return NextResponse.json({ error: 'ID da turma não fornecido' }, { status: 400 });
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    
    // Get authentication token
    const authToken = request.headers.get('authorization');
    
    if (!authToken) {
      return NextResponse.json({ error: 'Token de autenticação não fornecido' }, { status: 401 });
    }
    
      // Buscar turma específica no backend
      const res = await fetch(`${apiUrl}/classes/${classId}/`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          ...(authToken && { 'Authorization': authToken })
        },
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Erro ao buscar turma');
      }
      
      if (!data.success) {
        throw new Error(data.message || 'Erro ao buscar turma');
      }
      
      const classWithInfo = {
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

      return NextResponse.json(classWithInfo);

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
    const { id: classId } = await params;
    const body = await request.json();

    if (!classId) {
      return NextResponse.json({ error: 'ID da turma não fornecido' }, { status: 400 });
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    
    const authToken = request.headers.get('authorization');
    
    if (!authToken) {
      return NextResponse.json({ error: 'Token de autenticação não fornecido' }, { status: 401 });
    }
    
    const res = await fetch(`${apiUrl}/classes/${classId}/`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        ...(authToken && { 'Authorization': authToken })
      },
      body: JSON.stringify(body),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      return NextResponse.json({ 
        error: data.message || data.error || 'Erro ao atualizar turma' 
      }, { status: res.status });
    }
    
    // Verificar se a resposta tem o formato esperado com success
    if (!data.success) {
      return NextResponse.json({ 
        error: data.message || 'Erro ao atualizar turma' 
      }, { status: 400 });
    }
    
    // Convert backend response to frontend format
    const updatedClass = {
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

    return NextResponse.json(updatedClass);

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
    const { id: classId } = await params;

    if (!classId) {
      return NextResponse.json({ error: 'ID da turma não fornecido' }, { status: 400 });
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    
    // Get authentication token
    const authToken = request.headers.get('authorization');
    
    if (!authToken) {
      return NextResponse.json({ error: 'Token de autenticação não fornecido' }, { status: 401 });
    }
    
    // Excluir turma no backend
    const res = await fetch(`${apiUrl}/classes/${classId}/`, {
      method: "DELETE",
      headers: { 
        "Content-Type": "application/json",
        ...(authToken && { 'Authorization': authToken })
      },
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      return NextResponse.json({ 
        error: data.message || data.error || 'Erro ao excluir turma' 
      }, { status: res.status });
    }
    
    // Verificar se a resposta tem o formato esperado com success
    if (!data.success) {
      return NextResponse.json({ 
        error: data.message || 'Erro ao excluir turma' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Turma excluída com sucesso',
      classId: classId 
    });

  } catch (error) {
    console.error('Erro ao excluir turma:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
