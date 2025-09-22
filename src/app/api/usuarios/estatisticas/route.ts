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

    // Estatísticas específicas por tipo de usuário
    let estatisticas;
    
    if (tipoUsuario === 'professor') {
      estatisticas = {
        totalTurmas: 3,
        totalEstudantes: 45,
        totalListas: 12,
        totalSubmissoes: 234,
        taxaSucessoGeral: 78.5,
        estudantesAtivos: 38
      };
    } else if (tipoUsuario === 'aluno') {
      estatisticas = {
        totalSubmissoes: 28,
        submissoesAceitas: 22,
        totalListas: 8,
        listasCompletas: 6,
        taxaSucesso: 78.5,
        posicaoRanking: 5
      };
    } else if (tipoUsuario === 'monitor') {
      estatisticas = {
        totalTurmas: 2,
        totalEstudantes: 30,
        totalListas: 5,
        totalSubmissoes: 156,
        taxaSucessoGeral: 82.1,
        estudantesAtivos: 25
      };
    }

    return NextResponse.json(estatisticas);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}