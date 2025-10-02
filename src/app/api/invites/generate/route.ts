import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    
    const authToken = request.headers.get('authorization');
    
    let userId = "";
    let userName = ""; 
    
    if (authToken) {
      try {
        const tokenPayload = JSON.parse(atob(authToken.split('.')[1]));
        userId = tokenPayload.sub || tokenPayload.user_id;
        userName = tokenPayload.name || tokenPayload.user_name;
      } catch (error) {
        console.warn('Erro ao decodificar token JWT, usando valores padrão:', error);
      }
    }

    const inviteData = {
      id: body.id,
      role: body.role,
      created_by: body.createdBy || userId,
      creator_name: body.creatorName || userName,
      max_uses: body.maxUses || 1,
      ...(body.classId && {
        class_id: body.classId,
        class_name: body.className
      })
    };
    
    const res = await fetch(`${apiUrl}/invites/generate`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...(authToken && { 'Authorization': authToken })
      },
      body: JSON.stringify({
        ...inviteData,
        expires_days: body.expirationDays || 30
      }),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      return NextResponse.json({ 
        error: data.message || data.error || 'Erro ao gerar convite' 
      }, { status: res.status });
    }
    
    if (!data.success) {
      return NextResponse.json({ 
        error: data.message || 'Erro ao gerar convite' 
      }, { status: 400 });
    }
    
    const invite = data.data.invite;
    return NextResponse.json({
      id: invite.id,
      token: invite.token,
      link: `http://localhost:3000/cadastro?token=${invite.token}`,
      role: invite.role,
      expiresAt: invite.expires_at,
      maxUses: invite.max_uses,
      currentUses: invite.current_uses || 0,
      used: invite.used || false,
      createdAt: invite.created_at,
      ...(invite.class_id && {
        classId: invite.class_id,
        className: invite.class_name
      })
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao gerar convite:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}