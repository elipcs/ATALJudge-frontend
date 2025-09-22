import { NextRequest, NextResponse } from "next/server";
import inviteTokens from "@/mocks/invite_tokens.json";
import classes from "@/mocks/classes.json";

export async function POST(request: NextRequest) {
  try {
    const { tipo, turmaId, maxUsos = 1, diasExpiracao = 7 } = await request.json();

    // Validações básicas
    if (!tipo || !['student', 'monitor', 'professor'].includes(tipo)) {
      return NextResponse.json({ error: 'Tipo inválido. Use: student, monitor, professor' }, { status: 400 });
    }

    if (tipo === 'student' && !turmaId) {
      return NextResponse.json({ error: 'Turma ID obrigatório para alunos' }, { status: 400 });
    }

    // Verificar se turma existe (se fornecida)
    let turma = null;
    if (turmaId) {
      turma = classes.find(t => t._id.$oid === turmaId);
      if (!turma) {
        return NextResponse.json({ error: 'Turma não encontrada' }, { status: 404 });
      }
    }

    // Gerar token único
    const token = generateUniqueToken();
    
    // Calcular data de expiração
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (diasExpiracao * 24 * 60 * 60 * 1000));

    // Para este mock, vamos simular que o professor com ID "6500000000000000002001" está logado
    const createdBy = "6500000000000000002001";

    // Criar novo convite
    const newInviteId = `65120000000000000080${String(inviteTokens.length + 1).padStart(3, '0')}`;
    
    const novoConvite = {
      _id: { $oid: newInviteId },
      type: tipo,
      token: token,
      link: `http://localhost:3000/cadastro?token=${token}`,
      created_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      used: false,
      max_uses: maxUsos,
      current_uses: 0,
      ...(turmaId && {
        class_id: { $oid: turmaId },
        class_name: turma?.name
      }),
      created_by: { $oid: createdBy }
    };

    // Em um cenário real, você salvaria no banco de dados aqui
    
    return NextResponse.json({
      _id: novoConvite._id,
      token: novoConvite.token,
      link: novoConvite.link,
      type: novoConvite.type,
      expires_at: novoConvite.expires_at,
      max_uses: novoConvite.max_uses,
      ...(turmaId && {
        class_id: novoConvite.class_id,
        class_name: novoConvite.class_name
      })
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao gerar convite:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

function generateUniqueToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 12; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}