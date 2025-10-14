import { NextResponse } from "next/server";
import { API_ENDPOINTS } from "../../../../../config/api";

export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const res = await fetch(`${API_ENDPOINTS.BASE_URL}/api/lists/${id}/questions`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        ...(req.headers.get('authorization') ? { 'Authorization': req.headers.get('authorization')! } : {})
      },
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      return NextResponse.json({ 
        error: data.message || data.error || "Erro ao buscar questões da lista" 
      }, { status: res.status });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar questões da lista:', error);
    return NextResponse.json({ 
      error: `Erro interno do servidor: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
    }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    console.log('🔍 [API POST /api/lists/{id}/questions] Adicionando questão à lista:', { listId: id, body });
    
    const res = await fetch(`${API_ENDPOINTS.BASE_URL}/api/lists/${id}/questions`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...(req.headers.get('authorization') ? { 'Authorization': req.headers.get('authorization')! } : {})
      },
      body: JSON.stringify(body),
    });
    
    console.log('📦 [API POST /api/lists/{id}/questions] Status da resposta:', res.status);
    
    const data = await res.json();
    console.log('📦 [API POST /api/lists/{id}/questions] Dados da resposta:', data);
    
    if (!res.ok) {
      console.error('❌ [API POST /api/lists/{id}/questions] Erro do backend:', data);
      return NextResponse.json({ 
        error: data.message || data.error || "Erro ao adicionar questão à lista" 
      }, { status: res.status });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ [API POST /api/lists/{id}/questions] Erro interno:', error);
    return NextResponse.json({ 
      error: `Erro interno do servidor: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
    }, { status: 500 });
  }
}