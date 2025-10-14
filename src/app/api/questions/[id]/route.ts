import { NextResponse } from "next/server";
import { API_ENDPOINTS } from "../../../../config/api";

export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const res = await fetch(`${API_ENDPOINTS.BASE_URL}/api/questions/${id}`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        ...(req.headers.get('authorization') ? { 'Authorization': req.headers.get('authorization')! } : {})
      },
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      return NextResponse.json({ 
        error: data.message || data.error || "Erro ao buscar questão" 
      }, { status: res.status });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar questão:', error);
    return NextResponse.json({ 
      error: `Erro interno do servidor: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
    }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const res = await fetch(`${API_ENDPOINTS.BASE_URL}/api/questions/${id}`, {
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
        error: data.message || data.error || "Erro ao atualizar questão" 
      }, { status: res.status });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao atualizar questão:', error);
    return NextResponse.json({ 
      error: `Erro interno do servidor: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
    }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const res = await fetch(`${API_ENDPOINTS.BASE_URL}/api/questions/${id}`, {
      method: "DELETE",
      headers: { 
        "Content-Type": "application/json",
        ...(req.headers.get('authorization') ? { 'Authorization': req.headers.get('authorization')! } : {})
      },
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      return NextResponse.json({ 
        error: data.message || data.error || "Erro ao excluir questão" 
      }, { status: res.status });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao excluir questão:', error);
    return NextResponse.json({ 
      error: `Erro interno do servidor: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
    }, { status: 500 });
  }
}

