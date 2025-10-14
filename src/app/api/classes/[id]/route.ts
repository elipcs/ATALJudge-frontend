import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS } from "../../../../config/api";

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {

    const { id: classId } = await params;
  const authToken = request.headers.get('authorization');
  const token = authToken ? authToken.replace(/^[Bb]earer\s+/, '') : '';
    const res = await fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.ENDPOINTS.CLASSES.BY_ID(classId)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authToken && { 'authorization': `Bearer ${token}` })
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({
        error: data.message || data.error || "Erro ao buscar turma"
      }, { status: res.status });
    }

    const classData = data.data?.class || data.data;
    
    const classWithInfo = {
      id: classData.id,
      name: classData.name,
      professor: classData.professor,
      students: classData.students,
      student_count: classData.student_count,
      created_at: classData.created_at,
      updated_at: classData.updated_at
    };

    return NextResponse.json({ class: classWithInfo });

  } catch (error) {
    console.error('Erro ao buscar turma:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: classId } = await params;
    const body = await request.json();

  const authToken = request.headers.get('authorization');
  const token = authToken ? authToken.replace(/^[Bb]earer\s+/, '') : '';
    const res = await fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.ENDPOINTS.CLASSES.UPDATE(classId)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(authToken && { 'authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({
        error: data.message || data.error || 'Erro ao atualizar turma'
      }, { status: res.status });
    }

    const classData = data.data?.class || data.data;
    
    const updatedClass = {
      id: classData.id,
      name: classData.name,
      professor: classData.professor,
      students: classData.students,
      student_count: classData.student_count,
      created_at: classData.created_at,
      updated_at: classData.updated_at
    };
    
    return NextResponse.json({ class: updatedClass });

  } catch (error) {
    console.error('Erro ao atualizar turma:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classId } = await params;
  const authToken = request.headers.get('authorization');
  const token = authToken ? authToken.replace(/^[Bb]earer\s+/, '') : '';
    const res = await fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.ENDPOINTS.CLASSES.DELETE(classId)}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(authToken && { 'authorization': `Bearer ${token}` })
      },
    });
    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({
        error: data.message || data.error || 'Erro ao excluir turma'
      }, { status: res.status });
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
