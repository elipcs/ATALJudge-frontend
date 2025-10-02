import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    
    // Get authentication token
    const authToken = request.headers.get('authorization');
    
    // Build query params if they exist
    const url = new URL(request.url);
    const queryParams = new URLSearchParams();
    
    // Add filters if they exist
    const filters = ['role', 'used', 'class_id', 'created_by'];
    filters.forEach(filter => {
      const value = url.searchParams.get(filter);
      if (value) {
        queryParams.append(filter, value);
      }
    });
    
    const queryString = queryParams.toString();
    const endpoint = `${apiUrl}/invites/${queryString ? `?${queryString}` : ''}`;
    
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
    
    // Verificar se a resposta tem o formato esperado com success
    if (!data.success) {
      return NextResponse.json({ 
        error: data.message || 'Erro ao buscar convites' 
      }, { status: 400 });
    }
    
    // Converter resposta do backend para formato esperado pelo frontend
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
