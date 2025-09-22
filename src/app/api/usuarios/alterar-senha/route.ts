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

export async function POST(request: NextRequest) {
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
    const { senhaAtual, novaSenha } = body;

    // Validações básicas
    if (!senhaAtual || !novaSenha) {
      return NextResponse.json(
        { error: 'Senha atual e nova senha são obrigatórias' },
        { status: 400 }
      );
    }

    if (novaSenha.length < 6) {
      return NextResponse.json(
        { error: 'A nova senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Em uma implementação real, aqui você verificaria a senha atual
    // e salvaria a nova senha hasheada no banco de dados
    
    console.log('Alteração de senha solicitada para usuário:', userId, 'tipo:', tipoUsuario);

    // Simular verificação de senha (aceitar qualquer senha por enquanto)
    return NextResponse.json({
      message: 'Senha alterada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}