import { NextRequest, NextResponse } from "next/server";
import inviteTokens from "@/mocks/invite_tokens.json";
import classes from "@/mocks/classes.json";
import users from "@/mocks/users.json";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 400 });
    }

    // Buscar token nos mocks
    const tokenData = inviteTokens.find(t => t.token === token);

    if (!tokenData) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Token não encontrado' 
      }, { status: 404 });
    }

    // Verificar se token expirou
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);
    
    if (now > expiresAt) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Token expirado' 
      }, { status: 410 });
    }

    // Verificar se token foi usado e atingiu limite
    if (tokenData.used && tokenData.current_uses >= tokenData.max_uses) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Token já utilizado em sua capacidade máxima' 
      }, { status: 410 });
    }

    // Buscar dados adicionais se necessário
    let classData = null;
    let creatorData = null;

    if (tokenData.class_id) {
      classData = classes.find(c => c._id.$oid === tokenData.class_id.$oid);
    }

    if (tokenData.created_by) {
      creatorData = users.find(u => u._id.$oid === tokenData.created_by.$oid);
    }

    return NextResponse.json({
      valid: true,
      data: {
        _id: tokenData._id,
        type: tokenData.type,
        token: tokenData.token,
        expires_at: tokenData.expires_at,
        max_uses: tokenData.max_uses,
        current_uses: tokenData.current_uses,
        class_id: tokenData.class_id,
        class_name: tokenData.class_name || classData?.name,
        created_by: tokenData.created_by,
        creator_name: creatorData?.name
      }
    });

  } catch (error) {
    console.error('Erro ao validar token:', error);
    return NextResponse.json({ 
      valid: false, 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
