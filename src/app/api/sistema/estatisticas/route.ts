import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { message: 'Token de autorização necessário' },
        { status: 401 }
      );
    }

    // Simulação de estatísticas do sistema
    const estatisticas = await obterEstatisticasSistema();
    
    return NextResponse.json(estatisticas);

  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Simulação das estatísticas do sistema
async function obterEstatisticasSistema() {
  // Em produção, estas seriam consultas reais ao banco de dados
  return {
    alunos: {
      total: Math.floor(Math.random() * 100) + 50,
      ativos: Math.floor(Math.random() * 80) + 40,
      ultimoAcesso: '2024-09-07T15:30:00Z'
    },
    professores: {
      total: Math.floor(Math.random() * 10) + 5,
      ativos: Math.floor(Math.random() * 8) + 3
    },
    turmas: {
      total: Math.floor(Math.random() * 20) + 8,
      ativas: Math.floor(Math.random() * 15) + 5
    },
    listas: {
      total: Math.floor(Math.random() * 30) + 15,
      publicas: Math.floor(Math.random() * 25) + 10
    },
    questoes: {
      total: Math.floor(Math.random() * 200) + 100,
      publicas: Math.floor(Math.random() * 150) + 80
    },
    submissoes: {
      total: Math.floor(Math.random() * 1000) + 500,
      ultimaSemana: Math.floor(Math.random() * 100) + 50,
      aceitas: Math.floor(Math.random() * 600) + 300
    },
    casosTeste: {
      total: Math.floor(Math.random() * 500) + 250
    },
    armazenamento: {
      submissoes: `${(Math.random() * 5 + 1).toFixed(1)} GB`,
      backups: `${(Math.random() * 2 + 0.5).toFixed(1)} GB`,
      total: `${(Math.random() * 8 + 2).toFixed(1)} GB`
    },
    sistema: {
      versao: '2.1.4',
      uptime: '15 dias, 7 horas',
      ultimoBackup: '2024-09-07T02:00:00Z',
      proximoBackup: '2024-09-08T02:00:00Z'
    }
  };
}

/*
// EM PRODUÇÃO, SERIA ALGO ASSIM:
async function obterEstatisticasReais() {
  return {
    alunos: {
      total: await db.usuarios.count({ where: { tipo: 'aluno' } }),
      ativos: await db.usuarios.count({ 
        where: { 
          tipo: 'aluno', 
          ultimoAcesso: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      })
    },
    professores: {
      total: await db.usuarios.count({ where: { tipo: 'professor' } }),
      ativos: await db.usuarios.count({ 
        where: { 
          tipo: 'professor', 
          ultimoAcesso: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      })
    },
    turmas: {
      total: await db.turmas.count(),
      ativas: await db.turmas.count({ where: { ativa: true } })
    },
    listas: {
      total: await db.listas.count(),
      publicas: await db.listas.count({ where: { publica: true } })
    },
    questoes: {
      total: await db.questoes.count(),
      publicas: await db.questoes.count({ where: { publica: true } })
    },
    submissoes: {
      total: await db.submissoes.count(),
      ultimaSemana: await db.submissoes.count({
        where: { criadaEm: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
      }),
      aceitas: await db.submissoes.count({ where: { status: 'ACEITO' } })
    },
    casosTeste: {
      total: await db.casosTeste.count()
    }
  };
}
*/
