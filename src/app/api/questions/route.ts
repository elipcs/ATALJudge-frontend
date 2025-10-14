import { NextResponse } from "next/server";
import { API_ENDPOINTS } from "../../../config/api";

export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const tags = searchParams.get('tags');
    const limit = searchParams.get('limit');
    
    const queryParams = new URLSearchParams();
    if (search) queryParams.append('search', search);
    if (tags) queryParams.append('tags', tags);
    if (limit) queryParams.append('limit', limit);
    
    const queryString = queryParams.toString();
    const endpoint = `/api/questions${queryString ? `?${queryString}` : ''}`;
    
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
        error: data.message || data.error || "Erro ao buscar questões" 
      }, { status: res.status });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar questões:', error);
    return NextResponse.json({ 
      error: `Erro interno do servidor: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    console.log('🔍 [API POST /api/questions] Dados recebidos:', body);
    console.log('🔍 [API POST /api/questions] Headers de autorização:', req.headers.get('authorization') ? 'Presente' : 'Ausente');
    
    const res = await fetch(`${API_ENDPOINTS.BASE_URL}/api/questions`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...(req.headers.get('authorization') ? { 'Authorization': req.headers.get('authorization')! } : {})
      },
      body: JSON.stringify(body),
    });
    
    console.log('📦 [API POST /api/questions] Status da resposta:', res.status);
    console.log('📦 [API POST /api/questions] Headers da resposta:', Object.fromEntries(res.headers.entries()));
    
    const data = await res.json();
    console.log('📦 [API POST /api/questions] Dados da resposta:', data);
    
    if (!res.ok) {
      console.error('❌ [API POST /api/questions] Erro do backend:', data);
      return NextResponse.json({ 
        error: data.message || data.error || "Erro ao criar questão" 
      }, { status: res.status });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ [API POST /api/questions] Erro interno:', error);
    return NextResponse.json({ 
      error: `Erro interno do servidor: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
    }, { status: 500 });
  }
}
