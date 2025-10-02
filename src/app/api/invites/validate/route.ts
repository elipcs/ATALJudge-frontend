import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 400 });
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    
    const res = await fetch(`${apiUrl}/invites/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    
    const data = await res.json();
        
    if (!res.ok) {
      return NextResponse.json({ 
        valid: false, 
        error: data.message || data.error || 'Erro ao validar token' 
      }, { status: res.status });
    }
    
    if (!data.success) {
      return NextResponse.json({ 
        valid: false, 
        error: data.message || 'Erro ao validar token' 
      }, { status: 400 });
    }
    
    const inviteInfo = data.data.invite_info;
    
    const responseData = {
      role: inviteInfo.role,
      token: token,
      expires_at: inviteInfo.expires_at,
      max_uses: inviteInfo.max_uses,
      current_uses: inviteInfo.current_uses,
      class_id: inviteInfo.class_id,
      class_name: inviteInfo.class_name,
      created_by: inviteInfo.creator_name,
      creator_name: inviteInfo.creator_name
    };
        
    return NextResponse.json({
      valid: true,
      data: responseData
    });

  } catch (error) {
    console.error('Erro ao validar token:', error);
    return NextResponse.json({ 
      valid: false, 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
