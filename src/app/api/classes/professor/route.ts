import { NextRequest, NextResponse } from "next/server";

import { Class } from "@/types";

// GET /api/turmas/professor - Listar turmas do professor logado
export async function GET(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    
    // Get authentication token
    const authToken = request.headers.get('authorization');
    
    if (!authToken) {
      return NextResponse.json({ error: 'Token de autenticação não fornecido' }, { status: 401 });
    }
    
    // Buscar turmas do professor no backend
    const res = await fetch(`${apiUrl}/classes/professor/`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        ...(authToken && { 'Authorization': authToken })
      },
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      return NextResponse.json({ 
        error: data.message || data.error || 'Erro ao buscar turmas do professor' 
      }, { status: res.status });
    }
    
    // Verificar se a resposta tem o formato esperado com success
    if (!data.success) {
      return NextResponse.json({ 
        error: data.message || 'Erro ao buscar turmas do professor' 
      }, { status: 400 });
    }
    
    // Convert backend response to frontend format
    const classes = data.data.map((cls: Class) => ({
      id: cls.id,
      name: cls.name,
      professor: cls.professor ? {
        id: cls.professor.id,
        name: cls.professor.name,
        email: cls.professor.email,
        role: 'professor',
        avatar: cls.professor.avatar || '/profile-default.svg'
      } : null,
      students: cls.students || [],
      student_count: cls.student_count || 0,
      created_at: cls.created_at,
      updated_at: cls.updated_at
    }));

    return NextResponse.json(classes);

  } catch (error) {
    console.error('Erro ao buscar turmas do professor:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
