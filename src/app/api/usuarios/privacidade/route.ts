import { NextRequest, NextResponse } from 'next/server';

// Simulação de diferentes tipos de usuários logados
function getCurrentUserId(tipo: 'professor' | 'aluno' | 'monitor' = 'professor'): string {
  const usersByType = {
    professor: "6500000000000000002001", // Melina Mongiovi
    aluno: "6500000000000000001001",     // João da Silva
    monitor: "6500000000000000003001"    // Bob Monitor
  };
  
  return usersByType[tipo];
}

export async function GET(request: NextRequest) {
  try {
    // Permite trocar o tipo via query parameter para teste
    const { searchParams } = new URL(request.url);
    const tipoUsuario = searchParams.get('tipo') as 'professor' | 'aluno' | 'monitor' || 'professor';
    
    const userId = getCurrentUserId(tipoUsuario);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Configurações padrão de privacidade
    const privacidade = {
      perfilPublico: true,
      mostrarEstatisticas: true,
      receberEmails: true,
      notificacoesPush: false
    };

    return NextResponse.json(privacidade);
  } catch (error) {
    console.error('Erro ao buscar configurações de privacidade:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Permite trocar o tipo via query parameter para teste
    const { searchParams } = new URL(request.url);
    const tipoUsuario = searchParams.get('tipo') as 'professor' | 'aluno' | 'monitor' || 'professor';
    
    const userId = getCurrentUserId(tipoUsuario);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { perfilPublico, mostrarEstatisticas, receberEmails, notificacoesPush } = body;

    console.log('Configurações de privacidade atualizadas:', {
      userId,
      tipoUsuario,
      perfilPublico,
      mostrarEstatisticas,
      receberEmails,
      notificacoesPush
    });

    // Simular salvamento bem-sucedido
    return NextResponse.json({
      message: 'Configurações de privacidade atualizadas com sucesso',
      data: {
        perfilPublico,
        mostrarEstatisticas,
        receberEmails,
        notificacoesPush
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar configurações de privacidade:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}