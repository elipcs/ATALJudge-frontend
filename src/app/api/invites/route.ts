import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS } from "../../../config/api";

export async function GET(request: NextRequest) {
  try {
    const authToken = request.headers.get('authorization');
    const endpoint = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.ENDPOINTS.INVITES.BASE}`;
    
    if (!authToken) {
      return NextResponse.json({ error: 'Token de autenticação não fornecido' }, { status: 401 });
    }
    
    const res = await fetch(endpoint, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        ...(authToken && { 'Authorization': authToken })
      },
    });

    const data = await res.json();
    
    if (!res.ok) {
      return NextResponse.json({ 
        error: data.message || data.error || 'Erro ao buscar convites' 
      }, { status: res.status });
    }
    
    const invites = data.data.invites.map((invite: {
      id: string;
      role: string;
      token: string;
      created_at: string;
      expires_at: string;
      used: boolean;
      max_uses: number;
      current_uses: number;
      class_id?: string;
      class_name?: string;
      created_by: string;
      creator_name: string;
    }) => ({
      id: invite.id,
      role: invite.role,
      token: invite.token,
      link: `http://localhost:3000/cadastro?token=${invite.token}`,
      createdAt: invite.created_at,
      expiresAt: invite.expires_at,
      used: invite.used,
      maxUses: invite.max_uses,
      currentUses: invite.current_uses,
      classId: invite.class_id,
      className: invite.class_name,
      createdBy: invite.created_by,
      creatorName: invite.creator_name
    }));
    
    return NextResponse.json(invites);

  } catch (error) {
    console.error('Erro ao buscar convites:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authToken = request.headers.get('authorization');
    
    if (!authToken) {
      return NextResponse.json({ error: 'Token de autenticação não fornecido' }, { status: 401 });
    }
    
    const res = await fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.ENDPOINTS.INVITES.CLEANUP}`, {
      method: "DELETE",
      headers: { 
        "Content-Type": "application/json",
        ...(authToken && { 'Authorization': authToken })
      },
    });

    const data = await res.json();
    
    if (!res.ok) {
      return NextResponse.json({ 
        error: data.message || data.error || 'Erro ao limpar convites expirados' 
      }, { status: res.status });
    }
    
    return NextResponse.json({ 
      message: data.message || 'Convites expirados removidos com sucesso',
      deletedCount: data.data?.deleted_count || 0
    });

  } catch (error) {
    console.error('Erro ao limpar convites expirados:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}