import { NextResponse } from "next/server";
import { API_ENDPOINTS } from "../../../../config/api";

export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const includeQuestions = searchParams.get('include_questions');
    const includeGroups = searchParams.get('include_groups');

    const queryParams = new URLSearchParams();
    if (includeQuestions) queryParams.append('include_questions', includeQuestions);
    if (includeGroups) queryParams.append('include_groups', includeGroups);

    const queryString = queryParams.toString();
    const endpoint = `/api/lists/${id}${queryString ? `?${queryString}` : ''}`;

    const res = await fetch(`${API_ENDPOINTS.BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(req.headers.get('authorization') ? { 'Authorization': req.headers.get('authorization')! } : {})
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({
        error: data.message || data.error || "Erro ao buscar lista"
      }, { status: res.status });
    }

    let list = data?.data?.list || data?.list;
    return NextResponse.json({ list });
  } catch (error) {
    console.error('Erro ao buscar lista:', error);
    return NextResponse.json({
      error: `Erro interno do servidor: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const res = await fetch(`${API_ENDPOINTS.BASE_URL}/api/lists/${id}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        ...(req.headers.get('authorization') ? { 'Authorization': req.headers.get('authorization')! } : {})
      },
      body: JSON.stringify(body),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      return NextResponse.json({ 
        error: data.message || data.error || "Erro ao atualizar lista" 
      }, { status: res.status });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao atualizar lista:', error);
    return NextResponse.json({ 
      error: `Erro interno do servidor: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
    }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const res = await fetch(`${API_ENDPOINTS.BASE_URL}/api/lists/${id}`, {
      method: "DELETE",
      headers: { 
        "Content-Type": "application/json",
        ...(req.headers.get('authorization') ? { 'Authorization': req.headers.get('authorization')! } : {})
      },
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      return NextResponse.json({ 
        error: data.message || data.error || "Erro ao deletar lista" 
      }, { status: res.status });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao deletar lista:', error);
    return NextResponse.json({ 
      error: `Erro interno do servidor: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
    }, { status: 500 });
  }
}
