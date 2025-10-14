import { NextResponse } from "next/server";
import { API_ENDPOINTS } from "../../../config/api";

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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const classId = searchParams.get('classId');
    const status = searchParams.get('status');
    const userRole = searchParams.get('userRole');
    
    const queryParams = new URLSearchParams();
    if (search) queryParams.append('search', search);
    if (classId) queryParams.append('classId', classId);
    if (status) queryParams.append('status', status);
    if (userRole) queryParams.append('userRole', userRole);
    
    const queryString = queryParams.toString();
    const endpoint = `/api/lists${queryString ? `?${queryString}` : ''}`;
    
    let authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    if (authHeader) {
      const match = authHeader.match(/^Bearer(.+)$/i);
      if (match) {
        authHeader = `Bearer ${match[1]}`;
      }
    }
    const token = authHeader ? authHeader.replace(/^[Bb]earer\s+/, '') : '';
    const res = await fetch(`${API_ENDPOINTS.BASE_URL}${endpoint}`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        ...(authHeader ? { 'Authorization': authHeader } : {})
      },
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      return NextResponse.json({ 
        error: data.message || data.error || "Erro ao buscar listas" 
      }, { status: res.status });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar listas:', error);
    return NextResponse.json({ 
      error: `Erro interno do servidor: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const authHeader = req.headers.get('authorization');
    const token = authHeader ? authHeader.replace(/^[Bb]earer\s+/, '') : '';
    const res = await fetch(`${API_ENDPOINTS.BASE_URL}/api/lists`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...(authHeader ? { 'authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(body),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      return NextResponse.json({ 
        error: data.message || data.error || "Erro ao criar lista" 
      }, { status: res.status });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao criar lista:', error);
    return NextResponse.json({ 
      error: `Erro interno do servidor: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
    }, { status: 500 });
  }
}
