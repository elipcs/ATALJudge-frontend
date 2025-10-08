import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS } from "../../../../config/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {

    const { id: classId } = await params;
    const authToken = request.headers.get('authorization');
    const res = await fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.ENDPOINTS.CLASSES.BY_ID(classId)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authToken && { 'Authorization': authToken })
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({
        error: data.message || data.error || "Erro ao buscar turma"
      }, { status: res.status });
    }

    const classWithInfo = {
      id: data.data.id,
      name: data.data.name,
      professor: data.data.professor,
      students: data.data.students,
      studentCount: data.data.student_count,
      createdAt: data.data.created_at,
      updatedAt: data.data.updated_at
    };

    return NextResponse.json(classWithInfo);

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
    const res = await fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.ENDPOINTS.CLASSES.UPDATE(classId)}`, {
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

    const updatedClass = {
      id: data.data.id,
      name: data.data.name,
      professor: data.data.professor,
      students: data.data.students,
      studentCount: data.data.student_count,
      createdAt: data.data.created_at,
      updatedAt: data.data.updated_at
    };
    
    return NextResponse.json(updatedClass);

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
    const res = await fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.ENDPOINTS.CLASSES.DELETE(classId)}`, {
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
